import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useMemo, useRef } from "react";

const STORAGE_KEY = "cly-excalidraw-scene-v1";
const SAVE_DELAY_MS = 500;

// 只持久化可序列化、且对重新打开画布有意义的 AppState 字段。
// 故意排除 collaborators（Map）等运行时对象。
const PERSISTED_APP_STATE_KEYS = [
  "viewBackgroundColor",
  "gridSize",
  "gridStep",
  "gridModeEnabled",
  "currentItemStrokeColor",
  "currentItemBackgroundColor",
  "currentItemFillStyle",
  "currentItemStrokeWidth",
  "currentItemStrokeStyle",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemTextAlign",
  "currentItemStartArrowhead",
  "currentItemEndArrowhead",
  "scrollX",
  "scrollY",
  "zoom",
  "theme"
];

function loadInitialData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.elements)) return null;
    return {
      elements: saved.elements,
      appState:
        saved.appState && typeof saved.appState === "object"
          ? saved.appState
          : {},
      files:
        saved.files && typeof saved.files === "object" ? saved.files : {},
      scrollToContent: false
    };
  } catch (error) {
    console.warn("[draw] 读取本地白板失败，已从空白画布开始。", error);
    return null;
  }
}

function pickAppState(appState) {
  const picked = {};
  for (const key of PERSISTED_APP_STATE_KEYS) {
    const value = appState?.[key];
    if (value === undefined) continue;
    if (value instanceof Map || value instanceof Set) continue;
    picked[key] = value;
  }
  return picked;
}

export default function App() {
  const initialData = useMemo(loadInitialData, []);
  const latestScene = useRef(null);
  const saveTimer = useRef(null);

  const persist = useCallback(() => {
    const scene = latestScene.current;
    if (!scene) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          elements: scene.elements,
          appState: pickAppState(scene.appState),
          files: scene.files
        })
      );
    } catch (error) {
      console.warn(
        "[draw] 本地自动保存失败（可能超出 localStorage 容量），请用菜单导出 .excalidraw 备份。",
        error
      );
    }
  }, []);

  const handleChange = useCallback(
    (elements, appState, files) => {
      latestScene.current = { elements, appState, files };
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
      }
      saveTimer.current = window.setTimeout(() => {
        saveTimer.current = null;
        persist();
      }, SAVE_DELAY_MS);
    },
    [persist]
  );

  useEffect(() => {
    const flush = () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      persist();
    };

    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persist]);

  return (
    <main className="draw-shell" aria-label="Excalidraw 白板">
      <Excalidraw
        langCode="zh-CN"
        initialData={initialData}
        onChange={handleChange}
        name="CLY-白板"
      />
    </main>
  );
}

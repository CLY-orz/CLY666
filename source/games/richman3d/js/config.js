// ============ 大富翁3D · 游戏配置 ============
// 棋盘 52 格（14×14 环线，顺时针）：16 个色组 × 2 城 = 32 座城市。
// 同组两城分布在棋盘对侧（相距 26 格），相邻格子避免同类色系，色系均匀散开。
// 数值基准：经典 Monopoly ×10 → ¥，起点工资 ¥3000。

export const GRID = 14;
export const CELL = 210;           // 贴图像素（格子放大，文字更清晰）
export const TILE_COUNT = 52;
export const START_MONEY = 15000;
export const GO_BONUS = 3000;
export const JAIL_BAIL = 500;
export const JAIL_TILE = 13;
export const GOTO_JAIL_TILE = 39;
export const INCOME_TAX = 1500;
export const LUXURY_TAX = 800;
export const FREE_PARKING_BONUS = 800;
export const MAX_HOUSES = 5;       // 1-4 房屋, 5 = 酒店
export const STEAL_AMOUNT = 800;
export const ROADBLOCK_MAX = 2;    // 每名玩家最多同时放置的路障

// 16 个色组：价格由低到高（色组内两城同价、租金两档）
export const GROUPS = {
  brown:     { color: '#8a5a33', house: 500,  label: '褐色' },
  lgreen:    { color: '#9ccc65', house: 500,  label: '青绿' },
  lblue:     { color: '#53b9ea', house: 500,  label: '浅蓝' },
  cyan:      { color: '#26b7c4', house: 1000, label: '天青' },
  pink:      { color: '#e4409a', house: 1000, label: '粉红' },
  purple:    { color: '#9b59d0', house: 1000, label: '紫色' },
  orange:    { color: '#f7941e', house: 1000, label: '橙色' },
  vermilion: { color: '#e8590c', house: 1500, label: '朱红' },
  red:       { color: '#ef3b45', house: 1500, label: '红色' },
  rose:      { color: '#d6336c', house: 1500, label: '玫红' },
  yellow:    { color: '#ffd23e', house: 1500, label: '黄色' },
  amber:     { color: '#e8a200', house: 2000, label: '琥珀' },
  green:     { color: '#22b563', house: 2000, label: '绿色' },
  jade:      { color: '#0da574', house: 2000, label: '青玉' },
  blue:      { color: '#2f6fd6', house: 2000, label: '蓝色' },
  navy:      { color: '#1e3f8f', house: 2000, label: '深蓝' },
};

// 租金阶梯生成：低档保持经典 5/15/45/80/125 倍率，高档放缓
const rent = (b) => {
  const mul = b <= 140 ? [1, 5, 15, 45, 80, 125] : [1, 4, 10, 20, 30, 40];
  return mul.map(m => Math.round((b * m) / 10) * 10);
};
// landmark = 地标绘制键, landmarkName = 地标名称（显示在地契上）
const P = (idx, name, group, price, b, landmark, landmarkName) =>
  ({ idx, type: 'prop', name, group, price, rent: rent(b), landmark, landmarkName });

// 棋盘布局（顺时针）：下边 → 监狱(0,13) → 左边 → 免费停留(0,0) → 上边 → 直达监狱(13,0) → 右边。
// 同组两城相隔 26 格；冷色/暖色交替排布。
export const TILES = (() => {
  const t = new Array(TILE_COUNT);
  t[0]  = { idx: 0, type: 'go', name: '起点' };
  t[1]  = P(1, '大连', 'lblue', 1000, 60, 'shell', '贝壳博物馆');
  t[2]  = { idx: 2, type: 'rail', name: '北京南站', price: 2000, rents: [250, 500, 1000, 2000] };
  t[3]  = P(3, '保定', 'brown', 600, 20, 'zhili', '直隶总督署');
  t[4]  = { idx: 4, type: 'chance', name: '机会' };
  t[5]  = P(5, '南通', 'purple', 1500, 120, 'dianshita', '南通电视塔');
  t[6]  = P(6, '苏州', 'orange', 1800, 140, 'dongfangzhimen', '东方之门');
  t[7]  = P(7, '襄阳', 'lgreen', 700, 40, 'xiangyang', '仲宣楼');
  t[8]  = { idx: 8, type: 'tax', name: '所得税', amount: INCOME_TAX };
  t[9]  = P(9, '南京', 'red', 2200, 180, 'zhongshanling', '中山陵');
  t[10] = P(10, '宁波', 'cyan', 1100, 80, 'tianyige', '天一阁');
  t[11] = P(11, '郑州', 'yellow', 2600, 220, 'erqita', '二七纪念塔');
  t[12] = { idx: 12, type: 'event', name: '事件' };
  t[13] = { idx: 13, type: 'jail', name: '监狱' };
  t[14] = { idx: 14, type: 'rail', name: '上海虹桥站', price: 2000, rents: [250, 500, 1000, 2000] };
  t[15] = P(15, '成都', 'green', 3000, 260, 'chengduta', '天府熊猫塔');
  t[16] = P(16, '天津', 'vermilion', 2000, 160, 'zhilun', '天津之眼');
  t[17] = { idx: 17, type: 'chance', name: '机会' };
  t[18] = P(18, '北京', 'blue', 3500, 350, 'gugong', '故宫');
  t[19] = P(19, '西安', 'rose', 2400, 200, 'dayanta', '大雁塔');
  t[20] = P(20, '深圳', 'jade', 3200, 280, 'pingan', '平安金融中心');
  t[21] = P(21, '福州', 'amber', 2800, 240, 'baita', '白塔');
  t[22] = { idx: 22, type: 'event', name: '事件' };
  t[23] = P(23, '香港', 'navy', 4000, 400, 'zhongyin', '中银大厦');
  t[24] = P(24, '无锡', 'pink', 1400, 100, 'dafo', '灵山大佛');
  t[25] = { idx: 25, type: 'util', name: '国家电网', price: 1500 };
  t[26] = { idx: 26, type: 'parking', name: '免费停留' };
  t[27] = P(27, '青岛', 'lblue', 1000, 80, 'zhanqiao', '栈桥回澜阁');
  t[28] = { idx: 28, type: 'rail', name: '广州南站', price: 2000, rents: [250, 500, 1000, 2000] };
  t[29] = P(29, '洛阳', 'brown', 600, 40, 'longmen', '龙门石窟');
  t[30] = { idx: 30, type: 'chance', name: '机会' };
  t[31] = P(31, '嘉兴', 'purple', 1500, 140, 'hongchuan', '南湖红船');
  t[32] = P(32, '杭州', 'orange', 1800, 160, 'leifengta', '雷峰塔');
  t[33] = P(33, '桂林', 'lgreen', 700, 60, 'xiangbi', '象鼻山');
  t[34] = { idx: 34, type: 'tax', name: '奢侈税', amount: LUXURY_TAX };
  t[35] = P(35, '武汉', 'red', 2200, 200, 'huanghelou', '黄鹤楼');
  t[36] = P(36, '厦门', 'cyan', 1100, 100, 'shuangzita', '双子塔');
  t[37] = P(37, '合肥', 'yellow', 2600, 240, 'qingfengge', '清风阁');
  t[38] = { idx: 38, type: 'event', name: '事件' };
  t[39] = { idx: 39, type: 'gotojail', name: '直达监狱' };
  t[40] = { idx: 40, type: 'rail', name: '成都东站', price: 2000, rents: [250, 500, 1000, 2000] };
  t[41] = P(41, '广州', 'green', 3000, 280, 'guangzhouta', '广州塔');
  t[42] = P(42, '长沙', 'vermilion', 2000, 180, 'aiwanting', '爱晚亭');
  t[43] = { idx: 43, type: 'chance', name: '机会' };
  t[44] = P(44, '上海', 'blue', 3500, 400, 'dongfangmingzhu', '东方明珠');
  t[45] = P(45, '重庆', 'rose', 2400, 220, 'jiefangbei', '解放碑');
  t[46] = P(46, '沈阳', 'jade', 3200, 300, 'shenyangpalace', '沈阳故宫');
  t[47] = P(47, '昆明', 'amber', 2800, 260, 'jinmafang', '金马碧鸡坊');
  t[48] = { idx: 48, type: 'event', name: '事件' };
  t[49] = P(49, '澳门', 'navy', 4000, 500, 'dasanba', '大三巴牌坊');
  t[50] = P(50, '常州', 'pink', 1400, 120, 'tianningta', '天宁寺塔');
  t[51] = { idx: 51, type: 'util', name: '三峡水电', price: 1500 };
  return t;
})();

// 格子坐标：index → {col,row}；贴图约定：canvas 顶部 = 棋盘远端，底部 = 近端。
export function tileGrid(i) {
  if (i < 13) return { col: 13 - i, row: 13 };  // 下边：右→左
  if (i === 13) return { col: 0, row: 13 };     // 监狱
  if (i < 26) return { col: 0, row: 26 - i };   // 左边：下→上
  if (i === 26) return { col: 0, row: 0 };      // 免费停留
  if (i < 39) return { col: i - 26, row: 0 };   // 上边：左→右
  if (i === 39) return { col: 13, row: 0 };     // 直达监狱
  return { col: 13, row: i - 39 };              // 右边：上→下
}
export function tileWorld(i) {
  const g = tileGrid(i);
  return { x: g.col - 6.5, z: g.row - 6.5 };
}

// ---------- 机会卡 / 事件卡（各 8 张） ----------
// kind: money / perPlayer / perHouse / move / moveTo / gotoJail / item / moveToNearestRail
const _C = (text, kind, v = 0, extra = {}) => ({ text, kind, v, ...extra });
export const CHANCE_CARDS = [
  _C('前进至「起点」，领取 ¥3000 过路工资！', 'moveTo', 0, { collect: true }),
  _C('直达「澳门」，若无人购买可直接买下！', 'moveTo', 49),
  _C('银行发放红利，获得 ¥1500！', 'money', 1500),
  _C('去看牙医，支付 ¥500 诊疗费。', 'money', -500),
  _C('获得「出狱卡」一张，好运伴身！', 'item', 0, { item: 'bail' }),
  _C('前进至最近的车站。', 'moveToNearestRail'),
  _C('房屋年检：每栋房屋缴纳维修费 ¥250。', 'perHouse', -250),
  _C('获得「遥控骰子」一张！', 'item', 0, { item: 'remote' }),
];
export const EVENT_CARDS = [
  _C('股票大涨！分红 ¥1000。', 'money', 1000),
  _C('住院治疗，支付 ¥600 医疗费。', 'money', -600),
  _C('彩票中奖 ¥2000！运气爆棚！', 'money', 2000),
  _C('获得「免租金牌」一张！', 'item', 0, { item: 'shield' }),
  _C('前进至「起点」，领取 ¥3000 过路工资！', 'moveTo', 0, { collect: true }),
  _C('获得「路障」一个！', 'item', 0, { item: 'block' }),
  _C('缴纳学费 ¥600，活到老学到老。', 'money', -600),
  _C('风水欠佳，直接进入监狱反省。', 'gotoJail'),
];

// ---------- 道具卡 ----------
export const ITEMS = {
  remote: { name: '遥控骰子', desc: '指定本次掷出点数（2~12），点数随心所欲！', color: '#e8442e' },
  boost:  { name: '加速卡',   desc: '本次掷骰移动步数 +2，快人一步！', color: '#2f6fd6' },
  shield: { name: '免租金牌', desc: '自动抵挡一次他人收取的租金。', color: '#2f9e44' },
  bail:   { name: '出狱卡',   desc: '免坐牢一次，或直接从监狱中获释。', color: '#f7941e' },
  block:  { name: '路障',     desc: '放在前方 1~9 格，路过的对手会被拦停。', color: '#e8590c' },
  steal:  { name: '劫富卡',   desc: '从最富有的对手处抢走 ¥800。', color: '#7950f2' },
};
export const START_ITEMS = { remote: 1, shield: 1 };

// ---------- 角色 ----------
export const CHARS = [
  { id: 'xiaomei', name: '小美', outfit: '#e8384f', outfit2: '#f6c445', skin: '#ffe3c8', hair: '#2b1b12', style: 'buns',     scale: 0.95 },
  { id: 'atu',     name: '阿土', outfit: '#8a6d3b', outfit2: '#5b7f3a', skin: '#e8b98a', hair: '#d9dde2', style: 'strawhat', scale: 1.03 },
  { id: 'furen',   name: '夫人', outfit: '#8e4fd6', outfit2: '#e9c46a', skin: '#ffe0c4', hair: '#241a33', style: 'bun',      scale: 0.98 },
  { id: 'beibei',  name: '贝贝', outfit: '#ff8fb1', outfit2: '#ffffff', skin: '#ffe6d5', hair: '#5a3a22', style: 'baby',     scale: 0.82 },
  { id: 'along',   name: '阿隆', outfit: '#2f6fd6', outfit2: '#f2f2f2', skin: '#d9a066', hair: '#241a12', style: 'turban',   scale: 1.05 },
  { id: 'tailang', name: '太郎', outfit: '#2f9e44', outfit2: '#1b1b1b', skin: '#ffe3c8', hair: '#1b1b1b', style: 'band',     scale: 0.92 },
  { id: 'guyu',    name: '谷雨', outfit: '#43a98c', outfit2: '#ffd23e', skin: '#f6f1ea', hair: '#f6f1ea', style: 'cat',      scale: 0.95 },
  { id: 'jiujiu',  name: '啾啾', outfit: '#ff8a3d', outfit2: '#e8442e', skin: '#faf6f0', hair: '#faf6f0', style: 'dog',      scale: 0.95 },
];

// 玩家标识色（面板使用角色主色）
export const PLAYER_COLORS = ['#e8384f', '#8a6d3b', '#8e4fd6', '#ff8fb1', '#2f6fd6', '#2f9e44', '#43a98c', '#ff8a3d'];

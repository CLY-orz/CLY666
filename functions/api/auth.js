export async function onRequest(context) {
  const { env, request } = context;
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = `${new URL(request.url).origin}/api/callback`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  return Response.redirect(authUrl, 302);
}

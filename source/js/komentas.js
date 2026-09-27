(function() {
  const v = new Date().toISOString().slice(0,13).replace(/[-T:]/g,'') + '00';
  const script = document.createElement('script');
  script.src = 'https://cdn.komentas.com/komentas-widget.umd.js?v=' + v;
  script.onload = function() {
    window.KomentasWidget.init({
      apiUrl: 'https://api.komentas.com',
      portalUrl: 'https://portal.komentas.com',
      projectId: '1fd0abf1-0c6a-423e-95e7-0af232de1ba2',
      articleUrl: window.location.href,
      articleTitle: document.title,
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        borderRadius: '8px'
      },
      allowAnonymous: true,
      enableReactions: true,
      reactionsOnlyMode: false,
      showArticleReactions: false,
      availableEmotions: ["like","dislike","love","laugh"],
      sortBy: 'newest',
      showLogoutButton: true,
      oauthProviders: ["google","github","microsoft-entra-id","apple","linkedin"]
    });
  };
  document.head.appendChild(script);
})();
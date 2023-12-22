export const settings = {
  baseUrl: 'https://crab.dev.dataunion.app/',
  baseUrl20: 'http://34.132.121.53:80/',  // Cleanapp Google Cloud
  baseLocalUrl: 'http://192.168.86.122:8080/',  // Cleanapp Local
  v2api: {
    updateOrCreateUser: 'update_or_create_user',
    updatePrivacyAndToc: 'update_privacy_and_toc',
    report: 'report',
    getMap: 'get_map',
    readReport: 'read_report',
    readReferral: 'read_referral',
    generateReferral: 'generate_referral',
    getTeams: 'get_teams',
    getTopScores: 'get_top_scores',
    getStats: 'get_stats',
  },

  //Authentification
  auth: {
    refreshToken: 'refresh',
    login: 'login',
    logout: 'logout',
    get_nounce: 'get-nonce?public_address=$[public_address]',
    register: 'register',
    user_name: 'get_or_create_username',
    usageFlag: 'usage-flag',
    change_user_name: 'update_username',
  },
};

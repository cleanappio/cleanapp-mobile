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
  },

  taxonomy: {
    globalStats: 'api/v1/metadata/global-success-rate',
    clientStats: 'api/v1/stats/success-rate',
    overall:
      'api/v1/stats/overall-graph?end_date=$[end_date]&start_date=$[start_date]',
    userStats:
      'api/v1/stats/user-graph?start_date=$[start_date]&end_date=$[end_date]',
    SuccessRate: 'api/v1/stats/success-rate',
  },

  metadata: {
    queryTags: 'api/v1/query-tags',
    myMetadata: 'api/get/my-metadata',
    getTags: 'staticdata/tags?type=$[word_type]',
    shareDataLive: 'api/v1/metadata/share-data-live',
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

  queryView: {
    userRank:
      'api/v1/other/query-view?design-doc=ncight&view=user-ranks&query-type=all',
  },
  other: {
    notifications: 'api/v1/other/notifications',
  },
  guild: {
    getGuildByGuildId: 'api/v1/guild/?guild_id=$[GUILD_ID]',
  },
  reward: {
    get_reward_status: 'api/v1/rewards/litterbux/status',
    next_claim_time: 'api/v1/rewards/litterbux/claim-time',
  },
};

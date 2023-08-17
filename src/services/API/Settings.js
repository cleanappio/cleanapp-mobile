export const settings = {
  baseUrl: 'https://crab.dev.dataunion.app/',
  taxonomy: {
    getImages: 'api/v1/metadata/search-images-by-tags',
    storeUserResponse: '/api/v1/taxonomy/store',
    getImage: 'api/v1/get-image-by-id?id=$[image_id]',
    getLabelImage: 'api/v1/taxonomy/label?label_id=$[label_id]',
    globalStats: 'api/v1/metadata/global-success-rate',
    clientStats: 'api/v1/stats/success-rate',
    overall:
      'api/v1/stats/overall-graph?end_date=$[end_date]&start_date=$[start_date]',
    userStats:
      'api/v1/stats/user-graph?start_date=$[start_date]&end_date=$[end_date]',
    uploadImage: 'api/v1/upload-file',
    updateAnnotation: 'api/v1/update-annotation',
    annotateImage: 'api/v1/annotate',
    getRomanNumberStats: '/api/v1/stats/tags?bounty=roman-letter-bounty',
    SuccessRate: 'api/v1/stats/success-rate',
  },

  metadata: {
    queryMetadata: 'api/v1/query-metadata',
    getImageById: 'api/v1/get-image-by-id?id=$[image_id]',
    queryTags: 'api/v1/query-tags',
    annotate: 'api/v1/metadata/annotation',
    reportImages: 'api/v1/report-images',
    verifyImage: 'api/v1/verify-image',
    myMetadata: 'api/get/my-metadata',
    getTags: 'staticdata/tags?type=$[word_type]',
    shareDataLive: 'api/v1/metadata/share-data-live',
    searchImagesByLocation:
      '/api/v1/search-images-by-location?latitude=$[latitude]&longitude=$[longitude]&range=$[range]',
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

  user: {
    referral_id: 'api/v1/user/referral-id',
  },
  queryView: {
    userRank:
      'api/v1/other/query-view?design-doc=ncight&view=user-ranks&query-type=all',
  },
  other: {
    notifications: 'api/v1/other/notifications',
    startTutorial: 'api/v1/other/start-tutorial',
    team_status: 'api/v1/other/team_status',
  },
  guild: {
    createGuild: 'api/v1/guild/create',
    joinGuild: 'api/v1/guild/join?guild_id=$[GUILD_ID]',
    leaveGuild: 'api/v1/guild/leave?guild_id=$[GUILD_ID]',
    getGuildByGuildId: 'api/v1/guild/?guild_id=$[GUILD_ID]',
    getGuildList: 'api/v1/guild/list',
    userrank: 'api/v1/guild/user-rank',
    getGuildImage: 'api/v1/guild/get-image-by-id?id=$[GUILD_ID]',
  },
  reward: {
    get_reward_status: 'api/v1/rewards/litterbux/status',
    next_claim_time: 'api/v1/rewards/litterbux/claim-time',
  },
};

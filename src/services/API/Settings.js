export const settings = {
  baseUrl: 'https://crab.ncight.dataunion.app/',

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

  alchemy: {
    key: 'https://eth-ropsten.alchemyapi.io/v2/z5z5j5QhacIsJ9zlbpsOxTBR_TAvIcn2',
    getNfts: 'https://eth-ropsten.g.alchemy.com/demo/v1/getNFTs?owner=$[owner]',
    getNFTMetadata:
      'https://eth-ropsten.g.alchemy.com/demo/v1/getNFTMetadata?contractAddress=$[contractAddress]&tokenId=$[tokenId]&tokenType=erc721&refreshCache=true',
  },
  pinata: {
    key: '819593f12b19ebc0c341',
    secret: 'e2176bd2a3549588cfc624d36742003c81e1bf9dc80cab59a67dbc509df9fcaa',
    pinFileToIPFS: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    pinJSONToIPFS: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
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
  },
};

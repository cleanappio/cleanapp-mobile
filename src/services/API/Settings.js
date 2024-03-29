import Config from 'react-native-config';

export const settings = {
  prod: {  // Cleanapp Google Cloud Prod
    apiUrl: 'http://api.cleanapp.io:8080',
    webUrl: 'http://app.cleanapp.io:3000'
  },
  dev: {  // Cleanapp Google Cloud Dev
    apiUrl: 'http://dev.api.cleanapp.io:8080',
    webUrl: 'http://dev.app.cleanapp.io:3000'
  },
  local: {  // Cleanapp Local
    apiUrl: 'http://192.168.86.124:8080',
    webUrl: 'http://192.168.86.124:3000',
  },
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
};

export const getUrls = () => {
  switch (Config.APP_MODE) {
    case 'local':
      return settings.local;
    case 'dev':
      return settings.dev;
    case 'prod':
      return settings.prod;
  }
};
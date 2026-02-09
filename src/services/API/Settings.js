import Config from 'react-native-config';
import { getBlockchainLink } from './APIManager';

export const settings = {
  prod: {  // Cleanapp Google Cloud Prod
    apiUrl: 'https://api.cleanapp.io',
    webUrl: 'https://cleanapp.io',
    mapUrl: 'https://embed.cleanapp.io',
    liveUrl: 'https://live.cleanapp.io',
    processingUrl: 'https://processing.cleanapp.io'
  },
  dev: {  // Cleanapp Google Cloud Dev
    apiUrl: 'http://dev.api.cleanapp.io:8080',
    webUrl: 'https://dev.cleanapp.io',
    mapUrl: 'https://devembed.cleanapp.io',
    liveUrl: 'https://devlive.cleanapp.io',
    processingUrl: 'https://devprocessing.cleanapp.io'
  },
  local: {  // Cleanapp Local
    // URLs need to be tweaked dependent on the local environment
    apiUrl: 'http://192.168.86.125:8080',
    webUrl: 'http://192.168.86.125:3000',
    mapUrl: 'https://devembed.cleanapp.io',
    liveUrl: 'https://devlive.cleanapp.io',
    processingUrl: 'https://devprocessing.cleanapp.io'
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
    getBlockchainLink: 'get_blockchain_link',
    createOrUpdateArea: 'create_or_update_area',
    getArea: 'get_areas',
  },
  v3api: {
    getReportsByLatLon: 'get_reports_by_lat_lon',
  },
  apiSettings: {
    sendingAttempts: 3,
  }
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
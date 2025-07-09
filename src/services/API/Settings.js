import Config from 'react-native-config';
import { getBlockchainLink } from './APIManager';

export const settings = {
  prod: {  // Cleanapp Google Cloud Prod
    apiUrl: 'http://api.cleanapp.io:8080',
    webUrl: 'http://app.cleanapp.io:3000',
    mapUrl: 'https://embed.cleanapp.io'
  },
  dev: {  // Cleanapp Google Cloud Dev
    apiUrl: 'http://dev.api.cleanapp.io:8080',
    webUrl: 'http://dev.app.cleanapp.io:3000',
    mapUrl: 'https://devembed.cleanapp.io'
  },
  local: {  // Cleanapp Local
    // URLs need to be tweaked dependent on the local environment
    apiUrl: 'http://192.168.86.125:8080',
    webUrl: 'http://192.168.86.125:3000',
    mapUrl: 'https://devembed.cleanapp.io'
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
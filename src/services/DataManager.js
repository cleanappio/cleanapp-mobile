import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

const KEYS = {
  PRIVACY_SETTING: 'PRIVACY_SETTING',
  ACCEPTED_PRIVACY_AND_TERMS: 'ACCEPTED_PRIVACY_AND_TERMS',
  USER_INFO: 'USER_INFO',
  LAST_ACTIVITY: 'LAST_ACTIVITY',
  AUTH_TOKEN: 'AUTH_TOKEN',
  WALLET_KEY: '@save_Keys',
  LANGUAGE: 'LANGUAGE',
  DATA_USAGE_FLAG: 'DATA_USAGE_FLAG',
  USER_NAME: 'USER_NAME',
  WALLET_TYPE: 'WALLET_TYPE',
  WALLETADDRESS_KEY: 'WALLETADDRESS_KEY',
  FIRST_RUN_KEY: 'FIRST_RUN_KEY',
  CURRENCY_SETTINGS: 'CURRENCY_SETTINGS',
  HAS_REWARDS: 'HAS_REWARDS',
  USER_LOCATION: 'USER_LOCATION',
  CACHE_VAULT: 'CACHE_VAULT',
  MAP_LOCATION: 'MAP_LOCATION',
  REPORTS: 'REPORTS',
  PLAYERS: 'PLAYERS',
  GUILDS: 'GUILDS',
  REFERRAL_KEY: 'REFERRAL_KEY',
  REFERRAL: 'REFERRAL',
  TEAM: 'TEAM',
  NOTIFIED_REPORTS: 'NOTIFIED_REPORTS',
  OPENED_REPORTS: 'OPENED_REPORTS',
};

export const setUserInfo = async userDetails => {
  try {
    await AsyncStorage.setItem(KEYS.USER_INFO, JSON.stringify(userDetails));
  } catch (err) {
    return null;
  }
};

export const getUserInfo = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.USER_INFO);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};
export const setUserName = async userDetails => {
  try {
    await AsyncStorage.setItem(KEYS.USER_NAME, JSON.stringify(userDetails));
  } catch (err) {
    return null;
  }
};
export const getUserName = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.USER_NAME);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const setPrivacySetting = async privacyValue => {
  try {
    await AsyncStorage.setItem(KEYS.PRIVACY_SETTING, String(privacyValue));
    return true;
  } catch (err) {
    return false;
  }
};

export const getPrivacySetting = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.PRIVACY_SETTING);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {
    return null;
  }
};

export const setPrivacyAndTermsAccepted = async () => {
  try {
    await AsyncStorage.setItem(KEYS.ACCEPTED_PRIVACY_AND_TERMS, '1');
    return true;
  } catch (err) {
    return false;
  }
};

export const isPrivacyAndTermsAccepted = async () => {
  try {
    const response = await AsyncStorage.getItem(
      KEYS.ACCEPTED_PRIVACY_AND_TERMS,
    );
    if (response && response === '1') {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const setDataUsageFlag = async () => {
  try {
    await AsyncStorage.setItem(KEYS.DATA_USAGE_FLAG, '1');
    return true;
  } catch (err) {
    return false;
  }
};

export const getDataUsageFlag = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.DATA_USAGE_FLAG);
    if (response && response === '1') {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const setLastActivity = async () => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_ACTIVITY, JSON.stringify(new Date()));
  } catch (err) {
    return null;
  }
};

export const getLastActivity = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.LAST_ACTIVITY);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const setAuthToken = async authToken => {
  try {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, JSON.stringify(authToken));
  } catch (err) {
    return null;
  }
};

export const getAuthToken = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const walletKeys = {
  password: '',
  seedPhrase: '',
  publicKey: '',
  privateKey: '',
  ethBal: '',
  oceanBal: '',
  phecorBal: '',
};

export const setWalletData = async walletData => {
  try {
    await AsyncStorage.setItem(KEYS.WALLET_KEY, JSON.stringify(walletData));
  } catch (err) {
    return null;
  }
};

export const getWalletData = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.WALLET_KEY);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const setWalletAddress = async walletData => {
  try {
    await AsyncStorage.setItem(
      KEYS.WALLETADDRESS_KEY,
      JSON.stringify(walletData),
    );
  } catch (err) {
    return null;
  }
};

export const getWalletAddress = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.WALLETADDRESS_KEY);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};
export const removeWalletData = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.WALLET_KEY);
  } catch (err) {
    return null;
  }
};

export const getWalletType = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.WALLET_TYPE);
    if (response) {
      return JSON.parse(response);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const setWalletType = async type => {
  try {
    await AsyncStorage.setItem(KEYS.WALLET_TYPE, JSON.stringify(type));
  } catch (err) {
    return null;
  }
};

export const setLanguage = async language => {
  try {
    await AsyncStorage.setItem(KEYS.LANGUAGE, JSON.stringify(language));
    await i18next.changeLanguage(language);
  } catch (err) {
    return null;
  }
};

export const getLanguage = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.LANGUAGE);
    if (response) {
      return JSON.parse(response);
    }
    return 'en';
  } catch (err) {
    return 'en';
  }
};

export const getFirstRun = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.FIRST_RUN_KEY);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return {firstRun: false};
};

export const setFirstRun = async () => {
  try {
    await AsyncStorage.setItem(
      KEYS.FIRST_RUN_KEY,
      JSON.stringify({firstRun: true}),
    );
  } catch (err) {}
};

export const getCurrencySettings = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.CURRENCY_SETTINGS);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}

  return {rate: 1, currency: 'USD'};
};

export const setCurrencySettings = async (rate = 1, currency = 'USD') => {
  try {
    await AsyncStorage.setItem(
      KEYS.CURRENCY_SETTINGS,
      JSON.stringify({
        rate: rate,
        currency: currency,
      }),
    );
  } catch (err) {}
};

export const getRewardState = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.HAS_REWARDS);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}

  return false;
};

export const setRewardState = async hasReward => {
  try {
    await AsyncStorage.setItem(KEYS.HAS_REWARDS, JSON.stringify(hasReward));
  } catch (err) {}
};

export const getUserLocation = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.USER_LOCATION);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return null;
};

export const setUserLocation = async location => {
  try {
    await AsyncStorage.setItem(KEYS.USER_LOCATION, JSON.stringify(location));
  } catch (err) {}
};

//cache vault
export const getCacheVault = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.CACHE_VAULT);
  } catch (err) {}
  return {
    reports: 0,
    referrals: 0,
    offchainReports: 0,
    offchainReferrals: 0,
    onchainReports: 0,
    onchainReferrals: 0,
    onchainTotal: 0,
    offchainTotal: 0,
    total: 0,
  };
};

export const setCacheVault = async cacheInfo => {
  try {
    await AsyncStorage.setItem(KEYS.CACHE_VAULT, JSON.stringify(cacheInfo));
  } catch (err) {}
};

export const getMapLocation = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.MAP_LOCATION);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return {
    zoomLevel: 17,
    coordinates: [0, 0],
  };
};

export const setMapLocation = async mapLocation => {
  try {
    await AsyncStorage.setItem(KEYS.MAP_LOCATION, JSON.stringify(mapLocation));
  } catch (err) {}
};

export const getReports = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.REPORTS);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return [];
};

export const setReports = async reports => {
  try {
    await AsyncStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
  } catch (err) {}
};

export const getPlayers = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.PLAYERS);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return [];
};

export const setPlayers = async players => {
  try {
    await AsyncStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
  } catch (err) {}
};

export const getGuilds = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.GUILDS);
    if (response) {
      return JSON.parse(response);
    }
  } catch (err) {}
  return [];
};

export const setGuilds = async guilds => {
  try {
    await AsyncStorage.setItem(KEYS.GUILDS, JSON.stringify(guilds));
  } catch (err) {}
};

export const getReferralKey = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.REFERRAL_KEY);
  } catch (err) {
    return '';
  }
};

export const setReferralKey = async referralKey => {
  try {
    await AsyncStorage.setItem(KEYS.REFERRAL_KEY, referralKey);
  } catch (err) {}
};

export const getReferral = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.REFERRAL);
  } catch (err) {
    return '';
  }
};

export const setReferral = async referral => {
  try {
    await AsyncStorage.setItem(KEYS.REFERRAL, referral);
  } catch (err) {}
};

export const getTeam = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.TEAM);
  } catch (err) {
    return 0;
  }
};

export const setTeam = async team => {
  try {
    await AsyncStorage.setItem(KEYS.TEAM, team.toString());
  } catch (err) {}
};

export const getNotifiedReports = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.NOTIFIED_REPORTS);
    return response;
  } catch (err) {
    return null;
  }
};

export const setNotifiedReports = async NotifiedReports => {
  try {
    await AsyncStorage.setItem(
      KEYS.NOTIFIED_REPORTS,
      JSON.stringify(NotifiedReports),
    );
  } catch (err) {}
};

export const removeNotifiedReports = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.NOTIFIED_REPORTS);
  } catch (err) {}
};

export const getOpenedReports = async () => {
  try {
    const response = await AsyncStorage.getItem(KEYS.OPENED_REPORTS);
    return response;
  } catch (err) {
    return null;
  }
};

export const setOpenedReports = async openedReports => {
  try {
    await AsyncStorage.setItem(
      KEYS.OPENED_REPORTS,
      JSON.stringify(openedReports),
    );
  } catch (err) {}
};

export const removeOpenedReports = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.OPENED_REPORTS);
  } catch (err) {}
};

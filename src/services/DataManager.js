import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

const KEYS = {
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
};

export const setUserInfo = async (userDetails) => {
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
export const setUserName = async (userDetails) => {
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

export const setAuthToken = async (authToken) => {
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

export const setWalletData = async (walletData) => {
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

export const setWalletAddress = async (walletData) => {
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

export const setWalletType = async (type) => {
  try {
    await AsyncStorage.setItem(KEYS.WALLET_TYPE, JSON.stringify(type));
  } catch (err) {
    return null;
  }
};

export const setLanguage = async (language) => {
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

export const setRewardState = async (hasReward) => {
  try {
    await AsyncStorage.setItem(KEYS.HAS_REWARDS, JSON.stringify(hasReward));
  } catch (err) {}
};

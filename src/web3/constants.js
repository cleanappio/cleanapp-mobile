import Config from 'react-native-config';
/* Default HD path string for key generation from seed */
export const hdPathString = "m/44'/60'/0'/0";
/* keystore will be saved to local storage under this key */
export const localStorageKey = 'key';

export const ganachehost = 'http://localhost:7545';

export const rinkeby = `https://rinkeby.infura.io/v3/${Config.INFURA_KEY}`;
export const kovan = `https://kovan.infura.io/v3/${Config.INFURA_KEY}`;
export const ropsten = `https://ropsten.infura.io/v3/${Config.INFURA_KEY}`;
export const mainnet = `https://mainnet.infura.io/v3/${Config.INFURA_KEY}`;

export const Ether = (1.0e18).toString();
export const Gwei = (1.0e9).toString();

export const WALLETTYPE_LOCAL = 'LocalWallet';
export const WALLETTYPE_WC = 'WalletConnect';

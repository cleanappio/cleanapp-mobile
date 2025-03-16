import {
  setAuthToken,
  getWalletData,
  setWalletData,
  setUserName,
  setWalletType,
  setWalletAddress,
} from '../services/DataManager';
import { generatePassword } from './password';
import "react-native-get-random-values";
import '@ethersproject/shims';
import {ethers} from 'ethers';

export const WALLETTYPE_LOCAL = 'LocalWallet';
export const WALLETTYPE_WC = 'WalletConnect';

// LoginProc from local wallet
export const GetOrCreateLocalWallet = async () => {
  try {
    //check wallet
    let walletInfo = await getWalletData();
    var publicKey = '';
    var privateKey = '';
    var seedPhrase = '';
    if (walletInfo == null) {
      //create new wallet

      const wallet = ethers.Wallet.createRandom();
      privateKey = wallet.privateKey;
      publicKey = wallet.address;
      seedPhrase = wallet.mnemonic.phrase;
      password = generatePassword();

      await setWalletData({
        privateKey: privateKey,
        publicKey: publicKey,
        seedPhrase: seedPhrase,
        password: password,
      });
    } else {
      privateKey = walletInfo.privateKey;
      publicKey = walletInfo.publicKey;
    }
    await setWalletType(WALLETTYPE_LOCAL);
    await setWalletAddress(publicKey);
    return true;
  } catch (err) {
    console.error(err);
    return false;
    // error occur while login
  }
};

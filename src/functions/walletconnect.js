import 'react-native-get-random-values';
import '@ethersproject/shims';
import {ethers} from 'ethers';
import {getWalletData, setWalletData} from '../services/DataManager';
import {generatePassword} from './password';

const loadLocalWallet = async (web3, passphrase) => {
  try {
    //check wallet
    var publicKey = '';
    var privateKey = '';
    var seedPhrase = '';
    //create new wallet
    const wallet = ethers.Wallet.fromMnemonic(passphrase);
    privateKey = wallet.privateKey;
    publicKey = wallet.address;
    seedPhrase = wallet.mnemonic.phrase;

    await setWalletData({
      privateKey: privateKey,
      publicKey: publicKey,
      seedPhrase: seedPhrase,
      password: '',
    });
  } catch (err) {}
};

/**
 * Create Local Wallet
 * @returns wallet address
 */
export const createLocalWallet = async () => {
  try {
    //register to check account
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
  } catch (err) {
    // wallet connect error
    return null;
  }
  return publicKey;
};

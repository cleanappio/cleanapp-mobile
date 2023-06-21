import {ethers} from 'ethers';
import {getWalletData, setWalletData} from '../services/DataManager';

const loadLocalWallet = async (web3, passphrase) => {
  try {
    //check wallet
    let Web3 = web3.web3Instance;
    var publicKey = '';
    var privateKey = '';
    var seedPhrase = '';
    //create new wallet
    const wallet = ethers.Wallet.fromMnemonic(passphrase);
    privateKey = wallet.privateKey;
    publicKey = wallet.address;
    seedPhrase = wallet.mnemonic.phrase;

    let arr = new Uint8Array(20);
    // eslint-disable-next-line no-undef
    crypto.getRandomValues(arr);
    // eslint-disable-next-line no-undef
    let password = btoa(String.fromCharCode(...arr))
      .split('')
      .filter((value) => {
        return !['+', '/', '='].includes(value);
      })
      .slice(0, 10)
      .join('');
    await setWalletData({
      privateKey: privateKey,
      publicKey: publicKey,
      seedPhrase: seedPhrase,
      password: password,
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

      let arr = new Uint8Array(20);
      // eslint-disable-next-line no-undef
      crypto.getRandomValues(arr);
      // eslint-disable-next-line no-undef
      let password = btoa(String.fromCharCode(...arr))
        .split('')
        .filter((value) => {
          return !['+', '/', '='].includes(value);
        })
        .slice(0, 10)
        .join('');
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

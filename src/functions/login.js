import '../../global';
import '../../shim';
import {
  setAuthToken,
  getWalletData,
  setWalletData,
  setUserName,
  setWalletType,
  setWalletAddress,
} from '../services/DataManager';
import {userLogin, userRegister, getNounce} from '../services/API/APIManager';
import {ethers} from 'ethers';
import {WALLETTYPE_LOCAL, WALLETTYPE_WC} from '../web3/constants';

// logout From WalletConnect
export const LogoutFromWalletConnect = async (web3) => {
  await setAuthToken(null);
  await setUserName(null);
  await LoginProc(web3);
};

// Login From WalletConnect
// check WalletConnector connected
//
export const LoginFromWalletConnect = async (
  connector,
  web3,
  referralCode = '',
) => {
  try {
    if (connector) {
      let publicKey = '';
      let Web3 = web3.web3Instance;
      let nounce = '';

      if (!connector.connected) {
        const conn = await connector.connect();
        publicKey = await Web3.utils.toChecksumAddress(conn.accounts[0]);
      } else {
        publicKey = await Web3.utils.toChecksumAddress(connector.accounts[0]);
      }

      // user register
      let registerResponse = await userRegister(publicKey, referralCode);
      if (registerResponse && registerResponse.username) {
        await setUserName({userName: registerResponse.username});
      } else {
        await setUserName({userName: ''});
      }
      if (registerResponse && registerResponse.status == 'success') {
        //first time register
        nounce = registerResponse.nonce;
      } else {
        //already registered
        let nonceResponse = await getNounce(publicKey);
        nounce = nonceResponse.nonce;
      }

      // delegate WalletConnect for signature
      var params = [
        publicKey,
        Web3.utils.utf8ToHex(nounce.toString()).toString(),
      ];
      const signature = await connector.signPersonalMessage(params);
      if (signature) {
        // user login
        let loginResponse = await userLogin(publicKey, signature);

        if (
          loginResponse &&
          loginResponse.access_token &&
          loginResponse.refresh_token
        ) {
          await setWalletType(WALLETTYPE_WC);
          await setWalletAddress(publicKey);
          // set auth token
          await setAuthToken({
            refresh_token: loginResponse.refresh_token,
            access_token: loginResponse.access_token,
          });
          return loginResponse;
        }
      }
    }
  } catch (e) {}

  return null;
};

// LoginProc from local wallet
export const LoginProc = async (web3, referralCode = '') => {
  try {
    //register to check account
    var nounce = '';
    var signature = '';
    //check wallet
    let walletInfo = await getWalletData();
    let Web3 = web3.web3Instance;
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
    let registerResponse = await userRegister(publicKey, referralCode);

    if (registerResponse && registerResponse.username) {
      await setUserName({userName: registerResponse.username});
    } else {
      await setUserName({userName: ''});
    }

    if (registerResponse && registerResponse.status === 'success') {
      nounce = registerResponse.nonce;
    } else {
      //already registered
      let nonceResponse = await getNounce(publicKey);
      nounce = nonceResponse.nonce;
    }

    // sign nonce
    let sign = await Web3.eth.accounts.sign(
      Web3.utils.utf8ToHex(nounce.toString()),
      privateKey,
    );
    if (sign && sign.signature) {
      signature = sign.signature;
      let loginResponse = await userLogin(publicKey, signature);
      if (
        loginResponse &&
        loginResponse.access_token &&
        loginResponse.refresh_token
      ) {
        await setWalletType(WALLETTYPE_LOCAL);
        await setWalletAddress(publicKey);
        // login success
        // set Auth Token
        await setAuthToken({
          refresh_token: loginResponse.refresh_token,
          access_token: loginResponse.access_token,
        });
        return loginResponse;
      }
    }
  } catch (err) {
    // error occur while login
  }
  return null;
};

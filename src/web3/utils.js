import {randomBytes} from 'react-native-randombytes';
import Web3 from 'web3';
import Config from 'react-native-config';

export const web3 = new Web3(
  Web3.givenProvider || `https://rinkeby.infura.io/v3/${Config.INFURA_KEY}`,
);

export const contracts = {
  oceanRinkeby: '0x8967BCF84170c91B0d24D4302C2376283b0B3a07',
  walletAddress: '0x5D363EC1EF55005C39c0e36C50b06242aeb3C3D4',
  oceanRopsten: '0x5e8DCB2AfA23844bcc311B00Ad1A0C30025aADE9',
  oceanMainnet: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
  polygonMainnet: '0x282d8efCe846A88B159800bd4130ad77443Fa1A1',
  DaiMainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  DaiKovanContract: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  mDaiRinkebyContract: '0x6f5390A8CD02d83B23C5f1d594bFFB9050Eb4Ca3',
  uniswapExchContract: '0xf5d915570bc477f9b8d6c0e980aa81757a3aac36',
  quicraLiqPool: '0xAAB9EaBa1AA2653c1Dda9846334700b9F5e14E44',
  quicraMainnet: '0x7Bce67697eD2858d0683c631DdE7Af823b7eea38',
  phecorRinkeby: '0xe793a47892854260b42449291953dadbddb4226d',
  newPool1: '0xAa5226ACc808112E84249eD625cEB96b45AFD2Ac', // (pool contract created by newBPool() function)
  newPool2: '0xedB28AFD5da300431CfA285388635c490C2a7192',
};
export const getRandom = (count) =>
  new Promise((resolve, reject) => {
    return randomBytes(count, (err, bytes) => {
      if (err) {
        reject(err);
      } else {
        resolve(bytes);
      }
    });
  });

const getAccFunc = async (_web3, STPupdateAccounts) => {
  try {
    let myAccounts;
    let accountsRet = await _web3.eth.getAccounts();
    if (accountsRet.length === 0) {
      // myAccounts = '0x0'
    } else {
      myAccounts = accountsRet[0];
    }
    STPupdateAccounts(myAccounts);
  } catch (err) {
    //console.warn(err)
  }
};

export const createAccFunc = async (_web3, STPupdateAccounts) => {
  let myAccounts;
  try {
    const entropy = await getRandom(16);
    if (_web3.eth.accounts) {
      myAccounts = _web3.eth.accounts.create(entropy);
      STPupdateAccounts(myAccounts.address);
    }
  } catch (err) {
    //console.warn(err)
  }
  return myAccounts;
};

export function checkAccount(_web3, STPupdateAccounts) {
  try {
    getAccFunc(_web3, STPupdateAccounts);
  } catch (err) {
    //console.warn('web3 provider not open');
    //console.warn(err)
    return err;
  }
}

export function createAccount(_web3, STPupdateAccounts) {
  try {
    createAccFunc(_web3, STPupdateAccounts);
  } catch (err) {
    //console.warn('web3 provider not open');
    //console.warn(err)
    return err;
  }
}

export function updateSeedPhrase(seed, STPupdateSeedPhrase) {
  try {
    STPupdateSeedPhrase(seed);
  } catch (err) {
    //console.warn('web3 provider not open');
    //console.warn(err)
    return err;
  }
}

export function updateAccts(myAccounts, STPupdateAccounts) {
  try {
    STPupdateAccounts(myAccounts);
  } catch (err) {
    //console.warn('web3 provider not open');
    //console.warn(err)
    return err;
  }
}

export async function checkNetwork(_web3) {
  try {
    return _web3.eth.getBlock(0).then((block) => {
      switch (block.hash) {
        case '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3':
          return 'mainnet';
        case '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177':
          return 'rinkeby';
        case '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d':
          return 'ropsten';
        case '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9':
          return 'kovan';
        default:
          return 'local';
      }
    });
  } catch (err) {
    //console.warn('web3 provider not open');
    return 'none';
  }
}

export function signMessage(_web3, msg, pkey) {
  try {
    return _web3.eth.accounts.sign(msg, pkey).then((res) => {
      return res;
    });
  } catch (err) {
    return '';
  }
}

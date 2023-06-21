import Web3 from 'web3';

import {STORAGE_KEY} from './walletsettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {OceanPool} from '../components/OceanPool';
import {getWalletData} from '../services/DataManager';
import erc20ABI from '../abis/erc20.json';
import {PTOY_CONTRACT} from '../../env';

export const handleSendSignedTx = async (
  amount,
  web3,
  newAccount,
  destination,
  newPKey,
  tokenBal,
  onError = () => {},
  onComplete = () => {},
) => {
  const nonce = await web3.eth.getTransactionCount(newAccount, 'latest'); // nonce starts counting from 0
  const walletData = await getWalletData();
  const from = walletData.publicKey;
  const to = newAccount;

  var privKey = Buffer.from(walletData.privateKey.replace('0x', ''), 'hex');

  let contract = new web3.eth.Contract(erc20ABI, PTOY_CONTRACT, {from: from});

  let value = web3.utils.toWei(amount, 'gwei');
  let data = contract.methods.transfer(to, value).encodeABI();

  let txObj = {
    gas: web3.utils.toHex(100000),
    to: PTOY_CONTRACT,
    value: '0x00',
    data: data,
    from: from,
  };

  web3.eth.accounts.signTransaction(
    txObj,
    walletData.privateKey,
    (err, signedTx) => {
      if (err) {
        onError(err);
      } else {
        return web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          (err, res) => {
            if (err) {
              onError(err);
            } else {
              onComplete(res);
            }
          },
        );
      }
    },
  );

  const transaction = {
    to: destination, // faucet address to return eth
    value: web3.utils.toWei(tokenBal, 'gwei'), // 1 ETH = 1000000000000000000 wei
    gas: 1000000,
    nonce: nonce,
    // optional data field to send message or execute smart contract
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    transaction,
    newPKey,
  );

  web3.eth.sendSignedTransaction(
    signedTx.rawTransaction,
    function (error, hash) {
      //this.hash = hash
      if (!error) {
      } else {
      }
    },
  );
};

export const oceanInstance = () => {
  let ocean = new OceanPool();
  return ocean;
};

export const retrievedUserInfo = async () => {
  const userInfo = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
  const info = {
    password: userInfo.password,
    publicKey: userInfo.publicKey,
    privateKey: userInfo.privateKey,
    seedPhrase: userInfo.seedPhrase,
  };
  return info;
};

export const retrievedCurrTokens = async (poolAddress) => {
  if (!oceanInstance) return;
  const currTokens = await oceanInstance().getCurrentTokens(poolAddress);
  const tokenList = {
    oceanAddress: currTokens[1],
    tokenAddress: currTokens[0],
  };
  return tokenList;
};

export const retrievedContracts = async (web3, abi, poolAddress) => {
  let tokens = await retrievedCurrTokens(poolAddress);
  if (!tokens) return;

  const tokenInstance = new web3.eth.Contract(abi, tokens.tokenAddress);
  const oceanInstance = new web3.eth.Contract(abi, tokens.oceanAddress);
  const contractList = {
    tokenContract: tokenInstance,
    oceanContract: oceanInstance,
  };

  return contractList;
};

export const calculateTokenBal = async (contract, address) => {
  const tokenBal = contract.methods
    .balanceOf(address)
    .call((error, balance) => balance);

  return tokenBal;
};

export const retrievedCoins = async (web3, abi, poolAddress) => {
  let contractList = await retrievedContracts(web3, abi, poolAddress);
  if (!contractList) return;

  const oceanSymbol = await contractList.oceanContract.methods.symbol().call();
  const tokenSymbol = await contractList.tokenContract.methods.symbol().call();
  const symbolList = {
    oceanSymbol: oceanSymbol,
    tokenSymbol: tokenSymbol,
  };

  return symbolList;
};

export const currWalletBals = async (web3, abi, poolAddress) => {
  let contractList = await retrievedContracts(web3, abi, poolAddress);
  let publicKey = await (await retrievedUserInfo()).publicKey;
  if (!contractList) return;

  const ethBal = await web3.eth
    .getBalance(publicKey)
    .then((bal) => Number(web3.utils.fromWei(bal, 'ether')).toFixed(2));

  const tokenBal = await calculateTokenBal(
    contractList.tokenContract,
    publicKey,
  );
  const tokenBalance = Number(web3.utils.fromWei(tokenBal)).toFixed(2);

  const oceanBal = await calculateTokenBal(
    contractList.oceanContract,
    publicKey,
  );
  const oceanBalance = Number(web3.utils.fromWei(oceanBal)).toFixed(2);
  const balanceList = {
    ethBal: ethBal,
    tokenBal: tokenBalance,
    oceanBal: oceanBalance,
  };

  return balanceList;
};

import Web3 from 'web3';
import {store} from '../store/store';
import {rinkeby, kovan, ropsten, mainnet} from './constants';
import {web3Initialized} from '../actions/actions.js';
import {createAlchemyWeb3} from '@alch/alchemy-web3';

export const getWeb3_ = new Promise((resolve, reject) => {
  let results;
  let web3 = {};

  // mnemonic = "pride auto solar tomorrow trim dismiss myth alert scrap gap clean rotate"
  //web3 = new Web3(kovan);
  //rinkebyWeb3 = new Web3(rinkeby);
  //kovanWeb3 = new Web3(kovan)
  //mainWeb3 = new Web3(mainnet)
  //ropstenWeb3 = new Web3(ropsten)
  //Wait for loading completion to avoid race conditions with web3 injection timing.
  web3 = new Web3(new Web3.providers.HttpProvider(mainnet));
  results = {
    web3Instance: web3,
    //Web3Instance: rinkebyWeb3,
    //kovanWeb3Instance: kovanWeb3,
    //mainWeb3Instance: mainWeb3,
    //ropstenWeb3Instance: ropstenWeb3
  };
  resolve(store.dispatch(web3Initialized(results)));
});

export const getWeb3 = () => {
  const res = createAlchemyWeb3(mainnet);
  return res;
};

export const web3 = (networktype) => {
  let _getWeb3 = {};
  _getWeb3 =
    networktype === 'rinkeby'
      ? new Web3(rinkeby)
      : networktype === 'kovan'
      ? new Web3(kovan)
      : networktype === 'ropsten'
      ? new Web3(ropsten)
      : new Web3(mainnet);
  return _getWeb3;
};

export const mainConnect = () => {
  const mainWeb3 = new Web3(mainnet);
  return mainWeb3;
};

export const rinkebyConnect = () => {
  const rinkebyWeb3 = new Web3(rinkeby);
  return rinkebyWeb3;
};

export const ropstenConnect = () => {
  const ropstenWeb3 = new Web3(ropsten);
  return ropstenWeb3;
};

export const kovanConnect = () => {
  const kovanWeb3 = new Web3(kovan);
  return kovanWeb3;
};

import {PTOY_CONTRACT, ETHEXPLORER_API_KEY} from '../../env';
import Web3 from 'web3';

let pancakeSwapAbi = [
  {
    inputs: [
      {internalType: 'uint256', name: 'amountIn', type: 'uint256'},
      {internalType: 'address[]', name: 'path', type: 'address[]'},
    ],
    name: 'getAmountsOut',
    outputs: [{internalType: 'uint256[]', name: 'amounts', type: 'uint256[]'}],
    stateMutability: 'view',
    type: 'function',
  },
];

const ETHEXPLORER_API =
  'https://api.ethplorer.io/getTokenInfo/$[TOKEN_CONTRACT]?apiKey=$[ETHEXPLORER_API_KEY]';
let pancakeSwapContract =
  '0x10ED43C718714eb63d5aA57B78B54704E256024E'.toLowerCase();

export const getPtoyPrice = async () => {
  let url = ETHEXPLORER_API.replace('$[TOKEN_CONTRACT]', PTOY_CONTRACT).replace(
    '$[ETHEXPLORER_API_KEY]',
    ETHEXPLORER_API_KEY,
  );

  try {
    const response = await fetch(url);

    const tokenInfo = await response.json();
    return tokenInfo?.price?.rate;
  } catch (error) {}
  return 0;
};

export const calcPtoyPrice = async () => {
  const web3 = new Web3('https://bsc-dataseed1.binance.org');
  const USDTokenAddress = '0x55d398326f99059fF775485246999027B3197955'; //USDT
  let bnbToSell = web3.utils.toWei('1', 'ether');
  let amountOut;
  try {
    let router = await new web3.eth.Contract(
      pancakeSwapAbi,
      pancakeSwapContract,
    );
    amountOut = await router.methods
      .getAmountsOut(bnbToSell, [PTOY_CONTRACT, USDTokenAddress])
      .call();
    amountOut = web3.utils.fromWei(amountOut[1]);
  } catch (error) {}
  if (!amountOut) {
    return 0;
  }
  return amountOut;
};

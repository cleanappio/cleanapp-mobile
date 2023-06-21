//import onlyone from '../abis/onlyone-abi.json'
import jsonpoolABI from '@oceanprotocol/contracts/artifacts/BPool.json';
import Web3 from 'web3';
import {allowance} from './AddDTLiquidity';
import {getFairGasPrice} from './AddDTLiquidity';
import Decimal from 'decimal.js';
import BigNumber from 'bignumber.js';
import {PRIVATE_KEY, INFURA_KEY} from '../../env';
import {web3} from '../web3/utils';
import * as StakesUtil from '../components/AddDTLiquidity';
import ApproveLiquidity from '../components/ApproveLiquidity';

async function Joinswap(
  account,
  poolAddress, //pool address; contracts.oceanRinkeby,
  tokenIn, // token address; contracts.phecorRinkeby
  tokenAmountIn,
  minPoolAmountOut, // 0
) {
  let Tx = require('ethereumjs-tx').Transaction;
  let privateKey = Buffer.from(PRIVATE_KEY, 'hex');
  const contractInstance = new web3.eth.Contract(jsonpoolABI.abi, poolAddress, {
    from: account,
  });

  let count = (await web3.eth.getTransactionCount(account, 'latest')) + 1;
  const accountNonce = (web3.eth.getTransactionCount(account) + 1).toString(16);

  web3.eth.getBlock('latest').then((res) => {});

  const maxAmount = await StakesUtil.getMaxAddLiquidity(poolAddress, tokenIn);

  //minPoolAmountOut:minPoolAmountOut, MaxLiq: maxAmount})

  if (new Decimal(tokenAmountIn).greaterThan(maxAmount)) {
    return null;
  } else {
  }

  //check approval: ask oceanToken contract to approve...
  const approval = await ApproveLiquidity(
    account,
    poolAddress,
    tokenIn,
    tokenAmountIn,
  );

  if (approval.status === true) {
    //result = receipt.hash
    //join the pool if it's approved
    const tx = contractInstance.methods.joinswapExternAmountIn(
      poolAddress,
      web3.utils.toWei(tokenAmountIn),
      web3.utils.toWei(minPoolAmountOut),
    );
    const encodedABI = tx.encodeABI();

    let rawTransaction = {
      from: account,
      gasPrice: web3.utils.toHex(5000000000),
      gasLimit: web3.utils.toHex(210000),
      to: tokenIn,
      data: encodedABI,
      nonce: web3.utils.toHex(count),
    };

    let transaction = new Tx(rawTransaction, {chain: 'rinkeby'}); //defaults to mainnet without specifying chain
    transaction.sign(privateKey);

    let result = await web3.eth.sendSignedTransaction(
      '0x' + transaction.serialize().toString('hex'),
    );
  } else {
    return null;
  }
}

export default Joinswap;

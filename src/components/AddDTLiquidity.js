//import onlyone from '../abis/onlyone-abi.json'
import jsonpoolABI from '@oceanprotocol/contracts/artifacts/BPool.json';
import defaultDatatokensABI from '@oceanprotocol/contracts/artifacts/DataTokenTemplate.json';
import Web3 from 'web3';
import Decimal from 'decimal.js';
import BigNumber from 'bignumber.js';
import ApproveLiquidity from '../components/ApproveLiquidity';
import {contracts} from '../web3/utils';

const myAddress = '0x5D363EC1EF55005C39c0e36C50b06242aeb3C3D4'; // dummy
let myWallet1PKey =
  '84d8bd3e50eddf675f37227e40df9c395f48367548ea3f9ca4d2ff33a473fe16'; //dummy

const web3 = new Web3(
  Web3.givenProvider ||
    'https://rinkeby.infura.io/v3/48f3dfa7944f442980a90c625e2f2921',
);
const POOL_MAX_AMOUNT_IN_LIMIT = 0.25; // maximum 1/4 of the pool reserve
const POOL_MAX_AMOUNT_OUT_LIMIT = 0.25; // maximum 1/4 of the pool reserve

export async function getFairGasPrice(web3) {
  const x = new BigNumber(await web3.eth.getGasPrice());
  return x.multipliedBy(1.05).integerValue(BigNumber.ROUND_DOWN).toString(10);
}

export async function getTokenBalance_() {
  // result = await pool.methods.getCurrentTokens().call()
  const pool = new web3.eth.Contract(jsonpoolABI.abi, poolAddress);
  pool.methods
    .balanceOf(phecor0RinkebyContract)
    .call(function (err, phecorBal) {});
}

export async function getTokenBalance(poolAddress) {
  const pool = new web3.eth.Contract(jsonpoolABI.abi, poolAddress);
  let result = null;
  try {
    result = await pool.methods.balanceOf().call(function (err, phecorBal) {});
  } catch (e) {}
  return result;
}

export async function estimateGas(account, tokenAddress) {
  const nonce = await web3.eth.getTransactionCount(account, 'latest');
  const datatoken = new web3.eth.Contract(jsonpoolABI.abi, tokenAddress);
  web3.eth.getBlock('latest').then((res) => {});

  web3.eth
    .estimateGas({
      from: account,
      to: tokenAddress,
      gasLimit: web3.utils.toHex(10000000),
      gasPrice: web3.utils.toHex(10000000000),
      nonce: web3.utils.toHex(nonce),
      data: datatoken.methods
        .approve(tokenAddress, web3.utils.toBN(2))
        .encodeABI(),
    })
    .then((res) => {});
}

/**
 * Get Allowance for both DataToken and Ocean
 * @param {String } tokenAdress
 * @param {String} owner
 * @param {String} spender
 *
 * @dev Returns the remaining number of tokens that `spender` will be
 * allowed to spend on behalf of `owner` through {e.g. transferFrom}. This is
 * zero by default.
 *
 */

export async function allowance(tokenAddress, owner, spender) {
  const tokenAbi = defaultDatatokensABI.abi;
  const datatoken = new web3.eth.Contract(tokenAbi, tokenAddress, {
    from: spender,
  });
  const trxReceipt = await datatoken.methods.allowance(owner, spender).call();

  return web3.utils.fromWei(trxReceipt);
}

/**
 * Approve spender to spent amount tokens
 * @param {String} account
 * @param {String} tokenAddress
 * @param {String} spender
 * @param {String} amount  (always expressed as wei)
 * @param {String} force  if true, will overwrite any previous allowence. Else, will check if allowence is enough and will not send a transaction if it's not needed
 */
async function getApproval(
  account,
  tokenAddress,
  spender,
  amount,
  force = false,
) {
  const minABI = [
    {
      constant: false,
      inputs: [
        {
          name: '_spender',
          type: 'address',
        },
        {
          name: '_value',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const token = new web3.eth.Contract(minABI, tokenAddress, {from: account});
  if (!force) {
    const currentAllowence = await allowance(tokenAddress, account, spender);
    if (new Decimal(currentAllowence).greaterThanOrEqualTo(amount)) {
      // we have enough
      return null;
    }
  }
  let result = null;
  //const gasLimitDefault = this.GASLIMIT_DEFAULT
  const gasLimitDefault = 1000000;

  let estGas;
  try {
    estGas = await token.methods
      .approve(spender, amount)
      .estimateGas({from: account}, (err, estGas) =>
        err ? gasLimitDefault : estGas,
      );
  } catch (e) {
    estGas = gasLimitDefault;
  }

  try {
    /**
      result = await token.methods.approve(spender, amount).send({
        from: account,
        gas: estGas + 1,
        gasPrice: await getFairGasPrice(web3)
      })
       */

    result = await token.methods.approve(spender, amount).call();
  } catch (e) {}
  return result;
}

/**
 * Get tokens composing this pool
 * @param {String} poolAddress
 * @return {String[]}
 */
export async function getCurrentTokens(poolAddress) {
  const pool = new web3.eth.Contract(jsonpoolABI.abi, poolAddress);
  let result = null;
  try {
    //result = await pool.methods.getCurrentTokens().call() // error: reverted
    // result = await pool.methods.getBalance(poolAddress).call() // error: reverted
    result = await pool.methods.balanceOf(poolAddress).call(); // returns a value
  } catch (e) {}
  return result;
}

/**
 * Get DataToken address of token in this pool
 * @param {String} account
 * @param {String} poolAddress
 * @return {string}
 */
export async function getDTAddress(poolAddress) {
  let dtAddress = '';
  let oceanAddress = '';
  const tokens = await getCurrentTokens(poolAddress);
  let token = ' ';

  if (tokens != null) {
    for (token of tokens) {
      // TODO: Potential timing attack, left side: true
      if (token !== oceanAddress) {
        dtAddress = token;
      }
    }
  }
  return dtAddress;
}

/**
 * Get how many tokens are in the pool
 * @param {String} poolAddress
 * @param {String} tokenAddress  Address of the token
 * @return {String}
 */
export async function getReserve(poolAddress, tokenAddress) {
  let amount = null;
  try {
    const pool = new web3.eth.Contract(jsonpoolABI.abi, poolAddress);
    //const result = await pool.methods.getBalance(tokenAddress).call()
    const result = await pool.methods.balanceOf(tokenAddress).call();
    amount = web3.utils.fromWei(result);
  } catch (e) {}
  return amount;
}

/**
 * Returns max amount of tokens that you can add to the pool
 * @param poolAddress
 * @param tokenAddress
 */
export async function getMaxAddLiquidity(poolAddress, tokenAddress) {
  let maxLiq;
  // const balance = await getReserve(poolAddress, tokenAddress)
  const balance = await getCurrentTokens(poolAddress);
  if (parseFloat(balance) > 0) {
    maxLiq = new Decimal(balance).mul(POOL_MAX_AMOUNT_IN_LIMIT).toString();
    return maxLiq;
  } else {
  }
  return '0';
}

/**
 * Pay tokenAmountIn of token tokenIn to join the pool, getting poolAmountOut of the pool shares.
 * @param {String} account
 * @param {String} poolAddress
 * @param {String} tokenIn // address
 * @param {String} tokenAmountIn will be converted to wei
 * @param {String} minPoolAmountOut  will be converted to wei
 * @return {TransactionReceipt}
 */
export async function joinswapExternAmountIn(
  account,
  poolAddress,
  tokenIn,
  tokenAmountIn,
  minPoolAmountOut,
) {
  const pool = new web3.eth.Contract(jsonpoolABI.abi, poolAddress, {
    from: account,
  });
  let result = null;
  //const gasLimitDefault = GASLIMIT_DEFAULT
  const gasLimitDefault = 10002000;
  let estGas;
  try {
    estGas = await pool.methods
      .joinswapExternAmountIn(
        tokenIn,
        web3.utils.toWei(tokenAmountIn),
        web3.utils.toWei(minPoolAmountOut),
      )
      .estimateGas({from: account}, (err, estGas) =>
        err ? gasLimitDefault : estGas,
      );
  } catch (e) {
    estGas = gasLimitDefault;
  }
  try {
    result = await pool.methods
      .joinswapExternAmountIn(
        tokenIn,
        web3.utils.toWei(tokenAmountIn),
        web3.utils.toWei(minPoolAmountOut),
      )
      .send({
        from: account,
        gas: estGas + 1,
        // gasPrice: await getFairGasPrice(web3)
        gasPrice: web3.utils.toHex(5000000000),
      });
  } catch (e) {}
  return result;
}

/**
 * Add datatoken amount to pool liquidity
 * @param {String} account
 * @param {String} poolAddress
 * @param {String} amount datatoken amount
 * @return {TransactionReceipt}
 */

//async function sendOnlyOne(fromAddress, toAddress)
export async function AddDTLiquidity(account, poolAddress, amount) {
  let result;
  /**
    const dtAddress = await getDTAddress(poolAddress)
    const maxAmount = await getMaxAddLiquidity(poolAddress, dtAddress)

    if (new Decimal(amount).greaterThan(maxAmount)) {
      return null
    }
     */
  //const dtAddress = await getDTAddress(poolAddress)

  ApproveLiquidity(account, poolAddress, contracts.phecorRinkeby, amount).then(
    (receipt) => {
      if (receipt.status == true) {
        //result = receipt.hash
      } else {
        return null;
      }
    },
  );

  //   if (!force) {
  //     const currentAllowence = await allowance(tokenAddress, account, spender)
  //     if (new Decimal(currentAllowence).greaterThanOrEqualTo(amount)) {
  // we have enough
  //       return null
  //     }
  //   }

  //  const txid = await approve(
  //    account,
  //    dtAddress,
  //    poolAddress,
  //    web3.utils.toWei(amount)
  //  )
  //  if (!txid) {
  //    return null
  //  }
  /***
    const result = await joinswapExternAmountIn(
      account,
      poolAddress,
      dtAddress,
      amount,
      '0'
    )
     */

  return result;
}

export default AddDTLiquidity;

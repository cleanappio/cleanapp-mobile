import {PTOY_CONTRACT} from '../../env';
import erc20ABI from '../abis/erc20.json';

export const getTokenBalance = async (web3, address) => {
  const contract = new web3.eth.Contract(erc20ABI, PTOY_CONTRACT);

  const res = await contract.methods.balanceOf(address).call();
  // confirm whether PTOY is in gwei
  const format = Number(web3.utils.fromWei(res, 'gwei')).toFixed(2);
  return format;
};

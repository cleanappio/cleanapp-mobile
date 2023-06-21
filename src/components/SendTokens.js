// Helper script that sends ONLYONE token to target addresses specified in targets.txt
// Target index - index in targets.txt file is specified as an argument - process.argv.splice(2)[0]

import onlyone from '../abis/onlyone-abi.json';

const myAddress = '0x5D363EC1EF55005C39c0e36C50b06242aeb3C3D4';
let myWallet1PKey =
  '84d8bd3e50eddf675f37227e40df9c395f48367548ea3f9ca4d2ff33a473fe16';

async function sendOnlyone(fromAddress, toAddress) {
  var Tx = require('ethereumjs-tx').Transaction;
  var Web3 = require('web3');
  const web3 = new Web3(
    Web3.givenProvider ||
      'https://rinkeby.infura.io/v3/48f3dfa7944f442980a90c625e2f2921',
  );
  var amount = web3.utils.toHex(5);
  var privateKey = Buffer.from(myWallet1PKey, 'hex');
  var abiArray = JSON.parse(onlyone);
  //var contractAddress = '0xb899db682e6d6164d885ff67c1e676141deaaa40'; // ONLYONE address
  let contractAddress = '0xe793a47892854260b42449291953dadbddb4226d'; // phecor rinkeby token address
  let oceanRinkebyContract = '0x8967BCF84170c91B0d24D4302C2376283b0B3a07'; //rinkeby ocean contract
  var contract = new web3.eth.Contract(abiArray, contractAddress, {
    from: fromAddress,
  });
  // var Common = require('ethereumjs-common').default;

  var count = await web3.eth.getTransactionCount(myAddress);

  var rawTransaction = {
    from: myAddress,
    gasPrice: web3.utils.toHex(5000000000),
    gasLimit: web3.utils.toHex(210000),
    to: contractAddress,
    value: '0x0',
    data: contract.methods.transfer(toAddress, amount).encodeABI(),
    nonce: web3.utils.toHex(count),
  };

  //var tx = new Tx(rawTx, {'chain':'ropsten'});

  var transaction = new Tx(rawTransaction, {chain: 'rinkeby'});
  transaction.sign(privateKey);

  var result = await web3.eth.sendSignedTransaction(
    '0x' + transaction.serialize().toString('hex'),
  );
  return result;
}

export default sendOnlyone;

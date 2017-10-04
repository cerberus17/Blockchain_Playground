const contractAddress = '0x2d4bd8d9461962f7fb8f6ee77f4f850ae5804b3b';
const myTestAccount = '0x0a78C28257b40d5076eA180Bc6a9e4c597c5EA98';

const contractAbi = JSON.parse('[{"constant":false,"inputs":[{"name":"yourName","type":"bytes32"}],"name":"interact","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"currentName","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fromAddres","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastUpdatedMinutes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"n","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"},{"indexed":true,"name":"timeUpdated","type":"uint256"}],"name":"Interaction","type":"event"}]');
const contractByteCode = '6060604052341561000f57600080fd5b6102708061001e6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806312e92de31461005e57806362777662146100855780638c659ab7146100b6578063bd5b38371461010b57600080fd5b341561006957600080fd5b610083600480803560001916906020019091905050610134565b005b341561009057600080fd5b6100986101f9565b60405180826000191660001916815260200191505060405180910390f35b34156100c157600080fd5b6100c9610202565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561011657600080fd5b61011e61022c565b6040518082815260200191505060405180910390f35b806000816000191690555033600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555042600181905550600154600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600054600019167f8c3f8124db3586b01b1a3687e65ac69ea4815aa8e9479454b8a8963bf1c6c2a860405160405180910390a450565b60008054905090565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000603c600154420381151561023e57fe5b049050905600a165627a7a723058204e07e34e0d18d4e069de37dd0ae076faef381fd4ccbc06f74f16125db83261f80029';

const eventSig = web3.sha3('Interaction(byte32,address,uint)');

const filterOptions = {
  fromBlock: 'latest',
  topics: [eventSig, null, null, null]
};

const filterWatch = web3.eth.filter(filterOptions);

/* Init isn't always called on page load...not sure why. Shft+refresh works. */
window.addEventListener('load', () => {
  init();
});

function init() {
  console.log('Initializing app');
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

  startWatching();

  console.log(web3.isConnected());
}

function getContract() {
  const contract = web3.eth.contract(contractAbi);
  const contractInst = contract.at(contractAddress);

  return contractInst;
}

function startWatching() {
  const contractInst = getContract();

  console.log('start watching');

  const contractEvent = contractInst.Interaction({}, {});

  contractEvent.watch((error, result) => {
    if (error) {
      console.error('Filter watch error: ', error);
    }
    else {
      console.log('event data retrieved ' + JSON.stringify(result));

      const eventDataElement = document.getElementAtId('event_data');

      eventDataElement.innerHeight = eventDataElement.innerHTML + result;
    }
  });
}

function submitName() {
  console.log('submit click');
  const name = document.getElementById('name_param').value;
  console.log('name ' + name);

  const contractInst = getContract();

  console.log('Contract ' + contractInst);
  const transactionObject = {
    from: myTestAccount,
    gas: 210000
  };

  web3.personal.unlockAccount(myTestAccount, 'password', (error, result) => {
    if (error)
      console.log('Error unlocking account ' + error)
    else {
      console.log('Account unlocked');

      contractInst.interact.sendTransaction(name, transactionObject, (error, result) => {
        if (error)
          console.log('Error sending transaction ' + error);
        else
          console.log('Successfully sent transaction ' + result);

        web3.personal.lockAccount(myTestAccount);
      });
    }
  });
}

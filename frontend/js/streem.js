// for contract metadata (format as produced by truffle)
function initContract() {
    const abi = contract.abi;

    // get address - in case of multiple network entries, the last seems to be a safe bet
    for(let networkId in contract.networks) {
        console.log(contract.networks[networkId])
        var address = contract.networks[networkId].address
    }

    var Web3 = require('web3');

    if (typeof web3 !== 'undefined') {
        // Mist / Metamask
        console.log('web3 connects to provider')
        web3 = new Web3(web3.currentProvider);
    } else {
        // standalone
        //alert("This Dapp needs web3 injected (e.g. through the Metamask plugin.");
        console.log('web3 connects to rpc')
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        // TODO: use the async getAccounts() instead
        web3.eth.defaultAccount = web3.eth.accounts[0]
    }

    // contract is the contract template based on our abi
    const Streem = web3.eth.contract(abi);
    streem = Streem.at(address);

    console.log(`contract loaded at ${address} for defaultAccount ${web3.eth.defaultAccount}`)

    web3.eth.getBlockNumber((err, ret) => {
        console.log("Block: " + ret);
    });

    // callback on block advance
    web3.eth.filter('latest').watch((err, hash) => {
        console.log(`new block: ${hash}`)
        if (typeof onNextBlock == 'function') {
            onNextBlock(hash)
        }
    })
}

function onOpenStreamButton() {
    console.log("start stream clicked")

    const rcv = document.getElementById('receiver').value
    const speed = document.getElementById('speed').value

    console.log(`starting stream to ${rcv} with speed ${speed}`)
    streem.openStream(rcv, speed, {gas: 200000}) // TODO: gas is just a guess to make it working on testrpc
}

function onCloseStreamButton() {
    console.log("stop stream clicked")
    streem.closeStream({gas: 200000}) // TODO: gas is just a guess to make it working on testrpc
}

// shows the balance of <address> by calling the function <updateUi> with the balance as parameter
function showBalance(address, updateUi) {
    streem.balanceOf(address, (err, ret) => {
        window.balance = ret
        const bal = web3.toDecimal(ret)
        console.log(`balance is ${bal}`)
        updateUi(bal)
    })
}

// callback for new block event
function onNextBlock(hash) {
    showBalance(web3.eth.defaultAccount, (bal) => { document.getElementById('mybalance-result').innerHTML = bal } )
    const receiverAddr = document.getElementById('receiver').value
    if(receiverAddr != "") {
        showBalance(receiverAddr, (bal) => { document.getElementById('somebalance-result').innerHTML = bal } )
    }
}

// trigger block creation every <blocktime> seconds by transferring 1 wei (useful for testrpc).
function keepBlockchainAlive(blocktime) {
    window.setTimeout( () => {
        web3.eth.sendTransaction( {to: web3.eth.accounts[0], value: 1})
        keepBlockchainAlive(blocktime)
    }, blocktime * 1000)
}

// UI init
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded')

    document.querySelector('#start-stream').onclick = onOpenStreamButton
    document.querySelector('#stop-stream').onclick = onCloseStreamButton
})

window.addEventListener('load', () => {
    console.log('window loaded')

    initContract()

    if(web3.eth.defaultAccount == undefined) {
        alert("no Ethereum account found")
    }

    web3.eth.getBalance(web3.eth.defaultAccount, (err, ret) => {
        if(! err) {
            window.balance = ret
            console.log(`Ether balance is ${web3.fromWei(web3.toDecimal(ret))}`)
        } else {
            alert("Something went wront: can't read Ether balance. Blockchain node connected?")
        }
    })

    if(web3.version.node.toLocaleLowerCase().indexOf("testrpc") != -1) {
        keepBlockchainAlive(5)
    }
})
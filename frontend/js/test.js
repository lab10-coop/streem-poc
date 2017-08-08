// for contract metadata (format as produced by truffle)
function initContract() {
    const abi = contract.abi;

    // get address - in case of multiple network entries, the last seems to be a safe bet
    for(let networkId in contract.networks) {
        //console.log(contract.networks[networkId])
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
        //console.log(`new block: ${hash}`)
        if (typeof onNextBlock == 'function') {
            onNextBlock(hash)
        }
    })
}

const nrTestAccounts = 5
// for f it expects a function which takes an address as argument
function applyForTestAccs(f) {
    for(let i=0; i<nrTestAccounts; i++) {
        f(web3.eth.accounts[i])
    }
}

function updateDetailTable() {
    applyForTestAccs( (addr, i) => {
        streem.balanceOf(addr, (err, ret) => {
            document.getElementById(`${addr}-bal`).innerHTML = web3.toDecimal(ret)
        })
        streem.dev_settledBalance({from: addr}, (err, ret) => {
            document.getElementById(`${addr}-settled-bal`).innerHTML = web3.toDecimal(ret)
        })

        streem.dev_inStream({from: addr}, (err, ret) => {
            const sender = ret[0], speed = web3.toDecimal(ret[1]), age = web3.toDecimal(ret[2])
            document.getElementById(`${addr}-instream-speed`).innerHTML = speed
            document.getElementById(`${addr}-instream-age`).innerHTML = speed == 0 ? 0 : age
        })

        streem.dev_outStream({from: addr}, (err, ret) => {
            const receiver = ret[0], speed = web3.toDecimal(ret[1]), age = web3.toDecimal(ret[2])
            document.getElementById(`${addr}-outstream-speed`).innerHTML = speed
            document.getElementById(`${addr}-outstream-age`).innerHTML = speed == 0 ? 0 : age
        })
    })
}

// callback for new block event
function onNextBlock(hash) {
    if(! viewFrozen) {
        document.getElementById('blocknr').innerHTML = web3.eth.blockNumber
        document.getElementById('nrstreams').innerHTML = streem.dev_streamsLength()

        updateDetailTable()
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

    // dynamically wire all buttons (convention: handler name == id)
    const buttons = document.querySelectorAll('button')
    for(let button of buttons) {
        button.onclick = this[button.id]
        console.log(`${button.id} wired`)
    }
})

function initTableRowFor(addr) {
    let table = document.getElementById('detail-table')

    let row = document.createElement('tr')
    row.innerHTML = `
        <td id="${addr}">${addr}</td><td id="${addr}-bal">-</td><td id="${addr}-settled-bal">-</td>
        <td id="${addr}-instream-speed">-</td><td id="${addr}-instream-age">-</td>
        <td id="${addr}-outstream-speed">-</td><td id="${addr}-outstream-age">-</td>
    `
    table.appendChild(row)
}

var accs = []
window.addEventListener('load', () => {
    console.log('window loaded')

    initContract()

    if(web3.eth.defaultAccount == undefined) {
        alert("no Ethereum account found")
    }

    web3.eth.getBalance(web3.eth.defaultAccount, (err, ret) => {
        if(! err) {
            console.log(`Ether balance is ${web3.fromWei(web3.toDecimal(ret))}`)
        } else {
            alert("Something went wront: can't read Ether balance. Blockchain node connected?")
        }
    })

    if(web3.version.node.toLocaleLowerCase().indexOf("testrpc") != -1) {
        keepBlockchainAlive(5) // testrpc seems to have a lower limit of 5 sec
    }

    if(web3.eth.accounts.length < nrTestAccounts) {
        alert("ERROR: less than 3 accounts available")
    }

    applyForTestAccs(addr => accs.push(addr) ) // for convenience in JS console
    applyForTestAccs(addr => initTableRowFor(addr) )
})

// ############################################################################

// closes the outgoing streams of the test accounts
// this will throw an expection for accounts without outstream. Doesn't hurt us.
function close() {
    applyForTestAccs(addr => {streem.closeStream({from: addr, gas: 200000}, (err, ret) => {
        if(err) console.log(`closeStream failed for ${addr}`)
    })})
}

var viewFrozen = false
// toggle logic
function freeze() {
    viewFrozen = viewFrozen == true ? false : true
    document.getElementById('freeze').innerHTML = viewFrozen == true ? 'Un-freeze view' : 'Freeze view'
}

function reset() {
    console.log('resetting...')
    applyForTestAccs(addr => streem.dev_reset( {from: addr, gas: 2000000} )) //note that this is more gas!
}

// test: balances are correct
function test1() {
    console.log('open stream1: speed 1 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 1, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 1 from addr1 to addr2')
    streem.openStream(web3.eth.accounts[2], 1, {from: web3.eth.accounts[1], gas: 200000})
}

// test: dryed out stream
function test1a() {
    // ...
    console.log('closing stream1')
    streem.closeStream({from: web3.eth.accounts[0], gas: 200000})

    console.log('waiting 20 sec...')
    setTimeout( () => {
        console.log('closing stream2')
        streem.closeStream({from: web3.eth.accounts[1], gas: 200000})
    }, 20000)
    // assert: bal(addr1) is 0, stream2 stalls
}

// test: underfunded stream
function test2() {
    console.log('open stream1: speed 1 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 1, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 2 from addr1 to addr2')
    streem.openStream(web3.eth.accounts[2], 2, {from: web3.eth.accounts[1], gas: 200000})

    // wait 10
    // assert: bal(addr1) is 0, lab(addr2) is 5
    // close stream1
    // close stream2
    // assert: bal(addr1) is 0, lab(addr2) is 5
}

function test3() {
    console.log('open stream1: speed 1 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 1, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 1 from addr1 to addr0')
    streem.openStream(web3.eth.accounts[0], 1, {from: web3.eth.accounts[1], gas: 200000})
}

function test3a() {
    console.log('open stream1: speed 1 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 1, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 2 from addr1 to addr0')
    streem.openStream(web3.eth.accounts[0], 2, {from: web3.eth.accounts[1], gas: 200000})
}

function test3b() {
    console.log('open stream1: speed 2 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 2, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 1 from addr1 to addr0')
    streem.openStream(web3.eth.accounts[0], 1, {from: web3.eth.accounts[1], gas: 200000})
}

function test4() {
    console.log('open stream1: speed 1 from addr0 to addr1')
    streem.openStream(web3.eth.accounts[1], 1, {from: web3.eth.accounts[0], gas: 200000})

    console.log('open stream2: speed 1 from addr1 to addr2')
    streem.openStream(web3.eth.accounts[2], 1, {from: web3.eth.accounts[1], gas: 200000})

    console.log('open stream3: speed 1 from addr2 to addr0')
    streem.openStream(web3.eth.accounts[0], 1, {from: web3.eth.accounts[2], gas: 200000})
}
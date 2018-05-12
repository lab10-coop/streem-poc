// for contract metadata (format as produced by truffle)
function initContract() {
    return new Promise( (resolve, reject) => {
        const abi = contract.abi;

        // get address - in case of multiple network entries, the last seems to be a safe bet
        for(let networkId in contract.networks) {
            //console.log(contract.networks[networkId])
            var address = contract.networks[networkId].address
        }

        // in order to hardcode an address (e.g. of a public testnet),
        // comment out the loop above, set the address in next line and uncomment
        // var address = '0xf73f6bd052061bb84913be57d5f7565b0aa38827' // rinkeby deployment

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
        }
        web3.eth.getAccounts((err, ret) => {
            if (!err) web3.eth.defaultAccount = ret[0]
            if (web3.eth.defaultAccount == undefined) {
                alert("no Ethereum account found")
            } else {
                console.log(`defaultAccount: ${web3.eth.defaultAccount}`)

                // contract is the contract template based on our abi
                const Streem = web3.eth.contract(abi);
                streem = Streem.at(address);

                streem.totalSupply( (err, ret) => {
                    if(err || ret == 0) {
                        alert(`Cannot communicate with contract at given address ${address}`)
                    } else {
                        console.log(`contract loaded at ${address}`)

                        web3.version.getNetwork( (err, ret) => {
                            resolve({ contractaddr: address, networkid: ret})
                        })
                    }
                })
            }
        })

        // callback on block advance
        web3.eth.filter('latest').watch((err, hash) => {
            console.log(`new block: ${hash}`)
            if (typeof onNextBlock == 'function') {
                onNextBlock(hash)
            }
        })

        // callback on pending transactions
        /*
        // the address filter seems not to work
        web3.eth.filter({address: web3.eth.defaultAccount}).watch((err, ret) => {
            console.log(`filtered event: ${JSON.stringify(ret)}`)
            getReceipt(ret.transactionHash)
        })
        */
    })
}

/*
NOTE: gas amounts for contract calls are hardcoded to an arbitrary value.
Should instead be inferred via gas estimation upfront.
*/
const GASLIMIT = 200000

function onOpenStreamButton() {
    console.log("open stream clicked")

    const rcv = document.getElementById('receiver').value
    const speed = document.getElementById('speed').value

    console.log(`opening stream to ${rcv} with speed ${speed}`)
    streem.openStream(rcv, speed, {gas: GASLIMIT}, txHandler)
}

// TODO: first test locally if it can be executed
function onCloseStreamButton() {
    console.log("close stream clicked")
    streem.closeStream({gas: GASLIMIT}, txHandler)
}

function onTransferButton() {
    console.log("transfer clicked")
    const rcv = document.getElementById('transfer-receiver').value
    const amount = document.getElementById('transfer-amount').value
    streem.transfer(rcv, amount, {gas: GASLIMIT}, txHandler)
}

// TODO: how to detect failure of a transaction? See https://ethereum.stackexchange.com/questions/6007/how-can-the-transaction-status-from-a-thrown-error-be-detected-when-gas-can-be-e
// update: this was written pre-byzantium. TBD with check of status field now
function txHandler(err, txHash) {
    if(err) {
        console.log(`transfer failed: ${err}`)
        alert(`transaction failed: ${err}`)
    } else {
        console.log(`new pending transaction: ${txHash}`)
        window.pendingTx = txHash
        document.getElementById('pendingtx').innerHTML = `<a href="${network.explorer}/tx/${txHash}" target="_blank">${txHash}</a>`
        function incrementCounter(startTime) {
            window.setTimeout(() => {
                document.getElementById('pendingtxcounter').innerHTML = Math.floor(Date.now() / 1000) - startTime
                if(window.pendingTx) {
                    incrementCounter(startTime)
                } else {
                    document.getElementById('pendingtxcounter').innerHTML = ''
                }
            }, 1000)
        }
        incrementCounter(Math.floor(Date.now() / 1000))
    }
}

function getReceipt(txHash) {
    console.log(`getReceipt for tx ${txHash}`)
    web3.eth.getTransactionReceipt(txHash, (err, ret) => {
        if(err) {
            console.log(`getTransactionReceipt failed: ${err}`)
        } else {
            console.log(`receipt: ${JSON.stringify(ret)}`)
        }
    })
}

// shows the balance of <address> by calling the function <updateUi> with the balance as parameter
function showBalance(address, updateUi) {
    streem.balanceOf(address, (err, ret) => {
        window.balance = ret
        const bal = web3.toDecimal(ret)
        updateUi(bal)
    })
}

// callback for new block event
function onNextBlock() {
    web3.eth.getBlockNumber((err, ret) => {
        document.getElementById('blocknr').innerHTML = ret
    })
    web3.eth.getBalance(web3.eth.defaultAccount, (err, ret) => {
        if(! err) {
            window.balance = ret
            const balWei = web3.fromWei(web3.toDecimal(ret))
            document.getElementById('etherbalance').innerHTML = balWei
        } else {
            alert("Something went wront: can't read Ether balance. Blockchain node connected?")
        }
    })
    showBalance(web3.eth.defaultAccount, (bal) => {
        document.getElementById('streembalance').innerHTML = bal
    } )
    const receiverAddr = document.getElementById('receiver').value
    if(receiverAddr != "") {
//        showBalance(receiverAddr, (bal) => { document.getElementById('somebalance-result').innerHTML = bal } )
    }

    streem.dev_inStream((err, ret) => {
        const sender = ret[0], speed = web3.toDecimal(ret[1]), age = web3.toDecimal(ret[2])
        document.getElementById('in-sender').innerHTML = speed != 0 ? `<a href="${network.explorer}/token/${contractaddr}?a=${sender}" target="_blank">${sender}</a>` : '-'
        document.getElementById('in-speed').innerHTML = speed != 0 ? speed: '-'
        document.getElementById('in-age').innerHTML = speed != 0 ? age : '-'

        if(speed != 0) {
            streem.balanceOf(sender, (err, ret) => {
                const bal = web3.toDecimal(ret)
                const runway = Math.floor(bal / speed)
                document.getElementById(`in-runway`).innerHTML = runway
            })
        } else {
            document.getElementById(`in-runway`).innerHTML = '-'
        }
    })

    streem.dev_outStream((err, ret) => {
        const receiver = ret[0], speed = web3.toDecimal(ret[1]), age = web3.toDecimal(ret[2])
        document.getElementById('out-receiver').innerHTML = speed != 0 ? `<a href="${network.explorer}/token/${contractaddr}?a=${receiver}" target="_blank">${receiver}</a>` : '-'
        document.getElementById('out-speed').innerHTML = speed != 0 ? speed: '-'
        document.getElementById('out-age').innerHTML = speed != 0 ? age : '-'

        if(speed != 0) {
            streem.balanceOf(web3.eth.defaultAccount, (err, ret) => {
                const bal = web3.toDecimal(ret)
                const runway = Math.floor(bal / speed)
                document.getElementById(`out-runway`).innerHTML = runway
            })
        } else {
            document.getElementById(`out-runway`).innerHTML = '-'
        }
    })
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

    document.querySelector('#open-stream').onclick = onOpenStreamButton
    document.querySelector('#close-stream').onclick = onCloseStreamButton
    document.querySelector('#transfer').onclick = onTransferButton
})

window.addEventListener('load', () => {
    console.log('window loaded')

    initContract().then( ret => {
        this.contractaddr = ret.contractaddr
        const networks = {1: 'mainnet', 3: 'ropsten', 4: {name: 'rinkeby', explorer: 'http://rinkeby.etherscan.io'}}
        this.network = networks[ret.networkid] ? networks[ret.networkid] : {name: 'unknown', explorer: ''}

        console.log(`network-id: ${ret.networkid}`)
        document.getElementById('network').innerHTML = `id ${ret.networkid} <a href="${network.explorer}" target="_blank">${network.name}</a>`

        document.getElementById('contractaddr').innerHTML = `<a href="${network.explorer}/token/${contractaddr}" target="_blank">${contractaddr}</a>`
        document.getElementById('ownaddr').innerHTML = `<a href="${network.explorer}/token/${contractaddr}?a=${web3.eth.defaultAccount}" target="_blank">${web3.eth.defaultAccount}</a>`

        web3.version.getNode( (err, ret) => {
            if(ret.toLocaleLowerCase().indexOf("testrpc") != -1) {
                console.log('starting timer for dummy transaction in order to keep the chain going...')
                keepBlockchainAlive(5)
            }
        })

        streem.Transfer().watch( (err, ret) => {
            console.log(`Transfer event: ${JSON.stringify(ret)}`)
        })

        streem.allEvents().watch( (err, ret) => {
            console.log(`Event: ${JSON.stringify(ret)}`)
            // example value of ret:
            // {"address":"0xf73f6bd052061bb84913be57d5f7565b0aa38827","blockNumber":693587,"transactionHash":"0xf97f95ae04c98fb1be277ba6888e6bf8b77d360b1196f774c6e91cc9f8bba115","transactionIndex":0,"blockHash":"0x570a4102cdd5a9f30efbac1a8ff00f6054d4af4f9b092c1dda8d705904d8d957","logIndex":0,"removed":false,"event":"StreamOpened","args":{"_from":"0x1e8a58eaab8c001022921d60010ddeb57f01b674","_to":"0x54717fdd2d61dda38f60cf822c225fe65fc18e64","_perSecond":"2"}}
            if(ret.transactionHash == window.pendingTx) {
                document.getElementById('pendingtx').innerHTML = ''
                window.pendingTx = null
                document.getElementById('executedtx').innerHTML = `<a href="${network.explorer}/tx/${ret.transactionHash}" target="_blank">${ret.transactionHash}</a>`
            }
        })

        // trigger once manually in order to init some of the UI fields
        onNextBlock()
    })
})
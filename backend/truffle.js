module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "rinkeby.eth.lab10.io", // Connect to geth on the specified
      port: 80,
      //from: "0xc6aa5459ef1cbbc4dce38c7bba5e01fd12b521a4", // default address to use for any transaction Truffle makes during migrations
      from: "0xc6AA5459eF1CBBc4DcE38C7bBa5E01Fd12B521a4", // default address to use for any transaction Truffle makes during migrations
      // needed to be unlocked permanently (timeout 0) in geth: personal.unlockAccount("0xc6aa5459ef1cbbc4dce38c7bba5e01fd12b521a4", "bernhard", 0)
      network_id: 4,
      // gas: 4612388 // Gas limit used for deploys
      gas: 4700000 // Gas limit used for deploys
    }
  }
};

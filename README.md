**WARNING: This code is NOT intended or ready for production use. Bad things will happen if you use it as is!**

## About

This is the first PoC implementation of Streems (read more about it [here](https://artis.eco/en/blog/detail/streaming-money-1)).
It includes a contract, a minimal web interface and an interactive test web interface.

Note that most of this was written in mid 2017, thus targets Solidity v0.4.13.
It still compiles (last version tested: v0.4.23), but with a lot of warnings. That's because Solidity has become a safer language since, allowing for and also demanding more explicit expression of intentions. See [Solidity Changelog](https://github.com/ethereum/solidity/blob/develop/Changelog.md).

The goal of this code was to proof feasibilty of continuous transfers (a kind of on-chain value streaming).
Core logic is in ` Streem.sol` which implements a minimal [ERC20 token](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) (to be more precise - a subset of it as it lacks implementation of `transferFrom()`, `approve()` and `allowance()`).

The contracts allow only one outgoing and one incoming Streem per account in order to keep things simple.
This has the side effect of making **nested cycles** impossible to build up.
**Simple cycles** are supposed to be handled correctly by this implementation (no proof given though).

This approach was not further pursued, because I found no simple solution for how to avoid the building up of uncomputable dependency graphs.
While Streems can be chained, such chains make computing the balance at the end of such a Streem chain expensive (as it recurses through that chain) - to a point where it could exceed the block gas limit and thus become effectively uncomputable on-chain. Which would also mean that the last Streem of such a chain couldn't be closed anymore, because closing requires on-chain computation of the balance.
Since I didn't find a satisfying solution to this problem, this PoC wasn't developed further, instead we switched focus the concept of **Basic Streems** (as described [here](https://artis.eco/en/blog/detail/streaming-money-2)).

We also decided to limit Solidity implementations to PoCs and testing purposes and started a native implementation of Basic Streems in [Parity](https://github.com/paritytech/parity).
Such a native implementation allows for considerably reduced transaction costs and makes the basic unit of Account (ETH/ATS) streamable without wrapper.

There's no conventional tests ([like e.g. here](https://github.com/lab10-coop/Play4Privacy/tree/master/blockchain/test)) included. Instead I used a kind of interactive test app in `test.[html|js]` in order to quickly iterate various cases coming to my mind.

## How to run

Needs [truffle](http://truffleframework.com/) ganache-cli installed: `npm install -g truffle ganache-cli`
Start dev chain: `ganache-cli`
Then, in another tab, enter the backend directory and run `./deploy.sh` which will deploy the contract to the dev testnet and update frontend bindings.
TODO: Add watcher option.

You can now interact with the contract in various ways
* using `truffle console`
* using [remix](http://remix.ethereum.org/) (connect it to the local testnet, paste the contract code and load the contract at the deployed address)
* with the web app at `streem.html`
* with the interactive test web app at `test.html`

In order to use the web apps, you need a webserver which can serve the static content in frontend directory.
Now you can point a browser to `streem.html` or `test.html`. In order to have the Apps connect to the locally running ganache-cli, the browser should not inject web3 (e.g. if you have Metamask installed, disabled it).

The contract can of course also be deployed to a public testnet (there's for example a [deployment on Rinkeby](https://rinkeby.etherscan.io/address/0xf73f6bd052061bb84913be57d5f7565b0aa38827)). In order to access such a contract via the web frontend, hardcode the address in the Javascript file and open it in a browser with web3 injected and connected to the respective network.
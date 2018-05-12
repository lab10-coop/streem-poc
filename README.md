**WARNING: This code is NOT intended or ready for production use. Bad things will happen if you use it as is!**

## About

This is the first PoC implementation of *Streems* (for a definition, read below).
It includes a contract, a minimal web interface and an interactive test web interface.

Note that most of this was written in mid 2017, thus targets Solidity v0.4.13.
It still compiles (last version tested: v0.4.23), but with a lot of warnings. That's because Solidity has become a safer language since, allowing for and also demanding more explicit expression of intentions. See [Solidity Changelog](https://github.com/ethereum/solidity/blob/develop/Changelog.md).

The goal of this code was to proof feasibilty of continuous transfers (a kind of on-chain value streaming).
Core logic is in ` Streem.sol` which implements a minimal [ERC20 token](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) (to be more precise - a subset of it as it lacks implementation of `transferFrom()`, `approve()` and `allowance()`).

The contracts allow only one outgoing and one incoming streem per account in order to keep things simple.
This has the side effect of making **nested cycles** impossible to build up.
**Simple cycles** are supposed to be handled correctly by this implementation (no proof given though).

This approach was not further pursued, because I found no simple solution for how to avoid the building up of uncomputable dependency graphs.
While streems can be chained, such chains make computing the balance at the end of such a streem chain expensive (as it recurses through that chain) - to a point where it could exceed the block gas limit and thus become effectively uncomputable on-chain. Which would also mean that the last Streem of such a chain couldn't be closed anymore, because closing requires on-chain computation of the balance.
Since I didn't find a satisfying solution to this problem, this PoC wasn't developed further, instead we switched focus the concept of **Basic Streems** (as described below).

We also decided to limit Solidity implementations to PoCs and testing purposes and started a native implementation of Basic Streems in [Parity](https://github.com/paritytech/parity).
Such a native implementation allows for considerably reduced transaction costs and makes the basic unit of Account (ETH/ATS) streamable without wrapper.

There's no conventional tests ([like e.g. here](https://github.com/lab10-coop/Play4Privacy/tree/master/blockchain/test)) included. Instead I used a kind of interactive test app in `test.[html|js]` in order to quickly iterate various cases coming to my mind.

## How to run

Requires nodejs installed (tested with latest LTS).

* Install [truffle](http://truffleframework.com/) and [ganache-cli](https://github.com/trufflesuite/ganache-cli): `npm install -g truffle ganache-cli`
* Start dev chain: `ganache-cli`
* In another shell, cd into the backend directory and run `./deploy.sh` which will deploy the contract to the dev testnet and update frontend bindings.

You can now interact with the contract in various ways
* using `truffle console`
* using [remix](http://remix.ethereum.org/) (connect it to the local testnet, paste the contract code and load the contract at the deployed address)
* with the web frontend at `streem.html`
* with the test web frontend at `test.html`

Since the web frontends are written in plain HTML and JS, no build process and not even a webserver are needed. Just open `streem.html` or `test.html` in a web browser with solid ES6 support.
In order to have the Apps connect to the locally running ganache-cli, the browser should not inject web3 (e.g. if you have Metamask installed, disabled it).

The contract can of course also be deployed to a public testnet (there's for example a [deployment on Rinkeby](https://rinkeby.etherscan.io/address/0xf73f6bd052061bb84913be57d5f7565b0aa38827)). In order to access such a contract via the web frontend, hardcode the address in the Javascript file and open it in a browser with web3 injected and connected to the respective network.

# Background

The idea of *Streaming Money* was introduced to me in [this talk](https://www.youtube.com/watch?v=l235ydAx5oQ) of Andreas Antonopolous and triggered a thought process leading to this work.
Andreas envisioned something like the Ligthning Network as the technical foundation of stream-like money flows. A practical PoC for such a system can for example be seen in [this Raiden Demo](https://www.youtube.com/watch?v=t6-rf68taTs) (Raiden is kind of the Ethereum counterpart of the Lighning Network).
The promise of such *Payment Channel* systems is to bring transaction costs down to basically zero, allowing to make transactions and transaction frequencies arbitrarilly small.

## Where we come from

Looking back in history, humans have been very creative in choosing objects taking on the function of money (read more about that [here](http://nakamotoinstitute.org/shelling-out/)).
What all of them had in common: they were solid and could thus be transferred only in discrete portions. The nearest we've come to materially represented money which could be transferred continuously is probably oil (through pipelines). But oil hasn't really become money the way for example Gold has and pipelines are pretty complicated and expensive infrastructure.

With the dawn of the Computer era, money nomore required material representation.
Since the introduction of Fiat money already replaced naturally imposed scarcity with socially constructed scarcity, the step forward from purely symbolic pieces of paper to the even more abstract representation of money as data stored on e.g. magnetic disks probably was greatly facilitated.
Still, the way we transacted with that now electronically represented money didn't change as fundamentally as it probably could.

### The missing payment type

Money is the unit of account of economies. It facilitates transactions between actors even when there's no deep enough trust relationship between them and even if cultural, legal or other barriers need to be crossed. In such transactions, Money, being an abstract and universal representation of value, moves in the opposite direction of the actual goods or services of value being exchanged. That's what we call *payment*.

Economic transactions can roughly be divided into 2 categories: *discrete* and *continuous* transactions.
Most transactions involving goods (e.g. buying a coffee) are discrete while many transactions involving services (e.g. subscriptions to Online Services) are continuous.
Despite this, we still use discrete payments for everything. We do somehow emulate continuous payments (typically with monthly recurring payments), but arguably in a pretty clumsy way - considering the technical possibilities of today.
In a way this is like if we were still using buckets instead of pipes in order to bring water into our appartments.

Being able to execute truly continuous payments may bring significant advantages:
* Steadier and simplified cashflows
* Simplified accounting
* Simplified controlling
* Less reliance on auxiliary legal agreements
* Enabling of new kinds of economic transactions

### Auxiliary legal agreements

The inadequacy of discrete payments is often worked around by supplementing them with legal agreements.
While the act of a discrete payment by itself often implies a legally binding agreement between the involving parties, payments for continous services mostly require explicit agreements in the form of written contracts. An important reason for this is that with discrete payments in intervals (e.g. monthly), usually one party needs to bear the risk of being disadvantaged, e.g. a supplier not getting paid after a month of service delivery or a consumer not having a promised service delivered as promised after paying upfront.
Truly continuous payments may make simple, low-overhead implicit agreements possible for more business cases, for example for low-priced online services where entry barriers caused by the transaction (registration procedure, legal agreement, setup of payments) are often more of a detractor for potential customers than the actual monetary cost.

A noteworthy side-effect of that could be better privacy preservation. One could imagine online subscriptions which don't require any more exchange of personal data than buying a paper newspaper at a random kiosk.

# Streems

A Streem is a non-atomic transaction of quantifiable immaterial value.

## Unit

For discrete payments, we use units like € or $.
For continuous payments, at least a time component needs to be added.
Continous € payments could for example be measured in €/h.

In discrete payments, the quantitative measure is named *amount*.
In continuous payments, the equivalent is *flowrate*.

Two simple examples for better imagination:
* Renting a flat for 600€ monthly would translate to a flowrate of approx. 0.83 €/h
* An Austrian average wage of net 1934€ monthly ([source](https://en.wikipedia.org/wiki/List_of_European_countries_by_average_wage#European_countries_by_monthly_average_wage)) would translate to a flowrate of approx. 2.68 €/h
* Supporting somebody via Patreon with 10$ monthly would translate to a flowrate of approx. 0.014 $/h

Note: Trying to calculate this exactly highlights an interesting peculiarity of recurring payments with monthly interval: the price slightly fluctuates based on the number of days a month has.

## Theoretical model

Inspired by the way Blockchains work, we can model the distribution of money at any given point in time as a set of tuples (account, amount).
*Discrete transactions* update the state by moving funds between accounts. Such a discrete transaction can be expressed as the tuple (timestamp, sender, receiver, amount). Allowing only valid transactions (e.g. no account becoming negative, total supply unchanged) is the responsibility of the transaction execution layer.
After such a transaction induced state change, we have another set of tuples (account, amount).

A *continuos transaction* is similar to a discrete one. But instead of an amount which is moved atomically, it specifies a flowrate: (timestamp, sender, receiver, flowrate).
After such a state change, an edge is added to the model which points from the sender to the receiver account and which has the flowrate as weight.

We can thus model a system allowing continuous payments as a directed graph.
If we know the initial state (before any edges existed) and all following transactions, we can deterministically calculate the state (that is, the balance of every account) for any point in time.

In a system with discrete-only transactions, the state is always static and changed only atomically.
In a system with continous transactions added, the state is dynamic, with time becoming a central parameter.

## Types of continuous transactions

Introducing continuous transactions gives the opportunity to define various types of such transactions, some examples being:
* Open ended: Money keeps flowing as long as there's no transaction explicitely stopping it
* Fixed runtime: The runtime of the streem is already defined in the opening transaction
* Splitter: Transactions could specify multiple receivers (e.g. 20% to tax authority for VAT)
* Multi-parameter: Instead of having a fixed flowrate (being parameterized solely by time), flowrates could depend on additional, changing parameters which in a Blockchain context could be injected via Oracles
* Hybrid: A combination of immediate discrete payment and following continuos payments. Useful for transasctions with setup cost or to discourage continuous hop on / hop off to subscriptions.
* Guaranteed margin: Lock account for additional outgoing transactions if balance goes below a defined threshold. Gives stream receiver a time window to detect and react on the stream running out of funds.
* Guaranteed streem: Predefined runtime, full funds locked at start
* Predefined timeframes during which streems can be closed
* Min. delay between sender streem closing transaction and actual closing

## On a Blockchain

Blockchain based money (for simplification, I'll refer to all kinds of coins/tokens/assets as *money*) is typically positive money. In such a system, continuous payments cannot be allowed to cause a negative balance at the sender account. This implies that continuous payments aka streams can underflow (partial or full stop of flow).
As a consequence, the system behaviour in such situations needs to be clearly defined.

Some possible strategies for handling underflows:
* The streem remains open, lacking funds are immediately fed if becoming available at the sender
* The streem remains open, money continues to flow if becoming available again, but the intermediate *gap* isn't recovered
* The streem is automatically closed

In case multiple outgoing streems are competing for less than sufficient funds:
* All of them are patially funded proportional to their flowrate
* Older streems are (fully) served first
* Every streem is in a priority class, higher priority streems are served first

One basic guarantee is needed in any case:
1. At any point in time, knowing the initial state and all transactions which took place since enables deterministic computation of the status quo (that is, of the exact balance of all accounts).
2. The balance of a streem can never decrease

The second guarantee implies that streem receivers can immediately use funds they got through an open streem. That's true even if the streem is still open and/or if it was or currently is in an underflow state.

The main implementation challenge lies in calculating the balance of streems:
* In a densely connected graph, this computation may involve a lot of recursion which is a non-trivial problem in a Blockchain context.
* If allowed to form, the system needs to be able to recognize and handle circles of streems.

Streaming Money - if restricted enough in functionality - could be implemented on a system like Ethereum purely with smart contracts.
In order to implement it in a scalable and flexible enough way, protocol level support may be required.

# Computability

## Unrestricted model

In this (ideal) model, any account can have any number of concurrently open incoming and outgoing streems.

**Definitions**:
* *node* in this context refers to a node in the graph, NOT to a Blockchain node.
* The *time to live* `ttl(s)` of a streem s if the remaining time until s becomes underfunded - assuming that cumulated flowrate of incoming streems `inflow(node)` and static balance `sb(node)` of the source node don't change. If
 `inflow(node) > outflow(node)`, ttl(s) is infinite.
* The *static time to live* `sttl(s)` is defined as `ttl(s)`, but not taking into account `inflow(node)`. Thus it can't be infinite.
* The *recursion depth* `recdep(s)` for a streem s is the number of nodes required to be visited in order to verify that s is fully funded. Note that this varies over time.
* The *recursion terminator* `recterm(s)` for a streem s is the last visited node when verifying that s is fully funded.

**Observations**:
* Computability of the graph improves when average `recdep` gets smaller.
* Average `recdep` gets smaller when average `sttl` gets bigger.

### Snapshot calculations

If a node n with outgoing streem `sout` has an incoming streem `sin`, `sttl(sout)` can be increased by taking a *snapshot* of `sin`.
This is done by calculation the current balance of `sin` and add it to the static balance `sb(n)`.
For correct accounting of repeated snapshots, a timestamp `tssnap(sin)` is persisted.

### Incentivation

**Definitions**:
* The *dynamic transaction fee* dtxfee(s) for a streem s is a fee, denominated in the given streem unit, which is added to the flowrate of s.
* A globally set *streem opening fee multiplied* `openfee`

`dtxfee(s)` is first calculated when opening a streem s. It depends on `sttl(s)` and on a globally set price `dtxfeeprice` (e.g. determined by the consensus algo).
For example: `dtxfee(s) = 1/log(sttl(x)) * dtxfeeprice`.

Opening streem s incurs an upfront fee payment `initdtxfee(s) = openfee * dtxfee(s)`.
As long as s is open, dtxfee(s) is continuously deducated from the sender balance by adding it to the flowrate of s.

With such a mechanism, opening a streem could become prohibitively expensive in certain scenarios, e.g. for a node low on funds trying to open a streem with high flowrate.
`openfee` is specifically ment to protect against Spam attacks.

### Monitoring

Instead of allowing streems to become underfunded, the following strategy may be applied:

**Definition**:
* The *next check timestamp* `ncheckts(s)` of a streem s is the earliest possible time when s may become underfunded.

When a streem s is opened, its `ncheckts(s)` is calculated by adding `ttl(s)` to the current time. If the result isn't infinite, a timed callback is installed. That is, once the timestamp is reached, the system re-calculates  `ttl(s)`. This calculation can have one of the following **consequences**:
* If the new `ttl(s)` is zero, s is closed.
* Otherwise
 * a new `ncheckts(s)` is calculated and persisted.
 * `dtxfee(s)` is recalculated and updated.
 * (optional): a snapshot of s is taken (possible criterium: do the achievable savings due to `dtxfee(s)` reduction outweigh the cost of taking the snapshot?)

Monitoring tasks take place outside the scope of transactions.
In order to never have that tasks overwhelm the system, the parameters governing dynamic transaction fees need to be constantly kept up to date and set such that there's enough safety margin.

### Cycles

Cycles in the sub-graph of a given streem s become relevant only if `recdep(s)` reaches that cycle.

TODO: take a deeper dive into graph theory

## Basic Streems

In order to avoid the challenges of graph computability in a first iteration, some rules could be introduced.

We introduce the following **account types**:
* Concentrator
* Deconcentrator
* Open (default)

### Concentrator

A *Concentrator Account* accepts an unlimited number of concurrent incoming streems and no outgoing streems.
Flowrate, opening and closing time of individual incoming streems can be independent of each other.

Calculation of the account balance has complexity O(n) with n being the number of open streems.
This poses a potential DoS vector if not mitigated. Possible mitigation strategies:
* price the `balance` opcode accordingly
* limit the max number of concurrent incoming streems
 * option: define sub-categories with different limits
* optimization guaranteeing an upper bound, e.g. periodically updated aggregate

Since no outgoing streems are allowed, only the account owner can be affected by the balance calculation becoming expensive (which - when done outside of transaction scope isn't an issue anyway).

### Deconcentrator

A *Deconcentrator Account* accepts no incoming streems and an unlimited number of outgoing streems.
Flowrate, opening and closing time of individual outgoing streems can be independent of each other.

If a deconcentrator runs out of funds, all outgoing streems are affected proportionally to their flowrate. Since there's no incoming streems, the balance of individual outgoing streems can be calculated cheaply at any time based on incremental aggregate snapshots updated whenever an outgoing streem is opened or closed.

### Open

An *Open Account* can have up to `open_max_in` (concrete number to be determined empirically) incoming streems from deconcentrators and up to `open_max_out` outgoing streems to concentrators.
It cannot have incoming streems from or outgoing streems to other open accounts.

That way, it's possible to have accounts with streem-based cashflows - that is, open incoming and outgoing streems at the same time - which may be useful for many use cases.

`open_max_in` and `open_max_out` are to be chosen such that even in a worst case scenario the transaction cost doesn't become unsustainable or pose a DoS vector.

### Graph

When modeling such a system as directed graph where streems between 2 accounts represent the edges between 2 nodes, arbitrarily large sub-graphs can be created.
Despite this, no cycles are possible and there's no danger of unbounded recursion.
In order to calculate the balance of any given node with n incoming streems, the number of nodes to be visited is limited to:
* for concentrators: `n * open_max_in`
* for deconcentrators: `0` (no incoming streems allowed)
* for open accounts: `open_max_in`

This shows how the limitation `open_max_in` allows us to keep complexity at `O(n)` without making relevant sacrifices in regard to envisioned use cases.

As already noted, the only possible expensive case is with concentrators - even here it's just `O(n)` (the limitation of number of streems for open accounts avoids this to become `O(n^2))`.
The only limitation that causes is that it may lead to concentrator accounts not being able to transfer all their funds (especially those from streems still open) in a single discrete transaction. For concentrator use cases, there's a choice between going along with that limitation or limiting the number of incoming streems by using multiple concentrator accounts instead of a single one. We may also mitigate that with some kind of snapshot calculations.

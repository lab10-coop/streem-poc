## About

The idea is described in more detail [here]().  

## Status

PoC of the concept including an ERC-20 compatible token contract and a minimal web interface for opening, closing and observing streams.

## Next

Next steps would be:
* Make the contract multi-stream capable (accounts can have both multiple instreams and outstreams). This probably requires something like `mapping (address => (uint => Stream)) [in|out]streams`.
 * How can existing streams be referenced from outside? Should it be possible to name them when opening?
* Decide on a set of possible semantics and design the interface accordingly. E.g.
 * Streams which auto-close when running out of funds
 * Streams which guarantee a specified per-warning time before running out of stream (blocking outgoing transfers if balance too low)
 * Streams with close date already predetermined
 * Advanced: Streams depending on oracle data (dependents: speed, open state)
 * Streams which can be closed by the receiver (should probably always be allowed)
* Events
* Check interoperability with various ERC-20 wallets.
* Figure out the issuance and governance mechanics and implement them.
 
Further a lot of attention needs to go into robustness of the contracts (special cases, error handling, gas economics).

When enough is known, consider the overall contract architecture (e.g. a token contract and an issuance contract). Should anything be upgradable? Any kind of emergeny mechanism?
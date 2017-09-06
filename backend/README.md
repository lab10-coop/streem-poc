# How to run

Needs truffle and testrpc installed: `npm install -g truffle ethereumjs-testrpc`  
Start testrpc: `testrpc`  
Then, in another tab run `./contract-changed.sh` whenever the contract should be re-compiled JS bindings updated.  
TODO: Add watcher option.

# The dynamic challenge

When checking the balance of a receiving address or closing an incoming stream, it's not enough to just look at the static balance of the sender.

**Sender has incoming stream(s)**: In this case looking at only staticBalance may return a too low result and lead to unnecessary drying of the stream.

**Sender has outgoing stream(s)**: In this case looking at only staticBalance may return a too high result, leading to a drying stream not being noticed.

Also, when doing a discrete transfer, it may now happen that the staticBalance is smaller than balance. Thus the amount can't just be subtracted from staticBalance.  
Can we make staticBalance an int or would that introduce other issues?

## Options

### Only one stream per account

In this case an account could have only either an outgoing or an incoming stream.
Thus a receiver could rely on the sender not having any other stream, thus looking at staticBalance alone would be enough.

### Max one incoming and one outgoing stream 

In this case a receiver could rely on the sender not having any other stream draining staticBalance.
Still she'd need for account for a potential parallel incoming stream.

Problem: there could be a circular relationship. E.g. A streams to B and B streams to A.
How to implement this without the potential for an endless recursion?

* Avoid creation of such a constellation (e.g. have *openStream()* check it)
* Find a way to implement it safely (should be possible, but I don't yet have an idea how)

Either way, we still need to protect from the risk of running out of gas due to many dependencies.  
A possible solution could be a kind of maintenance cronjob which regularly creates kind of snapshots which cut down the dependencies on other streams.
That could be achieved by some kind of transient staticBalance reflecting a snapshot (what if all streams were closed at this point in time).
Such a value would increase the probability of receivers not needing to check incoming streams of the sender in case the transient staticBalance minus outgoing streams remained above the required threshold.  
However for calculating the remaining runway for a stream, this may not help (?) - (does the gas limit apply for local execution?)

### Limited number of streams per account

This could probably be implemented with arrays.
Would need a clear strategy (or multiple) for how to deal with dry streams - similar to how insolvencies are dealt with.
Basic strategies are: 
* first come first serve (e.g. older streams are served first)
* proportional: needs to know the point in time starting from which streams are underfunded / dry
* priority classes: could be combined with either the first come first serve or proportional strategy

Guess: Allowing 2 incoming and 2 outgoing streams would allow to construct all compositions possible with arbitrary number of streams by using *intermediate* accounts for aggregation or splitting.

### Arbitrary number of streams per account

Logically identical to the *limited number of streams* option.
But probably a considerably bigger implementation challenge in terms of complexity and gas cost. E.g. fixed size array nomore an option.

A possibility could be to have *openStream()* measure the complexity of the dependencies based on the involved addresses and not execute if it exceeds some safety threshold.

## Basic strategy

Whenever a transaction takes place, it can be used for some bookkeeping.  
Most importantly, a kind of intermediate settlement can be done for open streams. This can be seen as persisting the results of calculations.  
Since dynamically calculated status snapshots depending on the current time are guaranteed / final, such states can as well be persisted.

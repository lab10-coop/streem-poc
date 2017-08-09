// TODO: use the SafeMath lib of openzeppelin (implicit overflow checks etc)?
// TODO: check if this complies with the recommended style: http://solidity.readthedocs.io/en/develop/style-guide.html

pragma solidity ^0.4.11;

// Status of this contract: PoC of a basic ERC-20 token with streaming functionality (1 outgoing/incoming stream per account)
// TODO: decide on vocabularity for start/open, stop/close, dry/run out of funds/underwater (distinguish between low and no current funding)
contract Streem {
    uint256 public totalSupply;
    string public constant name = "Streem";
    string public constant symbol = "STR";
    uint8 public constant decimals = 0;
    address owner;

    /*
     * this map stores the fractions of account balances which are already "settled" by a transaction.
     * It's just an implementation detail - the "settled" fraction of balance is in no way different or superior to
     * the "unsettled" one.
     */
    mapping (address => int256) settledBalances;

    struct Stream {
        address sender;
        address receiver;
        uint256 perSecond;
        uint256 startTimestamp;
    }

    /*
     * In order to avoid duplicated storage of Stream objects (for mappings from sender and receiver),
     * a construct with manual pointer (uint) is used.
     * See https://ethereum.stackexchange.com/questions/23274/storing-the-same-struct-in-two-mappings
     */
    mapping(address => uint) outStreamPtrs;
    mapping(address => uint) inStreamPtrs;
    // TODO: convert to mapping (better suited when elements are deleted)
    Stream[] streams;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event StreamOpened(address indexed _from, address indexed _to, uint256 _perSecond);
    event StreamClosed(address indexed _from, address indexed _to, uint256 _perSecond, uint256 _settledBalance, uint256 _outstandingBalance);

    // constructor
    function Streem(uint initialSupply) {
        owner = msg.sender;
        settledBalances[msg.sender] = int(initialSupply);
        totalSupply = initialSupply;
        streams.push(Stream(0,0,0,0)); // empty first element for implicit null-like semantics
    }

    /*
     * opens a stream from the transaction sender to the given receiver with the given speed.
     * Will succeed only if the sender has no stream open and isn't underfunded
     */
    function openStream(address receiver, uint256 perSecond) {
        assert(! exists(getOutStreamOf(msg.sender)));
        //assert(balanceOf(msg.sender) > perSecond);
        assert(balanceOf(msg.sender) >= 0); //TODO: what initial requirement makes most sense?
        // now is an alias to block.timestamp. See http://solidity.readthedocs.io/en/develop/units-and-global-variables.html?highlight=blocknumber
        var streamId = streams.push(Stream(msg.sender, receiver, perSecond, now)) - 1; // id = array_length - 1
        outStreamPtrs[msg.sender] = streamId;
        inStreamPtrs[receiver] = streamId;

        StreamOpened(msg.sender, receiver, perSecond);
    }

    // returns the settled balance and the outstanding balance (> 0 if underfunded)
    function settleStream(Stream s) internal returns (uint, uint) {
        var bal = streamBalance(s, s, 1);
        uint dt = uint(bal / s.perSecond);
        // since we don't allow fractional seconds, the possible settleBalance may be lower than the actual streamBalance (TODO: sure?)
        var settleBal = dt * s.perSecond;
        var naiveBal = naiveStreamBalance(s); // remember before manipulating the stream

        settledBalances[s.sender] -= int(settleBal);
        settledBalances[s.receiver] += int(settleBal); // inS.receiver == msg.sender
        // TODO: make sure we really don't need an extra field for this intermediate settlement.
        // For correct behaviour, it's irrelevant what the start time of the stream is.
        // Applications can rely on the StreamOpened-Event for the UI.
        // Still, the field may need a name better reflecting this flexible use.
        s.startTimestamp += dt;
        // TODO: disable checks in prod if they cost gas and the logic is proofed
        assert(s.startTimestamp <= now);
        assert(settleBal <= naiveBal);

        return (settleBal, naiveBal - settleBal);
    }

    // settle and close the outgoing stream
    function closeStream() {
        var outS = getOutStreamOf(msg.sender);
        assert(exists(outS));
        var (settleBal, outstandingBal) = settleStream(outS);

        StreamClosed(msg.sender, outS.receiver, outS.perSecond, settleBal, outstandingBal);

        // make sure this remains the last statement because the stream handle is a reference
        deleteOutStreamOf(msg.sender);
    }

    // ERC-20 compliant function for discrete transfers
    function transfer(address _to, uint256 _value) {
        assert(_value > 0 && balanceOf(msg.sender) >= _value);

        // if the settled balance doesn't suffice, settle the available funds of the ingoing stream.
        /*
        if(settledBalances[msg.sender] < int(_value)) {
            var inS = getInStreamOf(msg.sender);
            settleStream(inS);

            // lets check again! TODO: once the logic was validated / proofed, this checks should be superfluous
            assert(balanceOf(msg.sender) >= _value);
        }
        */

        settledBalances[msg.sender] -= int(_value);
        settledBalances[_to] += int(_value);
        Transfer(msg.sender, _to, _value);
    }

    // Solidity (so far) has no simple null check, using startTimestamp as guard (assuming 1970 will not come back).
    function exists(Stream s) internal constant returns (bool) {
        return s.startTimestamp != 0;
    }

    // TODO: what's best practice for using uint vs uint256?
    function min(uint a, uint b) constant returns (uint) {
        return a < b ? a : b;
    }

    // returns a reference (!) to the outgoing stream of the given address. Caller needs to check existence on the return value.
    function getOutStreamOf(address addr) internal constant returns (Stream storage) {
        return streams[outStreamPtrs[addr]];
    }

    function getInStreamOf(address addr) internal constant returns (Stream storage) {
        return streams[inStreamPtrs[addr]];
    }

    // as long as only senders can close a stream, this is only needed for outstreams
    function deleteOutStreamOf(address addr) internal {
        var sid = outStreamPtrs[addr];
        delete streams[sid];
    }

    function equals(Stream s1, Stream s2) internal constant returns (bool) {
        // TODO: not multi-stream ready
        return s1.sender == s2.sender && s1.receiver == s2.receiver;
    }

    // returns the naive "should be" balance of a stream, ignoring the possibility of it running out of funds
    function naiveStreamBalance(Stream s) internal constant returns (uint256) {
        return (now - s.startTimestamp) * s.perSecond;
    }

    /*
     * returns the "real" (based on sender solvency) balance of a stream.
     * This takes the perspective of the sender, making the stream under investigation an outgoingStream.
     * Implements min(outgoingStreamBalance, staticBalance + incomingStreamBalance)
     * TODO: due to the involved recursion, this will lead to an endless loop in circular relations, e.g. A -> B, B -> A
     */
    function streamBalance(Stream s, Stream origin, uint hops) internal constant returns (uint256) {
        // naming: osb -> outgoingStreamBalance, isb -> incomingStreamBalance, sb -> static balance
        uint256 osb = naiveStreamBalance(s);

        if(equals(s, origin) && hops > 1) { // special case: break on circular dependency. TODO: proof correctness
            return osb;
        } else {
            var inS = getInStreamOf(s.sender);
            uint256 isb = exists(inS) ? streamBalance(inS, origin, hops + 1) : 0;

            int sb = settledBalances[s.sender];

            // TODO: Proof needed
            assert(sb + int(isb) >= 0);

            return min(osb, uint(sb + int(isb)));
        }
    }

    // this balance function can return a negative value if an outgoing stream went "under water"
    // and a higher than real balance if an incoming stream went "under water".
    // note that this is NOT the actual balance, just a theoretical value
    // TODO: refactor
    //    function owedBalanceOf(address _owner) constant returns (int256 balance) {
    //        uint256 inStreamBal = 0;
    //        var inStream = inStreams[_owner];
    //        // no prettier null check possible? https://ethereum.stackexchange.com/questions/871/what-is-the-zero-empty-or-null-value-of-a-struct
    //        if(inStream.startTimestamp != 0) {
    //            inStreamBal = (now - inStream.startTimestamp) * inStream.perSecond;
    //        }
    //
    //        uint256 outStreamBal = 0;
    //        var outStream = outStreams[_owner];
    //        if(outStream.startTimestamp != 0) {
    //            outStreamBal = (now - outStream.startTimestamp) * outStream.perSecond;
    //        }
    //
    //        // TODO: check overflow before casting
    //        balance = int256(settledBalances[_owner] + inStreamBal - outStreamBal);
    //        return balance;
    //    }

    function balanceOf(address _owner) constant returns (uint256) {
        var inS = getInStreamOf(_owner);
        // no prettier null check possible? https://ethereum.stackexchange.com/questions/871/what-is-the-zero-empty-or-null-value-of-a-struct
        uint256 inStreamBal = exists(inS) ? streamBalance(inS, inS, 1) : 0;

        var outS = getOutStreamOf(_owner);
        uint256 outStreamBal = exists(outS) ? streamBalance(outS, outS, 1) : 0;

        // TODO: check overflow before casting
        assert(settledBalances[_owner] + int(inStreamBal) - int(outStreamBal) >= 0);
        return uint(settledBalances[_owner] + int(inStreamBal) -int(outStreamBal));
    }

    // TODO: implement the empty function?


    // ####################### dev / testing helpers #############################

    // TODO: this is just for the test token. Issuance mechanism for mainnet token to be decided.
    function dev_issueTo(address receiver, uint256 amount) {
        require(msg.sender == owner);
        settledBalances[receiver] += int(amount);
        totalSupply += amount;
    }

    // TODO: this is just for testing purposes
    // reset to initial state. Needs to be called by every address involved so far
    function dev_reset() {
        settledBalances[msg.sender] = 0;
        outStreamPtrs[msg.sender] = 0;
        inStreamPtrs[msg.sender] = 0;

        if(msg.sender == owner) {
            settledBalances[msg.sender] = int(totalSupply);

            delete streams;
            streams.push(Stream(0,0,0,0));
        }
    }

    function dev_streamsLength() constant returns (uint) {
        return streams.length;
    }

    function dev_settledBalance() constant returns (int) {
        return int(settledBalances[msg.sender]);
    }

    // returns sender, speed and age (in seconds)
    function dev_inStream() constant returns (address, uint, uint) {
        var s = getInStreamOf(msg.sender);
        return (s.sender, s.perSecond, now-s.startTimestamp);
    }

    // returns receiver, speed and age (in seconds)
    function dev_outStream() constant returns (address, uint, uint) {
        var s = getOutStreamOf(msg.sender);
        return (s.receiver, s.perSecond, now - s.startTimestamp);
    }
}

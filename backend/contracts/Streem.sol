// TODO: use the SafeMath lib of openzeppelin (implicit overflow checks etc)?
// Status of this contract: PoC of a basic ERC-20 token with streaming functionality (1 outgoing/incoming stream per account)

pragma solidity ^0.4.11;

// TODO: decide on vocabularity for start/open, stop/close, dry/run out of funds/underwater (distinguish between low and no current funding)
contract Streem {
    uint256 public totalSupply;
    string public constant name = "Streem";
    string public constant symbol = "STR";
    uint8 public constant decimals = 0;
    address owner;

    mapping (address => uint256) staticBalances;

    struct Stream {
        address sender;
        address receiver;
        uint256 perSecond;
        uint256 startTimestamp;
    }

    // TODO: map to array of Streams (support more than 1 per account)
    mapping (address => Stream) outStreams;
    mapping (address => Stream) inStreams;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event StreamOpened(address indexed _from, address indexed _to, uint256 _perSecond);
    event StreamClosed(address indexed _from, address indexed _to, uint256 _perSecond, uint256 _settledBalance, uint256 _outstandingBalance);

    function Streem(uint initialSupply) {
        owner = msg.sender;
        staticBalances[msg.sender] = initialSupply;
        totalSupply = initialSupply;
    }

    // TODO: this is just for the test token. Issuance mechanism for mainnet token to be decided.
    function issueTo(address receiver, uint256 amount) {
        require(msg.sender == owner);
        staticBalances[receiver] += amount;
        totalSupply += amount;
    }

    // TODO: return value?
    function openStream(address receiver, uint256 perSecond) {
        // TODO: right now it will just overwrite the config of a previous stream if any.
        assert(balanceOf(msg.sender) > 0);
        // now is an alias to block.timestamp. See http://solidity.readthedocs.io/en/develop/units-and-global-variables.html?highlight=blocknumber
        var s = Stream(msg.sender, receiver, perSecond, now);
        outStreams[msg.sender] = s;
        inStreams[receiver] = s;
        StreamOpened(msg.sender, receiver, perSecond);
    }

    // settle and close
    function closeStream() {
        var stream = outStreams[msg.sender];
        // fail if no stream is open. TODO: support more than 1 per pair
        assert(stream.startTimestamp != 0);
        uint256 streamBal = (now - stream.startTimestamp) * stream.perSecond;
        uint256 settleBal = 0;
        uint256 outstandingBal = 0;
        if(streamBal <= staticBalances[msg.sender]) {
            settleBal = streamBal;
        } else {
            // special case: the receiver (partially) defaults on the stream
            settleBal = staticBalances[msg.sender];
            outstandingBal = streamBal - settleBal;
        }
        staticBalances[msg.sender] -= settleBal;
        staticBalances[stream.receiver]  += settleBal;

        delete inStreams[stream.receiver];
        delete outStreams[msg.sender];

        StreamClosed(msg.sender, stream.receiver, stream.perSecond, settleBal, outstandingBal);
    }

    // TODO: needs to consider the dynamic balance (streams included). How to deal with _value > staticBalance? Allow negative staticBalance?
    function transfer(address _to, uint256 _value) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        assert(staticBalances[msg.sender] >= _value && _value > 0);
        staticBalances[msg.sender] -= _value;
        staticBalances[_to] += _value;
        Transfer(msg.sender, _to, _value);
    }

    // Solidity (so far) has no simple null check, using startTimestamp as guard (assuming 1970 will not return).
    function exists(Stream s) internal constant returns (bool) {
        return s.startTimestamp != 0;
    }

    // TODO: what's best practice for using uint vs uint256?
    function min(uint a, uint b) constant returns (uint) {
        return a < b ? a : b;
    }

    // returns the balance of a stream, ignoring the possibility of it running out of funds
    function naiveStreamBalance(Stream s) internal constant returns (uint256) {
        return (now - s.startTimestamp) * s.perSecond;
    }

    /*
     * returns the "real" (based on sender solvency) balance of a stream.
     * This takes the perspective of the sender, making the stream under investigation an outgoingStream.
     * Implements min(outgoingStreamBalance, staticBalance + incomingStreamBalance)
     * TODO: due to the possible recursion, this will lead to an endless loop in circular relations, e.g. A -> B, B -> A
     */
    function streamBalance(Stream s) internal constant returns (uint256) {
        // naming: osb -> outgoingStreamBalance, isb -> incomingStreamBalance, sb -> static balance
        uint256 osb = naiveStreamBalance(s);

        var inS = inStreams[s.sender];
        uint256 isb = exists(inS) ? streamBalance(inS) : 0;

        uint sb = staticBalances[s.sender];

        return min(osb, sb + isb);
    }

    // this balance function can return a negative value if an outgoing stream went "under water"
    // and a higher than real balance if an incoming stream went "under water".
    // note that this is NOT the actual balance, just a theoretical value
    // TODO: refactor
    function owedBalanceOf(address _owner) constant returns (int256 balance) {
        uint256 inStreamBal = 0;
        var inStream = inStreams[_owner];
        // no prettier null check possible? https://ethereum.stackexchange.com/questions/871/what-is-the-zero-empty-or-null-value-of-a-struct
        if(inStream.startTimestamp != 0) {
            inStreamBal = (now - inStream.startTimestamp) * inStream.perSecond;
        }

        uint256 outStreamBal = 0;
        var outStream = outStreams[_owner];
        if(outStream.startTimestamp != 0) {
            outStreamBal = (now - outStream.startTimestamp) * outStream.perSecond;
        }

        // TODO: check overflow before casting
        balance = int256(staticBalances[_owner] + inStreamBal - outStreamBal);
        return balance;
    }

    // the ERC-20 standard requires an uint return value
    // TODO: remove duplication. Maybe call honestBalance instead and take min(0, bal)
    function balanceOf(address _owner) constant returns (uint256) {
        var inS = inStreams[_owner];
        // no prettier null check possible? https://ethereum.stackexchange.com/questions/871/what-is-the-zero-empty-or-null-value-of-a-struct
        uint256 inStreamBal = exists(inS) ? streamBalance(inS) : 0;

        var outS = outStreams[_owner];
        uint256 outStreamBal = exists(inS) ? streamBalance(outS) : 0;

        // TODO: check overflow before casting
        return staticBalances[_owner] + inStreamBal - outStreamBal;
    }
}

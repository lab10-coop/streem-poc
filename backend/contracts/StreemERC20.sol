pragma solidity ^0.4.13;

import "./Streem.sol";

// inspired by https://github.com/mattdf/payment-channel/blob/master/channel.sol

// just the interface we need
// TODO: use "interface" keyword (with solc 0.4.15)
contract IERC20Token {
    function balanceOf(address _owner) constant returns (uint balance);
    function transfer(address _to, uint _value) returns (bool success);
}

// TransferAccount instances hold the deposits of tokens converted to streamable tokens.
// Dumb contract which only contains a proxy transfer function
// also see https://github.com/bancorprotocol/contracts/blob/master/solidity/contracts/TokenHolder.sol
contract TransferAccount {
    address owner;

    function TransferAccount() {
        owner = msg.sender;
    }

    // this just forwards a transfer request. Needs to be done by the contract itself in order to have msg.sender correct.
    // TODO: could this also take an ERC20 object as param instead of address?
    function transfer(address tokenAddr, address receiver, uint256 amount) returns (bool) {
        assert(msg.sender == owner);
        var token = IERC20Token(tokenAddr);
        return token.transfer(receiver, amount);
    }
}

// one instance represents one ERC20 token, the rest is very similar to the normal Streem contract.
// a model where a contract exists per user would offer more implicit security, but be less efficient (?)
contract StreemERC20 is Streem {
    event Withdrawal(address sender, uint amount);

    address owner;
    IERC20Token token;
    address tokenAddr;
    mapping (address => TransferAccount) transferAccounts;

    event TransferAccountCreated(address forAccount, address transferAddr);

    // constructor. TODO: dynamically configure
    function StreemERC20(address _tokenAddr) Streem(0, "Streaming Token", "STOK", 0) {
        tokenAddr = tokenAddr;
        token = IERC20Token(_tokenAddr);
    }

    // ################## Public functions ###################

    function createTransferAccount() returns (address) {
        var tAcc = new TransferAccount();
        transferAccounts[msg.sender] = tAcc;
        TransferAccountCreated(msg.sender, tAcc);
        return address(transferAccounts[msg.sender]);
    }

    // override
    function transfer(address _to, uint256 _value) {
        poolTransferAccountFor(msg.sender);
        super.transfer(_to, _value);
    }

    // override
    function openStream(address receiver, uint256 perSecond) {
        poolTransferAccountFor(msg.sender);
        super.openStream(receiver, perSecond);
    }

    // override
    function closeStream() {
        poolTransferAccountFor(msg.sender);
        super.closeStream();
    }

    // withdrawal of owner tokens
    function withdraw(uint256 amount) {
        poolTransferAccountFor(msg.sender);

        // following the Checks-Effects-Interaction Pattern
        assert(balanceOf(msg.sender) >= amount);
        settledBalances[msg.sender] -= int(amount);
        totalSupply -= amount;
        assert(token.transfer(msg.sender, amount));
        Withdrawal(msg.sender, amount);
    }

    // ################## Public constant functions ###################

    function tokenAddress() constant returns(address) {
        return address(token);
    }

    function getTransferAccount() constant returns (address) {
        return transferAccounts[msg.sender];
    }

    // override
    function balanceOf(address addr) constant returns (uint256) {
        var baseBal = super.balanceOf(addr);
        var transferAddr = address(transferAccounts[addr]);
        if(transferAddr != 0) {
            return baseBal + token.balanceOf(transferAddr);
        } else {
            return baseBal;
        }
    }

    // ################## Internal functions ###################

    // If there's funds in an associated transfer account, transfer it to this contract (pool)
    // returns the amount moved over
    function poolTransferAccountFor(address addr) internal returns(uint) {
        if(address(transferAccounts[addr]) != 0) {
            var tBal = token.balanceOf(address(transferAccounts[addr]));
            if(tBal >= 0) {
                // TODO: is assert a reasonable strategy here?
                assert(transferAccounts[addr].transfer(address(token), this, tBal));
                totalSupply += tBal;
                settledBalances[addr] += int(tBal);
                return tBal;
            }
        }
        return 0;
    }
}
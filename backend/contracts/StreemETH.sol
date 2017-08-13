pragma solidity ^0.4.13;

import "./Streem.sol";

// inspired by https://github.com/mattdf/payment-channel/blob/master/channel.sol

// one instance represents one ERC20 token, the rest is very similar to the normal Streem contract.
// a model where a contract exists per user would offer more implicit security, but be less efficient (?)
contract StreemETH is Streem {
    event Deposit(address sender, uint amount);
    event Withdrawal(address sender, uint amount);

    function StreemETH() Streem(0, "Streaming Ether", "SETH", 18) {}

    // function charge is to be handled outside of this contract (direct call of token.transfer(trusteeAddr, amount))

    // conversion from StreemETH to ETH
    function withdraw(uint256 amount) {
        // following the Checks-Effects-Interaction Pattern
        assert(balanceOf(msg.sender) >= amount);
        settledBalances[msg.sender] -= int(amount);
        totalSupply -= amount;
        msg.sender.transfer(amount);
        Withdrawal(msg.sender, amount);
    }
    // converstion from ETH to StreemETH
    function() payable {
        settledBalances[msg.sender] += int(msg.value);
        totalSupply += msg.value;
        Deposit(msg.sender, msg.value);
    }
}
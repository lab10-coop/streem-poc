pragma solidity ^0.4.13;

import "./Streem.sol";

contract StreemETH is Streem {
    event Deposit(address sender, uint amount);
    event Withdrawal(address sender, uint amount);

    // constructor: just call the base constructor with the right args
    function StreemETH() Streem(0, "Streaming Ether", "SETH", 18) {}

    // conversion from StreemETH to ETH
    function withdraw(uint256 amount) {
        // following the Checks-Effects-Interaction Pattern
        assert(balanceOf(msg.sender) >= amount);
        settledBalances[msg.sender] -= int(amount);
        totalSupply -= amount;
        msg.sender.transfer(amount);
        Withdrawal(msg.sender, amount);
    }
    // conversion from ETH to StreemETH
    function() payable {
        settledBalances[msg.sender] += int(msg.value);
        totalSupply += msg.value;
        Deposit(msg.sender, msg.value);
    }
}
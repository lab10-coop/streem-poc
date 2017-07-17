pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Streem.sol";

contract TestStreem {
    function testInitialBalanceUsingDeployedContract() {
        Streem streem = Streem(DeployedAddresses.Streem());

        uint expected = 100000000;

        Assert.equal(streem.balanceOf(tx.origin), expected, "Owner should have 10000 STR initially");
    }

    function testTotalSupplyWithNewContract() {
        uint expected = 10000;
        Streem streem = new Streem(expected);

        Assert.equal(streem.totalSupply(), expected, "totalSupply should be 10000");
    }

    // TODO: test actual streaming functionality
}

pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Streem.sol";

contract TestStreem {
    
    address owner;
    
    function testInitialBalanceUsingDeployedContract() {
        owner = tx.origin;
        Streem streem = Streem(DeployedAddresses.Streem());

        uint expected = 10000;
        
        //// issue some tokens to the owner
        //streem.dev_issueTo(owner, expected);
        //streem.dev_issueTo(tx.origin, 10000);
        //uint balance = streem.balanceOf(tx.origin);

        Assert.equal(streem.balanceOf(tx.origin), expected, "Owner should have 10000 STR initially");
    }

    function testTotalSupplyWithNewContract() {
        uint expected = 10000;
        Streem streem = new Streem(expected, "UnitTestStreem", "TEST-STR", 0);
        
        Assert.equal(streem.totalSupply(), expected, "totalSupply should be 10000");
    }

    // TODO: test actual streaming functionality
}

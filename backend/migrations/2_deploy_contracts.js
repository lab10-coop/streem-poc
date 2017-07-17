var Streem = artifacts.require("./Streem.sol");

module.exports = function(deployer) {
  deployer.deploy(Streem, 100000000); // the second param is for the contract constructor
};

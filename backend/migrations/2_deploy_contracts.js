var Streem = artifacts.require("./Streem.sol");
//var Streemify = artifacts.require("./Streemify.sol");
var StreemETH = artifacts.require("./StreemETH.sol");

module.exports = function(deployer) {
  deployer.deploy([
      [Streem, 100000000], // the second param is for the contract constructor
      StreemETH
]);

//  deployer.deploy(Streemify);
  //deployer.deploy(StreemETH);
};

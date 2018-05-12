var Streem = artifacts.require("./Streem.sol");
//var StreemETH = artifacts.require("./StreemETH.sol");

module.exports = function(deployer) {
  deployer.deploy([
      [Streem, 100000000, "STREEM", "STR", 0]
//      StreemETH
  ]);
};

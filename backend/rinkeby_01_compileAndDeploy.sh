#!/bin/bash

# Invokes 'truffle migrate' (compile, re-deploy)
# and tells the node script in frontend to update the JS file representing the contract

set -e
set -u

# --reset makes sure a new instance of the contract is deployed
truffle migrate --reset

node apply_contract_update.js build/contracts/Streem.json ../frontend/js/streem_contract.js
node apply_contract_update.js build/contracts/StreemETH.json ../frontend/js/streemETH_contract.js
echo "deployment on rinkeby finished"

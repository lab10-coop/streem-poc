#!/bin/bash

# Invokes 'truffle migrate' (compile, re-deploy)
# and tells the node script in frontend to update the JS file representing the contract

set -e
set -u

truffle migrate

node apply_contract_update.js build/contracts/Streem.json ../frontend/js/streem_contract.js
echo "update applied"

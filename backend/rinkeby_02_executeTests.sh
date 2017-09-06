#!/bin/bash

set -e
set -u

# run the deployed test-contract with all tests (needs 1.61 ETH!) 
truffle --network rinkeby test

echo "testing on rinkeby finished"

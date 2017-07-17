
// !!! this is autogenerated by a setup script. Changes will be overwritten !!!
const contract = {
  "contract_name": "Streem",
  "abi": [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "receiver",
          "type": "address"
        },
        {
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "issueTo",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "receiver",
          "type": "address"
        },
        {
          "name": "perSecond",
          "type": "uint256"
        }
      ],
      "name": "openStream",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "closeStream",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "honestBalanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "int256"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "initialSupply",
          "type": "uint256"
        }
      ],
      "payable": false,
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "_perSecond",
          "type": "uint256"
        }
      ],
      "name": "StreamOpened",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "_perSecond",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "_settledBalance",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "_outstandingBalance",
          "type": "uint256"
        }
      ],
      "name": "StreamClosed",
      "type": "event"
    }
  ],
  "unlinked_binary": "0x6060604052341561000c57fe5b60405160208061086183398101604052515b60018054600160a060020a03191633600160a060020a031690811790915560009081526002602052604081208290558190555b505b6107ff806100626000396000f300606060405236156100885763ffffffff60e060020a60003504166306fdde03811461008a5780631207f0c11461011a57806318160ddd1461013b578063313ce5671461015d57806364a80c0c1461018357806370a08231146101a457806395d89b41146101d25780639dad938214610262578063a9059cbb14610274578063afb028bf146101a4575bfe5b341561009257fe5b61009a6102c3565b6040805160208082528351818301528351919283929083019185019080838382156100e0575b8051825260208311156100e057601f1990920191602091820191016100c0565b505050905090810190601f16801561010c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561012257fe5b610139600160a060020a03600435166024356102e6565b005b341561014357fe5b61014b61032b565b60408051918252519081900360200190f35b341561016557fe5b61016d610331565b6040805160ff9092168252519081900360200190f35b341561018b57fe5b610139600160a060020a0360043516602435610336565b005b34156101ac57fe5b61014b600160a060020a0360043516610447565b60408051918252519081900360200190f35b34156101da57fe5b61009a6104df565b6040805160208082528351818301528351919283929083019185019080838382156100e0575b8051825260208311156100e057601f1990920191602091820191016100c0565b505050905090810190601f16801561010c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561026a57fe5b6101396104ff565b005b341561027c57fe5b610139600160a060020a0360043516602435610677565b005b34156101ac57fe5b61014b600160a060020a0360043516610447565b60408051918252519081900360200190f35b604080518082019091526006815260d060020a6553747265656d02602082015281565b60015433600160a060020a039081169116146103025760006000fd5b600160a060020a03821660009081526002602052604081208054830190558054820190555b5050565b60005481565b600081565b61033e6107ac565b600061034933610447565b1161035057fe5b5060408051608081018252600160a060020a0333811680835285821660208085018281528587018881524260608801908152600086815260038086528a82208a518154908b16600160a060020a0319918216178255865160018084018054928e1692841692909217909155865160028085019190915586519385019390935589855260048952938d90208c518154908d169083161781559651938701805494909b1693169290921790985591519183019190915551940193909355845186815294519394909391927f4baaa557c21346b70bdc9482890b5d7e315f6a2123611e74004857ebecde068692918290030190a35b505050565b600160a060020a038116600090815260046020526040812060038101548291908290819015610480578260020154836003015442030293505b5050600160a060020a0384166000908152600360208190526040822090810154156104b5578060020154816003015442030291505b600160a060020a038616600090815260026020526040902054840182900394505b50505050919050565b604080518082019091526003815260e960020a6229aa2902602082015281565b600160a060020a033316600090815260036020819052604082209081015490919081908190151561052c57fe5b83600201548460030154420302925060009150600090506002600033600160a060020a0316600160a060020a03168152602001908152602001600020548311151561057957829150610598565b5050600160a060020a0333166000908152600260205260409020548082035b600160a060020a0333811660008181526002602081815260408084208054899003905560018a810180548816865282862080548b019055805488168652600484528286208054600160a060020a031990811682558184018054821690558187018890556003918201889055888852818652848820805482168155938401805490911690558286018790559190910194909455925491890154835190815290810187905280830186905291519316927f96c5271ec05cb2683bdc50cf109341f5a4e45b02907df1c23a8855bddbe030a19181900360600190a35b50505050565b600160a060020a0333166000908152600260205260409020548190108015906106a05750600081115b15156106a857fe5b600160a060020a03338116600081815260026020908152604080832080548790039055938616808352918490208054860190558351858152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a35b5050565b600160a060020a038116600090815260046020526040812060038101548291908290819015610480578260020154836003015442030293505b5050600160a060020a0384166000908152600360208190526040822090810154156104b5578060020154816003015442030291505b600160a060020a038616600090815260026020526040902054840182900394505b50505050919050565b604080516080810182526000808252602082018190529181018290526060810191909152905600a165627a7a72305820e4e8748f3249ff28d2864433dc74aade406d84c8b20660086ee15de4eb3297430029",
  "networks": {
    "1500075197859": {
      "events": {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_owner",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_spender",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        }
      },
      "links": {},
      "address": "0x76c03c6b2fdff9e8e844d11f0378a8643f81445d",
      "updated_at": 1500075248696
    },
    "1500076416500": {
      "events": {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_owner",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_spender",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        }
      },
      "links": {},
      "address": "0x7ccc84ae4e768c5236aea82c813e64b3959364dc",
      "updated_at": 1500076430467
    },
    "1500328320998": {
      "events": {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_owner",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_spender",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        "0x4baaa557c21346b70bdc9482890b5d7e315f6a2123611e74004857ebecde0686": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            }
          ],
          "name": "StreamOpened",
          "type": "event"
        },
        "0x96c5271ec05cb2683bdc50cf109341f5a4e45b02907df1c23a8855bddbe030a1": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_settledBalance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_outstandingBalance",
              "type": "uint256"
            }
          ],
          "name": "StreamClosed",
          "type": "event"
        }
      },
      "links": {},
      "address": "0x4fca1817c62482043aa5bb40f2a27c648189b0fc",
      "updated_at": 1500330211886
    },
    "1500330430153": {
      "events": {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_owner",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_spender",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        "0x4baaa557c21346b70bdc9482890b5d7e315f6a2123611e74004857ebecde0686": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            }
          ],
          "name": "StreamOpened",
          "type": "event"
        },
        "0x96c5271ec05cb2683bdc50cf109341f5a4e45b02907df1c23a8855bddbe030a1": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_settledBalance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_outstandingBalance",
              "type": "uint256"
            }
          ],
          "name": "StreamClosed",
          "type": "event"
        }
      },
      "links": {},
      "address": "0x08bf3bd538dbb8b0fcc1fc788bb514bade1848c6",
      "updated_at": 1500330441330
    },
    "1500332143283": {
      "events": {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_owner",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_spender",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        "0x4baaa557c21346b70bdc9482890b5d7e315f6a2123611e74004857ebecde0686": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            }
          ],
          "name": "StreamOpened",
          "type": "event"
        },
        "0x96c5271ec05cb2683bdc50cf109341f5a4e45b02907df1c23a8855bddbe030a1": {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_perSecond",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_settledBalance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "name": "_outstandingBalance",
              "type": "uint256"
            }
          ],
          "name": "StreamClosed",
          "type": "event"
        }
      },
      "links": {},
      "address": "0x4728135ad6078113537b473580b6d78448fe578d",
      "updated_at": 1500332157181
    }
  },
  "schema_version": "0.0.5",
  "updated_at": 1500332893462
}
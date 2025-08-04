require('dotenv').config()

const fs = require('fs')
const path = require('path')
const getWeb3 = require('../src/modules/web3')

const INSTANCE_REGISTRY_ABI = require('../abis/InstanceRegistry.abi.json')
const ERC20_ABI = require('../abis/ERC20.abi.json')

const CACHE_DIR = path.join(__dirname, '../cache')
const INSTANCE_CONFIG_PATH = path.join(CACHE_DIR, 'instances.json')

async function getInstances() {
  const web3 = getWeb3()
  const instanceRegistryContract = new web3.eth.Contract(INSTANCE_REGISTRY_ABI, process.env.INSTANCE_REGISTRY)

  console.log('Fetching instances from registry...')
  const allInstances = await instanceRegistryContract.methods.getAllInstances().call()

  const processedInstances = {
    etn: {
      instanceAddress: {},
      symbol: 'ETN',
      decimals: 18
    }
  }

  const cachedTokens = {}

  for (const instance of allInstances) {
    // ENABLED
    if (instance.instance.state === '1') {
      if (!instance.instance.isERC20) {
        const parsedValue = web3.utils.fromWei(instance.instance.denomination, 'ether')
        processedInstances.etn.instanceAddress[parsedValue] = instance.addr
      } else {
        if (!cachedTokens[instance.instance.token]) {
          const erc20Contract = new web3.eth.Contract(ERC20_ABI, instance.instance.token)
          const tokenSymbol = await erc20Contract.methods.symbol().call()
          const decimals = await erc20Contract.methods.decimals().call()

          cachedTokens[instance.instance.token] = tokenSymbol.toLowerCase()

          processedInstances[tokenSymbol.toLowerCase()] = {
            instanceAddress: {},
            tokenAddress: instance.instance.token,
            symbol: tokenSymbol,
            decimals: parseInt(decimals),
            gasLimit: '80000'
          }
        }

        const token = cachedTokens[instance.instance.token]
        const decimals = processedInstances[token].decimals
        const parsedValue = web3.utils
          .toBN(instance.instance.denomination)
          .div(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)))
          .toString()
        processedInstances[token].instanceAddress[parsedValue] = instance.addr
      }
    }
  }

  return processedInstances
}

async function main() {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true })
    }

    const instances = await getInstances()

    const configData = {}
    configData['netId' + process.env.NET_ID] = instances

    // Write to cache file
    fs.writeFileSync(INSTANCE_CONFIG_PATH, JSON.stringify(configData, null, 2))
    // Combine each key of instances with each key of the instanceAddress value of each instance
    const availableInstances = []
    for (const tokenKey of Object.keys(instances)) {
      const instance = instances[tokenKey]
      if (instance.instanceAddress) {
        for (const denomKey of Object.keys(instance.instanceAddress)) {
          availableInstances.push(`${tokenKey}_${denomKey}`)
        }
      }
    }
    console.log('Available instances:', availableInstances)
    
    process.exit(0)
  } catch (error) {
    console.error('Failed to fetch instances:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { getInstances } 
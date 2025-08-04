require('dotenv').config()

const { jobType } = require('./constants')
const tornConfig = require('torn-token')
const fs = require('fs')
const path = require('path')

const INSTANCE_CONFIG_PATH = path.join(__dirname, '../cache/instances.json')

// Try to load instances from cache file, fallback to default if not available
function loadInstancesFromCache() {
  try {
    console.log('Loading instances from cache file:', INSTANCE_CONFIG_PATH)
    if (fs.existsSync(INSTANCE_CONFIG_PATH)) {
      const cachedData = fs.readFileSync(INSTANCE_CONFIG_PATH, 'utf8')
      return JSON.parse(cachedData)
    }
  } catch (error) {
    console.warn('Failed to load cached instances:', error.message)
  }
  
  // Fallback to default instances
  return {
    netId52014: {
      etn: {
        instanceAddress: {},
        symbol: 'ETN',
        decimals: 18
      }
    },
    netId5201420: {
      etn: {
        instanceAddress: {},
        symbol: 'ETN',
        decimals: 18
      }
    }
  }
}

const config = {
  netId: Number(process.env.NET_ID) || 1,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL,
  wsRpcUrl: process.env.WS_RPC_URL,
  oracleRpcUrl: process.env.ORACLE_RPC_URL || 'https://mainnet.infura.io/',
  offchainOracleAddress: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb',
  aggregatorAddress: process.env.AGGREGATOR,
  minerMerkleTreeHeight: 20,
  privateKey: process.env.PRIVATE_KEY,
  torn: tornConfig,
  port: process.env.APP_PORT || 8000,
  tornadoServiceFee: Number(process.env.REGULAR_TORNADO_WITHDRAW_FEE),
  miningServiceFee: Number(process.env.MINING_SERVICE_FEE),
  rewardAccount: process.env.REWARD_ACCOUNT,
  governanceAddress: process.env.GOVERNANCE,
  proxyRouter: process.env.PROXY_ROUTER,
  gasLimits: {
    [jobType.TORNADO_WITHDRAW]: 390000,
    WITHDRAW_WITH_EXTRA: 700000,
    [jobType.MINING_REWARD]: 455000,
    [jobType.MINING_WITHDRAW]: 400000,
  },
  minimumBalance: '100000000000000000',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE),
  instances: loadInstancesFromCache()
}

module.exports = config
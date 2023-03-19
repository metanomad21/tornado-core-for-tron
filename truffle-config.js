require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const utils = require('web3-utils')

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://kovan.infura.io/v3/97c8bf358b9942a9853fab1ba93dc5b3',
        ),
      network_id: 42,
      gas: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true,
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://goerli.infura.io/v3/d34c08f2cb7c4111b645d06ac7e35ba8',
        ),
      network_id: 5,
      gas: 6000000,
      gasPrice: utils.toWei('50', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true,
    },
    testchain: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://rpc.9purple.co',
        ),
      network_id: "*",
      gas: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 10000
    },
    opgoerli: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://optimism-goerli.blastapi.io/58212e43-01d6-4a8b-a9ca-7620cefd5974',
        ),
      network_id: 420, // or 0x1a4 for hexadecimal format
      chainId: 420, // or 0x1a4 for hexadecimal format20",
      gas: 6000000,
      gasPrice: 0,
      confirmations: 1,
      timeoutBlocks: 100,
      skipDryRun: true,
      replayProtection: true
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'https://rinkeby.infura.io/v3/97c8bf358b9942a9853fab1ba93dc5b3',
        ),
      network_id: 4,
      gas: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, 'http://ethereum-rpc.trustwalletapp.com'),
      network_id: 1,
      gas: 6000000,
      gasPrice: utils.toWei('2', 'gwei'),
      // confirmations: 0,
      // timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    external: {
      command: 'node ./scripts/compileHasher.js',
      targets: [
        {
          path: './build/Hasher.json',
        },
      ],
    },
  },

  plugins: ['solidity-coverage'],
}

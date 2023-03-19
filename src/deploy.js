require('dotenv').config();
const fs = require("fs");
const { promisify } = require("util");

const TronWeb = require("tronweb");
const ERC20Mock = require("../build/contracts/ERC20Mock.json");
const Hasher = require("../build/contracts/Hasher.json");
const Verifier = require("../build/contracts/Verifier.json");
const ETHTornado = require("../build/contracts/ETHTornado.json");
const ERC20Tornado = require("../build/contracts/ERC20Tornado.json");

const isReset = process.argv.includes("--reset");
let allAddresses = require("../addresses.json");
allAddresses.mainnet = allAddresses.mainnet || { exchanges: {} };
allAddresses.shasta = allAddresses.shasta || { exchanges: {} };

const network = process.env.TRON_NETWORK || "mainnet";

const addresses = allAddresses[network];

if (isReset) {
  addresses = {};
}

if (!isReset) {
  console.log(
    "Info: use --reset or remove items from addresses.json to force new deploy \n"
  );
}

const createTronWeb = () => {
  const HttpProvider = TronWeb.providers.HttpProvider;
  const subdomain = network === "mainnet" ? "" : `${network}.`;
  console.log("Create TronWeb:", `https://api.${subdomain}trongrid.io`);
  const fullNode = new HttpProvider(`https://api.${subdomain}trongrid.io`);
  const solidityNode = new HttpProvider(`https://api.${subdomain}trongrid.io`);
  const eventServer = `https://api.${subdomain}trongrid.io`;
  const privateKey =
    network === "mainnet"
      ? process.env.DEPLOY_PRIVATE_KEY_MAINNET
      : process.env.PRIVATE_KEY;
  console.log("PK:", privateKey);
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
  return tronWeb;
};

const tronWeb = createTronWeb();

const deployMockERC20 = async () => {
  let abi = ERC20Mock.abi;
  let bytecode = ERC20Mock.bytecode;

  if (!isReset && addresses.usdt) {
    console.log(`usdt already deployed, skipping. Use --reset to override.`);
    return new TronWeb.Contract(tronWeb, abi, addresses.usdt);
  }

  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    callValue: 0,
    parameters: ["Tether USD", "USDT", "6"]
  });

  const base58Address = TronWeb.address.fromHex(contract.address);
  console.log(`Deployed usdt`, contract.address, base58Address);

  let toAddr = "TDKd1uDEMhoybs95tp8R9uMLoMzD83r1jA";
  let mintRes = await contract.mint(toAddr, TronWeb.toSun('1')).send({ shouldPollResponse: true });
  console.log("Mint usdt to:", toAddr, mintRes);

  addresses.usdt = base58Address;
  return contract;
};

const deployHasher = async () => {
  let abi = Hasher.abi;
  let bytecode = Hasher.bytecode;

  if (!isReset && addresses.hasher) {
    console.log(`Hasher already deployed, skipping. Use --reset to override.`);
    return new TronWeb.Contract(tronWeb, abi, addresses.hasher);
  }

  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    callValue: 0,
  });
  const base58Address = TronWeb.address.fromHex(contract.address);
  console.log(`Deployed hasher`, contract.address, base58Address);

  addresses.hasher = base58Address;
  return contract;
};

const deployVerifier = async () => {
  let abi = Verifier.abi;
  let bytecode = Verifier.bytecode;

  if (!isReset && addresses.verifier) {
    console.log(`Verifier already deployed, skipping. Use --reset to override.`);
    return new TronWeb.Contract(tronWeb, abi, addresses.verifier);
  }

  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    callValue: 0,
  });
  const base58Address = TronWeb.address.fromHex(contract.address);
  console.log(`Deployed verifier`, contract.address, base58Address);

  addresses.verifier = base58Address;
  return contract;
};

const deployETHTornado = async (hasherObj, verifierObj) => {
  let abi = ETHTornado.abi;
  let bytecode = ETHTornado.bytecode;

  if (!isReset && addresses.ethTornado) {
    console.log(`ETHTornado already deployed, skipping. Use --reset to override.`);
    return new TronWeb.Contract(tronWeb, abi, addresses.ethTornado);
  }

  const { MERKLE_TREE_HEIGHT, ETH_AMOUNT } = process.env
  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters:[verifierObj.address, hasherObj.address, ETH_AMOUNT, MERKLE_TREE_HEIGHT]
  });

  const base58Address = TronWeb.address.fromHex(contract.address);
  console.log(`Deployed ethTornado`, contract.address, base58Address);

  addresses.ethTornado = base58Address;
  return contract;
};

const deployERC20Tornado = async (hasherObj, verifierObj) => {
  let abi = ERC20Tornado.abi;
  let bytecode = ERC20Tornado.bytecode;

  if (!isReset && addresses.erc20Tornado) {
    console.log(`ERC20Tornado already deployed, skipping. Use --reset to override.`);
    return new TronWeb.Contract(tronWeb, abi, addresses.erc20Tornado);
  }

  const { MERKLE_TREE_HEIGHT, TOKEN_AMOUNT, ERC20_TOKEN} = process.env
  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters:[verifierObj.address, hasherObj.address, TOKEN_AMOUNT, MERKLE_TREE_HEIGHT, ERC20_TOKEN]
  });

  const base58Address = TronWeb.address.fromHex(contract.address);
  console.log(`Deployed erc20Tornado`, contract.address, base58Address);

  addresses.erc20Tornado = base58Address;
  return contract;
};


const writeAddresses = async (obj) => {
  await promisify(fs.writeFile)(
    "./addresses.json",
    JSON.stringify(obj, null, 2)
  );
};

const run = async () => {
  await deployMockERC20();
  const hasherObj = await deployHasher();
  await writeAddresses(allAddresses);

  const verifierObj = await deployVerifier();
  await writeAddresses(allAddresses);

  const ethTornadoObj = await deployETHTornado(hasherObj, verifierObj);
  await writeAddresses(allAddresses);

  const erc20TornadoObj = await deployERC20Tornado(hasherObj, verifierObj);
  await writeAddresses(allAddresses);


};

run().catch((err) => {
  console.error(err);
});

const Migrations = artifacts.require("Migrations");
const CommonProxy = artifacts.require("CommonProxy");
const RecordDelegate = artifacts.require("RecordDelegate");

module.exports = async function (deployer, network, accounts) {

  deployer.deploy(Migrations);

  await deployer.deploy(RecordDelegate);
  const record = await RecordDelegate.deployed();

  const ownerAdmin = accounts[0];
  const ownerDelegate = accounts[1];
  const operatorDelegate = accounts[2]

  await deployer.deploy(CommonProxy, record.address, ownerAdmin, '0x');

  const proxy = await RecordDelegate.at((await CommonProxy.deployed()).address);

  await proxy.initialize(ownerDelegate, operatorDelegate, {from: operatorDelegate});
};

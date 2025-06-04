// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition


const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CreatorFactoryModule", (m) => {
  const backendSigner = "0xe91429169542837A43C70CacFAFBAA5D7e8e63C7";
  const factory = m.contract("CreatorFactory", [backendSigner]);

  return { factory };
});
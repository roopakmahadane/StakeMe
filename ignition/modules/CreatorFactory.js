const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CreatorFactory", (m) => {
  const creatorFactory = m.contract("CreatorFactory", ["0xe91429169542837A43C70CacFAFBAA5D7e8e63C7"]);


  return { creatorFactory };
});
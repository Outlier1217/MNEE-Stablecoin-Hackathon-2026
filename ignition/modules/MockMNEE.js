const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MockMNEEModule", (m) => {
  const INITIAL_SUPPLY = m.getParameter(
    "supply",
    BigInt(1_000_000) * BigInt(10 ** 18)
  );

  const token = m.contract("MockMNEE", [INITIAL_SUPPLY]);

  return { token };
});

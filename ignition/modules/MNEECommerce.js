const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MNEEFullModule", (m) => {
  const supply = BigInt(1_000_000) * BigInt(10 ** 18);

  const mockMnee = m.contract("MockMNEE", [supply]);
  const commerce = m.contract("MNEECommerce", [mockMnee]);

  return { mockMnee, commerce };
});

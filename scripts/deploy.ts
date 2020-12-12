import { run, ethers } from "hardhat";

import { WeiPerEther } from "ethers/constants";

async function main() {
  await run("compile");

  const ERC20PermitAdapter = await ethers.getContractFactory(
    "ERC20PermitAdapter"
  );
  const adapter = await ERC20PermitAdapter.deploy();

  await adapter.deployed();

  console.log("Adapter deployed to:", adapter.address);

  const TestERC20 = await ethers.getContractFactory("TestERC20");
  const testErc20 = await TestERC20.deploy(
    "TestDai",
    "TDAI",
    WeiPerEther.mul(100000).toHexString()
  );

  await testErc20.deployed();

  console.log("Test token deployed to:", testErc20.address);

  const TestIntegration = await ethers.getContractFactory("TestIntegration");
  const testIntegration = await TestIntegration.deploy(
    testErc20.address,
    adapter.address
  );

  console.log(
    "Test integration contract deployed to:",
    testIntegration.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { ethers } from "hardhat";
import { Signer, constants } from "ethers";

import { assert } from "chai";
import { step } from "mocha-steps";

import {
  ERC20PermitAdapter__factory,
  TestERC20__factory,
  TestIntegration__factory,
  ERC20PermitAdapter,
  TestERC20,
  TestIntegration,
} from "../typechain";

describe("ERC20PermitAdapter", function () {
  let accounts: Signer[];

  // Contract instances

  let adapter: ERC20PermitAdapter;
  let testErc20: TestERC20;
  let testIntegration: TestIntegration;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
  });

  step("Should deploy contracts", async function () {
    // Contract factories

    const ERC20PermitAdapter = (await ethers.getContractFactory(
      "ERC20PermitAdapter"
    )) as ERC20PermitAdapter__factory;
    const TestERC20 = (await ethers.getContractFactory(
      "TestERC20"
    )) as TestERC20__factory;
    const TestIntegration = (await ethers.getContractFactory(
      "TestIntegration"
    )) as TestIntegration__factory;

    // Deploy contracts

    adapter = (await ERC20PermitAdapter.deploy()) as ERC20PermitAdapter;

    testErc20 = (await TestERC20.deploy(
      "Test Token",
      "TST",
      constants.MaxUint256
    )) as TestERC20;

    testIntegration = (await TestIntegration.deploy(
      testErc20.address,
      adapter.address
    )) as TestIntegration;

    adapter.connect(accounts[0]);
    testErc20.connect(accounts[0]);
    testIntegration.connect(accounts[0]);
  });

  step(`Should give infinite erc20 allowance to adapter`, async function () {
    const allowanceIncreaseTx = await testErc20.increaseAllowance(
      adapter.address,
      constants.MaxUint256
    );

    const allowance = await testErc20.allowance(
      await accounts[0].getAddress(),
      adapter.address
    );

    assert.isTrue(allowance.eq(constants.MaxUint256));
  });
});

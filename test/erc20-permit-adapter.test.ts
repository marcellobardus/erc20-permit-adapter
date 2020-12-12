import { ethers } from "hardhat";

import { Signer, constants, utils, providers, BigNumberish } from "ethers";

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
import { WeiPerEther } from "ethers/constants";

describe("ERC20PermitAdapter", function () {
  let accounts: Signer[];

  // Contract instances

  let adapter: ERC20PermitAdapter;
  let testErc20: TestERC20;
  let testIntegration: TestIntegration;

  // Test assumptions

  let permitData: {
    asset: string;
    spender: string;
    tokenAmount: BigNumberish;
    deadline: number;
    getNonce: (adapter: ERC20PermitAdapter, account: string) => Promise<number>;
    abiTypes: string[];
  };

  let tokensOwner: string;
  let tokensRecipient: string;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    tokensOwner = await accounts[0].getAddress();
    tokensRecipient = await accounts[1].getAddress();
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
      constants.WeiPerEther.mul(100000).toHexString()
    )) as TestERC20;

    testIntegration = (await TestIntegration.deploy(
      testErc20.address,
      adapter.address
    )) as TestIntegration;

    adapter.connect(accounts[0]);
    testErc20.connect(accounts[0]);
    testIntegration.connect(accounts[0]);

    permitData = {
      asset: testErc20.address,
      spender: testIntegration.address,
      tokenAmount: constants.WeiPerEther.mul(100).toHexString(),
      deadline: Math.round(Date.now() / 1000) + 3600,
      getNonce: async (adapter: ERC20PermitAdapter, account: string) =>
        await (await adapter.nonceOf(account)).toNumber(),
      abiTypes: ["address", "address", "uint256", "uint256", "uint256"],
    };
  });

  step("Should give infinite erc20 allowance to adapter", async function () {
    const tx = await testErc20.increaseAllowance(
      adapter.address,
      constants.MaxUint256
    );

    await tx.wait();

    const allowance = await testErc20.allowance(tokensOwner, adapter.address);

    assert.isTrue(allowance.eq(constants.MaxUint256));
  });

  step(
    "Should give infinite erc20 allowance to test and transfer tokens",
    async function () {
      const allowanceTx = await testErc20.increaseAllowance(
        testIntegration.address,
        constants.MaxUint256
      );
      await allowanceTx.wait();

      const transferTx = await testIntegration.testLegacyTransfer(
        tokensRecipient,
        permitData.tokenAmount
      );
      await transferTx.wait();
    }
  );

  let signature: string;

  step("Should successfully sign a message", async function () {
    const abiEncoded = new utils.AbiCoder().encode(permitData.abiTypes, [
      permitData.asset,
      permitData.spender,
      permitData.tokenAmount,
      permitData.deadline,
      await permitData.getNonce(adapter, tokensOwner),
    ]);

    const hash = utils.solidityKeccak256(["bytes"], [abiEncoded]);
    const hashArrayified = utils.arrayify(hash);

    signature = await accounts[0].signMessage(hashArrayified);

    const signer = utils.verifyMessage(hashArrayified, signature);

    assert.equal(signer, tokensOwner);
  });

  step("Should submit the signature and transfer tokens", async function () {
    const balancesBeforeTest = {
      owner: (await testErc20.balanceOf(tokensOwner))
        .div(WeiPerEther.toHexString())
        .toNumber(),
      recipient: (await testErc20.balanceOf(tokensRecipient))
        .div(WeiPerEther.toHexString())
        .toNumber(),
    };

    const tx = await testIntegration.testAdapterTransfer(
      tokensRecipient,
      permitData.tokenAmount,
      permitData.deadline,
      signature
    );

    await tx.wait();

    const balancesAfterTest = {
      owner: (await testErc20.balanceOf(tokensOwner))
        .div(WeiPerEther.toHexString())
        .toNumber(),
      recipient: (await testErc20.balanceOf(tokensRecipient))
        .div(WeiPerEther.toHexString())
        .toNumber(),
    };

    assert.isBelow(balancesAfterTest.owner, balancesBeforeTest.owner);
    assert.isAbove(balancesAfterTest.recipient, balancesBeforeTest.recipient);
  });
});

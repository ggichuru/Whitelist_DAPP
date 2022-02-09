/* eslint-disable no-process-exit */
import { ethers } from "hardhat";

const deploy = async () => {
  const WhitelistConrtact = await ethers.getContractFactory("Whitelist");
  const whitelistContract = await WhitelistConrtact.deploy(10);

  await whitelistContract.deployed();

  console.log("Whitelist contract deployed to: ", whitelistContract.address);
};

deploy()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

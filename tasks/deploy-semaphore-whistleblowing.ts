import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:semaphore-whistleblowing", "Deploy a SemaphoreWhistleblowing contract")
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
    const poseidonABI = poseidonContract.generateABI(2)
    const poseidonBytecode = poseidonContract.createCode(2)

    const [signer] = await ethers.getSigners()

    const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
    const poseidonLib = await PoseidonLibFactory.deploy()

    await poseidonLib.deployed()

    logs && console.log(`Poseidon library has been deployed to: ${poseidonLib.address}`)

    const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
      libraries: {
        PoseidonT3: poseidonLib.address
      }
    })
    const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()

    await incrementalBinaryTreeLib.deployed()

    logs && console.log(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`)

    const ContractFactory = await ethers.getContractFactory("SemaphoreWhistleblowing", {
      libraries: {
        IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    })

    const contract = await ContractFactory.deploy()

    await contract.deployed()

    logs && console.log(`SemaphoreWhistleblowing contract has been deployed to: ${contract.address}`)

    return contract
  })

import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { task, types } from "hardhat/config"

task("deploy:daochat-voting", "Deploy a DaochatVoting contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs }, { ethers }): Promise<any> => {
        const PairingFactory = await ethers.getContractFactory("Pairing")
        const pairing = await PairingFactory.deploy()

        await pairing.deployed()

        if (logs) {
            console.info(`Pairing library has been deployed to: ${pairing.address}`)
        }

        const DaochatVerifierFactory = await ethers.getContractFactory("DaochatVerifier", {
            libraries: {
                Pairing: pairing.address
            }
        })

        const daochatVerifier = await DaochatVerifierFactory.deploy()

        await daochatVerifier.deployed()

        if (logs) {
            console.info(`DaochatVerifier contract has been deployed to: ${daochatVerifier.address}`)
        }

        const poseidonABI = poseidonContract.generateABI(2)
        const poseidonBytecode = poseidonContract.createCode(2)

        const [signer] = await ethers.getSigners()

        const PoseidonFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
        const poseidon = await PoseidonFactory.deploy()

        await poseidon.deployed()

        if (logs) {
            console.info(`Poseidon library has been deployed to: ${poseidon.address}`)
        }

        const IncrementalBinaryTreeFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
            libraries: {
                PoseidonT3: poseidon.address
            }
        })
        const incrementalBinaryTree = await IncrementalBinaryTreeFactory.deploy()

        await incrementalBinaryTree.deployed()

        if (logs) {
            console.info(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTree.address}`)
        }

        const DaochatVotingFactory = await ethers.getContractFactory("DaochatVoting", {
            libraries: {
                IncrementalBinaryTree: incrementalBinaryTree.address
            }
        })

        const daochatVoting = await DaochatVotingFactory.deploy(daochatVerifier.address)

        await daochatVoting.deployed()

        if (logs) {
            console.info(`DaochatVoting contract has been deployed to: ${daochatVoting.address}`)
        }

        return {
            daochatVoting,
            pairingAddress: pairing.address,
            daochatVerifierAddress: daochatVerifier.address,
            poseidonAddress: poseidon.address,
            incrementalBinaryTreeAddress: incrementalBinaryTree.address
        }
    })

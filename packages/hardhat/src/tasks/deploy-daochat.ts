import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { task, types } from "hardhat/config"

task("deploy:daochat", "Deploy a Daochat contract")
    .addOptionalParam<boolean>("pairing", "Pairing library address", undefined, types.string)
    .addOptionalParam<boolean>("daochatVerifier", "DaochatVerifier contract address", undefined, types.string)
    .addOptionalParam<boolean>("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam<boolean>(
        "incrementalBinaryTree",
        "IncrementalBinaryTree library address",
        undefined,
        types.string
    )
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(
        async (
            {
                logs,
                pairing: pairingAddress,
                daochatVerifier: daochatVerifierAddress,
                poseidon: poseidonAddress,
                incrementalBinaryTree: incrementalBinaryTreeAddress
            },
            { ethers }
        ): Promise<any> => {
            if (!daochatVerifierAddress) {
                if (!pairingAddress) {
                    const PairingFactory = await ethers.getContractFactory("Pairing")
                    const pairing = await PairingFactory.deploy()

                    await pairing.deployed()

                    if (logs) {
                        console.info(`Pairing library has been deployed to: ${pairing.address}`)
                    }

                    pairingAddress = pairing.address
                }

                const DaochatVerifierFactory = await ethers.getContractFactory("DaochatVerifier", {
                    libraries: {
                        Pairing: pairingAddress
                    }
                })

                const daochatVerifier = await DaochatVerifierFactory.deploy()

                await daochatVerifier.deployed()

                if (logs) {
                    console.info(`DaochatVerifier contract has been deployed to: ${daochatVerifier.address}`)
                }

                daochatVerifierAddress = daochatVerifier.address
            }

            if (!incrementalBinaryTreeAddress) {
                if (!poseidonAddress) {
                    const poseidonABI = poseidonContract.generateABI(2)
                    const poseidonBytecode = poseidonContract.createCode(2)

                    const [signer] = await ethers.getSigners()

                    const PoseidonFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
                    const poseidon = await PoseidonFactory.deploy()

                    await poseidon.deployed()

                    if (logs) {
                        console.info(`Poseidon library has been deployed to: ${poseidon.address}`)
                    }

                    poseidonAddress = poseidon.address
                }

                const IncrementalBinaryTreeFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
                    libraries: {
                        PoseidonT3: poseidonAddress
                    }
                })
                const incrementalBinaryTree = await IncrementalBinaryTreeFactory.deploy()

                await incrementalBinaryTree.deployed()

                if (logs) {
                    console.info(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTree.address}`)
                }

                incrementalBinaryTreeAddress = incrementalBinaryTree.address
            }

            const DaochatFactory = await ethers.getContractFactory("Daochat", {
                libraries: {
                    IncrementalBinaryTree: incrementalBinaryTreeAddress
                }
            })

            const daochat = await DaochatFactory.deploy(daochatVerifierAddress)

            await daochat.deployed()

            if (logs) {
                console.info(`Daochat contract has been deployed to: ${daochat.address}`)
            }

            return {
                daochat,
                pairingAddress,
                daochatVerifierAddress,
                poseidonAddress,
                incrementalBinaryTreeAddress
            }
        }
    )

import { task, types } from "hardhat/config"

task("deploy:daochat-verifier", "Deploy a DaochatVerifier contract")
    .addOptionalParam<boolean>("pairing", "Pairing library address", undefined, types.string)
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, pairing: pairingAddress }, { ethers }): Promise<any> => {
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

        return {
            daochatVerifier,
            pairingAddress
        }
    })

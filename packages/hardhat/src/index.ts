import { extendConfig } from "hardhat/config"
import { HardhatConfig, HardhatUserConfig } from "hardhat/types"

import "hardhat-dependency-compiler"
import "@nomiclabs/hardhat-ethers"
import "./tasks/deploy-daochat"
import "./tasks/deploy-daochat-verifier"

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.dependencyCompiler.paths = [
        "@daochat-protocol/contracts/base/Pairing.sol",
        "@daochat-protocol/contracts/base/DaochatVerifier.sol",
        "@daochat-protocol/contracts/Daochat.sol"
    ]

    if (userConfig.dependencyCompiler?.paths) {
        config.dependencyCompiler.paths = [...config.dependencyCompiler.paths, ...userConfig.dependencyCompiler.paths]
    }
})

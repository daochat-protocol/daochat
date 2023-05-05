import { SupportedNetwork } from "./types"

/**
 * Returns the subgraph URL related to the network passed as a parameter.
 * @param supportedNetwork Daochat supported network.
 * @returns Subgraph URL.
 */
export default function getURL(supportedNetwork: SupportedNetwork | string): string {
    switch (supportedNetwork) {
        case "sepolia":
        case "goerli":
        case "mumbai":
        case "optimism-goerli":
        case "arbitrum-goerli":
        case "arbitrum":
            return `https://api.studio.thegraph.com/query/14377/daochat-${supportedNetwork}/v3.6.1`
        default:
            throw new TypeError(`Network '${supportedNetwork}' is not supported`)
    }
}

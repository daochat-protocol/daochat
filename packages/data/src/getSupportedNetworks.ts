import { SupportedNetwork } from "./types"

/**
 * Returns the list of Daochat supported networks.
 * @returns Daochat supported networks.
 */
export default function getSupportedNetworks(): string[] {
    return Object.values(SupportedNetwork)
}

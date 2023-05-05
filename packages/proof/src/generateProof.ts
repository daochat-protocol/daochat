import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@daochat-protocol/group"
import type { Identity } from "@daochat-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { groth16 } from "snarkjs"
import hash from "./hash"
import packProof from "./packProof"
import { FullProof, SnarkArtifacts } from "./types"

/**
 * Generates a Daochat proof.
 * @param identity The Daochat identity.
 * @param groupOrMerkleProof The Daochat group or its Merkle proof.
 * @param externalNullifier The external nullifier.
 * @param signal The Daochat signal.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Daochat proof ready to be verified.
 */
export default async function generateProof(
    { trapdoor, nullifier, commitment }: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    externalNullifier: BytesLike | Hexable | number | bigint,
    signal: BytesLike | Hexable | number | bigint,
    snarkArtifacts?: SnarkArtifacts
): Promise<FullProof> {
    let merkleProof: MerkleProof

    if ("depth" in groupOrMerkleProof) {
        const index = groupOrMerkleProof.indexOf(commitment)

        if (index === -1) {
            throw new Error("The identity is not part of the group")
        }

        merkleProof = groupOrMerkleProof.generateMerkleProof(index)
    } else {
        merkleProof = groupOrMerkleProof
    }

    if (!snarkArtifacts) {
        snarkArtifacts = {
            wasmFilePath: `https://daochat.me/smpc/${merkleProof.siblings.length}/daochat.wasm`,
            zkeyFilePath: `https://daochat.me/smpc/${merkleProof.siblings.length}/daochat.zkey`
        }
    }

    const { proof, publicSignals } = await groth16.fullProve(
        {
            identityTrapdoor: trapdoor,
            identityNullifier: nullifier,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            externalNullifier: hash(externalNullifier),
            signalHash: hash(signal)
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        merkleTreeRoot: publicSignals[0],
        nullifierHash: publicSignals[1],
        signal: BigNumber.from(signal).toString(),
        externalNullifier: BigNumber.from(externalNullifier).toString(),
        proof: packProof(proof)
    }
}

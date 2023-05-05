import dotenv from "dotenv"
import download from "download"

dotenv.config()

async function main() {
    const snarkArtifactsPath = "./snark-artifacts"

    if (process.env.ALL_SNARK_ARTIFACTS === "true") {
        const url = `https://daochat.me/smpc/daochat.zip`

        await download(url, snarkArtifactsPath, {
            extract: true
        })
    } else {
        const treeDepth = process.env.TREE_DEPTH || 20
        const url = `https://daochat.me/smpc/${treeDepth}`

        await download(`${url}/daochat.wasm`, `${snarkArtifactsPath}/${treeDepth}`)
        await download(`${url}/daochat.zkey`, `${snarkArtifactsPath}/${treeDepth}`)
        await download(`${url}/daochat.json`, `${snarkArtifactsPath}/${treeDepth}`)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

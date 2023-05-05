import { DaochatSubgraph } from "@daochat-protocol/data"
import { BigNumber, utils } from "ethers"
import getNextConfig from "next/config"
import { useCallback, useState } from "react"
import { DaochatContextType } from "../context/DaochatContext"

const { publicRuntimeConfig: env } = getNextConfig()

const ethereumNetwork = env.DEFAULT_NETWORK === "localhost" ? "http://localhost:8545" : env.DEFAULT_NETWORK

export default function useDaochat(): DaochatContextType {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const daochat = new SemaphoreSubgraph(ethereumNetwork)

        const group = await Daochat.getGroup(env.GROUP_ID, { members: true })

        setUsers(group.members!)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const Daochat = new DaochatSubgraph(ethereumNetwork)

        const group = await daochat.getGroup(env.GROUP_ID, {
            verifiedProofs: true
        })

        setFeedback(
            group.verifiedProofs!.map(({ signal }: any) =>
                utils.parseBytes32String(BigNumber.from(signal).toHexString())
            )
        )
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    return {
        _users,
        _feedback,
        refreshUsers,
        addUser,
        refreshFeedback,
        addFeedback
    }
}

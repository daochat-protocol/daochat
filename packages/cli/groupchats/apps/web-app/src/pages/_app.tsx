import "../styles/globals.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import DaochatContext from "../context/DaochatContext"
import useDaochat from "../hooks/useDaochat"
import { Inter } from "@next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const Daochat = useDaochat()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        daochat.refreshUsers()
        daochat.refreshFeedback()
    }, [])

    return (
        <div className={inter.className}>
            <Head>
                <title>Daochat template</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>

            <div>
                <div className="container">
                    <div id="body">
                        <DaochatContext.Provider value={Daochat}>
                            <LogsContext.Provider
                                value={{
                                    _logs,
                                    setLogs
                                }}
                            >
                                <Component {...pageProps} />
                            </LogsContext.Provider>
                        </DaochatContext.Provider>
                    </div>
                </div>

                <div className="footer">
                    {_logs.endsWith("...")}
                    <p>{_logs || `Current step: ${router.route}`}</p>
                </div>
            </div>
        </div>
    )
}

import { useContext, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { getSession } from 'next-auth/react'

import VideoPlayer from "@/components/MessageContainer/VideoPlayer/VideoPlayer"
import Chat from "@/components/Chat/Chat"
import AppContext from '@/components/AppContext.js'
import Message from '@/components/MessageContainer/Message/Message'

let socket;

function party(props) {

    const [seekLock, setseekLock] = useState(false)
    const [messages, setmessages] = useState([])
    const [username, setusername] = useState("Anonymous")
    const [chatOpen, setchatOpen] = useState(0)
    const [users, setusers] = useState([])

    const context = useContext(AppContext)
    const videoRef = useRef()

    useEffect(() => {
        (async () => {
            await fetch(`/api/party`)
            socket = io()

            socket.on("pause", () => {
                videoRef.current.pauseVideo()
            })
            socket.on("play", () => {
                videoRef.current.playVideo()
            })
            socket.on("seek", time => {
                if (!seekLock) {
                    videoRef.current.seekVideo(time)
                    setseekLock(true)
                    setTimeout(() => setseekLock(false), 2000)
                }
            })
            socket.on("message", (username, message) => {
                setmessages(messages => [{username, message, type: "user"}, ...messages])
            })
            socket.on("sysmessage", (message) => {
                setmessages(messages => [{username: username, message, type: "system"}, ...messages])
            })
            socket.on("setUsers", (users) => {
                setusers(users)
            })

            const URLtoReplace = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${props.room}`   
            window.history.pushState({ path: URLtoReplace }, '', URLtoReplace);

            context.globalFunctions.createMessage(
                <Message>
                    <h1>Enter a username</h1>
                    <input id="usernameBox" className="usernameBox" type="text" />
                    <button onClick={async () => {
                        if (document.querySelector("#usernameBox").value) { 
                            const newUsername = document.querySelector("#usernameBox").value
                            setusername(newUsername)
                            await socket.emit("join", newUsername, props.room.toString())
                            context.globalFunctions.closeMessage()
                        }}}>OK
                    </button>
                    <style jsx>{`
                        .usernameBox {
                            border: none;
                            width: 80%;
                        }
                        button {
                            width: 20%;
                            margin-right: 0;
                            margin-top: 0;
                        }
                    `}</style>
                </Message>
            )
        })()
    }, [])

    const play = async () => {
        socket.emit("play", props.room.toString())
    }

    const pause = async () => {
        socket.emit("pause", props.room.toString())
    }

    const seek = async (time) => {
        if (!seekLock) {
            socket.emit("seek", time, props.room.toString())
            setseekLock(true)
            if (!videoRef.current.player.seeking()) {
                setTimeout(() => setseekLock(false), 1000)
            }
        }
    }

    const sendMessage = async (message, type="user") => {
        if (type == "system") {
            socket.emit("sysmessage", message, props.room.toString())
        } else {
            socket.emit("message", username, message, props.room.toString())
        }
    }

    const getPathFromRoomId = () => {
        return Buffer.from(props.room, 'base64').toString().slice(0, -4)
    }

    return (
        <>
            <VideoPlayer 
                ref={videoRef}
                path={props.path ? props.path : getPathFromRoomId()}
                partyMode={props.partyMode + chatOpen}
                partyListeners={{
                    play: play,
                    pause: pause,
                    seek: seek,
                }}
            />
            <Chat 
                messageFunction={sendMessage} 
                messages={messages}
                users={users}
                URL={props.URL}
                room={props.room}
                username={username}
                onChatOpen={(chatState) => chatState ? setchatOpen(2) : setchatOpen(0)}
            />
        </>
    )
}

export async function getServerSideProps(context) {
    let room = null
    let path = context.query.path ? context.query.path : null
    const session = await getSession(context)

    // A word on "partyMode": this gets passed to the Video Player component. 0 = no party mode, 1 = non-logged-in party mode, 2 = logged-in party mode
    // When party mode is on, all video options except for the play button is hidden. If logged in, the sidebar will be on the left, so padding
    // is added to the player to account for this. The player page also maintains a "chat open" state affected by the chat component;
    // this gets added on to the partyMode variable allowing the partyMode to also be 3 (not logged in, chat open) or 4 (logged in, chat open).
    // This is so we can adjust the size of the video on the page, and again: the values differ for logged-in and non-logged-in users.
    let partyMode = session ? 2 : 1

    // If they're not logged in, they MUST pass a room parameter, and MUST NOT pass a path param
    if (!session && (!context.query.room || context.query.path)) {
        context.res.writeHead(302, { Location: "/api/auth/signin" });
        context.res.end();
        return {props: {}}
    }

    if (!context.query.room) {
        // If they are logged in without a room param, though, generate a room ID in order to create the room
        room = Math.floor(1000 + Math.random() * 9000);
        room = path + room
        room = Buffer.from(room).toString('base64')
    } else {
        // If a room ID is passed, check it actually exists and redirect to login if not
        room = context.query.room
        const roomCheckResp = await fetch(`${process.env.NEXTAUTH_URL}/api/party?room=${context.query.room}`)
        if (roomCheckResp.status == 401) {
            context.res.writeHead(302, { Location: "/api/auth/signin" });
            context.res.end();
            return {props: {}}
        }
    }

    return {
        props: {
            path: path, 
            room: room, 
            URL: process.env.NEXTAUTH_URL,
            partyMode: partyMode
        }
    }
}

export default party
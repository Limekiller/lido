"use client"

import io from 'socket.io-client';
import { useEffect, useState, useRef, useContext } from "react"
import MessageContext from '@/lib/contexts/MessageContext'
import VideoPlayer from "../VideoPlayer/VideoPlayer"
import Chat from './Chat/Chat';

import styles from './PartyController.module.scss'

const PartyController = ({ room, file }) => {
    const messageFunctions = useContext(MessageContext)
    const socketRef = useRef(null)

    const [lastAction, setLastAction] = useState({ action: null, args: null })
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [username, setUsername] = useState("Anonymous")
    const [chatOpen, setchatOpen] = useState(false)

    const [seekLock, setSeekLock] = useState(false)
    const seekLockRef = useRef(null)
    seekLockRef.current = seekLock

    const play = async () => {
        socketRef.current.emit("play", room.id)
    }
    const pause = async () => {
        socketRef.current.emit("pause", room.id)
    }
    const seek = async (time) => {
        if (!seekLockRef.current) {
            socketRef.current.emit("seek", time, room.id)
            setSeekLock(true)
            setTimeout(() => setSeekLock(false), 2000)
        }
    }
    const sendMessage = async (message, type = "user") => {
        if (type == "system") {
            socketRef.current.emit("sysmessage", message, room.id)
        } else {
            socketRef.current.emit("message", username, message, room.id)
        }
    }

    useEffect(() => {
        messageFunctions.addMessage({
            title: "Create a username",
            body: <div className={styles.mainMenu}>
                <input type='text' name='username' id='username' /><br /><br />
                <button
                    className='button'
                    onClick={() => {
                        const username = document.querySelector('#username').value
                        setUsername(username)
                        socket.emit("join", username, room.id)
                        messageFunctions.popMessage()
                    }}
                >
                    Ok
                </button>
            </div>,
            hideButtons: true
        })

        const socket = socketRef.current = io()

        socket.on("pause", () => {
            setLastAction({ action: 'pause', args: null })
        })
        socket.on("play", () => {
            setLastAction({ action: 'play', args: null })
        })
        socket.on("seek", time => {
            setLastAction({ action: 'seek', args: { seekTime: time } })
        })
        socket.on("message", (username, message) => {
            setMessages(messages => [{username, message, type: "user"}, ...messages])
        })
        socket.on("sysmessage", (message) => {
            setMessages(messages => [{username: username, message, type: "system"}, ...messages])
        })
        socket.on("setUsers", (users) => {
            setLastAction({ action: 'seek', args: null })
            setUsers(users.split(','))
        })

        window.history.pushState(null, null, `${window.location.origin}/party?room=${room.id}`)
        return () => {
            socket.disconnect()
        }
    }, [])

    return <div className={styles.PartyController}>
        <VideoPlayer
            fileId={file.id}
            mimetype={file.mimetype}
            metadata={JSON.parse(file.metadata)}
            name={file.name}

            partyModeActive={true}
            roomId={room.id}
            partyListeners={{
                play: play,
                pause: pause,
                seek: seek,
            }}
            lastAction={lastAction}
            chatOpen={chatOpen}
        />
        <Chat
            messageFunction={sendMessage}
            messages={messages}
            users={users}
            username={username}
            onChatOpen={(chatState) => chatState ? setchatOpen(true) : setchatOpen(false)}
        />
    </div>
}

export default PartyController
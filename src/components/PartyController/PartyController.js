"use client"

import io from 'socket.io-client';
import { useEffect, useState, useRef, useContext } from "react"
import MessageContext from '@/lib/contexts/MessageContext'
import VideoPlayer from "../VideoPlayer/VideoPlayer"

import styles from './PartyController.module.scss'

const PartyController = ({ room, file }) => {
    const messageFunctions = useContext(MessageContext)
    const socketRef = useRef(null)

    const [lastAction, setLastAction] = useState({action: null, args: null})

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

    useEffect(() => {
        messageFunctions.addMessage({
            title: "Create a username",
            body: <div className={styles.mainMenu}>
                <input type='text' name='username' id='username' />
            </div>,
            hideBoilerplate: true
        })

        const socket = socketRef.current = io()

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit("join", 'temp', room.id)
        });

        socket.on("pause", () => {
            setLastAction({action: 'pause', args: null})
        })
        socket.on("play", () => {
            setLastAction({action: 'play', args: null})
        })
        socket.on("seek", time => {
            setLastAction({action: 'seek', args: {seekTime: time}})
        })

        window.history.pushState(null, null, `${window.location.origin}/party?room=${room.id}`)
        return () => {
            socket.disconnect();
        };
    }, []);
  
    return <div className={styles.PartyController}>
        <button 
            className={`
                secondary
                ${styles.copyLinkButton}    
            `}
            style={{position: 'absolute', zIndex: 9}}
            onClick={() => {
                navigator.clipboard.writeText(window.location.href)
            }}
        >
            Copy room link
        </button>
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
        />
    </div>
}

export default PartyController
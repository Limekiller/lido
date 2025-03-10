"use client"

import { useContext, useEffect, useState } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import ContextMenuContext from '@/lib/contexts/ContextMenuContext'
import ViewContext from '@/lib/contexts/ViewContext'

import MoveFile from '../MoveFile/MoveFile'
import RenameFile from '@/components/ui/RenameFile/RenameFile'
import { renameFile as submitRename } from '@/components/ui/RenameFile/RenameFile'

import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import styles from './File.module.scss'

const File = ({ data, list }) => {
    const contextMenuFunctions = useContext(ContextMenuContext)
    const messageFunctions = useContext(MessageContext)
    const viewStatus = useContext(ViewContext)

    const [listState, setListState] = useState(null)
    const metadata = JSON.parse(data.metadata)

    const deleteFile = async () => {
        let response = await fetch(`/api/file/${data.id}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }
    
    const submitMove = async () => {
        const newId = document.querySelector('#activeCat').value
        let response = await fetch(`/api/file/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                categoryId: parseInt(newId)
            })
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    // In the TV category, we want to only allow list view
    // So we allow you to pass in a "list" prop that can tell files to display as a list
    // We ALSO control view state via the ViewContext, which overrides the prop (the context isn't available in the TV category)
    // Here, we initialize the local state to null and then set it from the prop once the component mounts
    // This way, we can check if the client has finished loading in the JSX or not by checking if the local state is null
    // Otherwise, the files show up in poster view first before switching, which looks bad. This way they just don't show up at all at first.
    useEffect(() => {
        if (!list) {
            setListState(false)
        } else {
            setListState(list)
        }
    }, [])

    return <button
        className={`
            ${styles.File}
            ${styles.unstyled}
            ${metadata.Poster ? styles.hasImg : ""}
            ${list || viewStatus.view === 'list' ? styles.list : ""}
            unstyled
        `}
        style={{
            padding: metadata.Poster && !(list || viewStatus.view === 'list') ? 0 : '1rem',
            display: listState === null ? 'none' : 'block'
        }}
        onContextMenu={e => {
            contextMenuFunctions.showMenu(e, [
                {
                    icon: "delete", label: "Delete", function: () => messageFunctions.addMessage({
                        title: "Are you sure?",
                        body: "Are you sure you want to delete this file?",
                        onSubmit: deleteFile
                    })
                },
                {
                    icon: "border_color", label: "Rename", function: () => messageFunctions.addMessage({
                        title: "Rename file",
                        body: <RenameFile id={data.id} name={data.name} />,
                        onSubmit: () => submitRename(data.id)
                    })
                },
                {
                    icon: "drive_file_move_rtl", label: "Move", function: () => messageFunctions.addMessage({
                        title: "Move file",
                        body: <MoveFile />,
                        onSubmit: submitMove
                    })
                }
            ])
        }}
        onClick={() => {
            messageFunctions.addMessage({
                title: data.name,
                body: <VideoPlayer
                    fileId={data.id}
                    name={data.name}
                    mimetype={data.mimetype}
                    metadata={metadata}
                />,
                hideBoilerplate: true
            })
        }}
    >
        <div>
            <div>
                <span className={styles.fileName}>{metadata.Title || data.name}</span>
                {metadata.seriesData ? <span
                    className={styles.seriesData}
                >
                    <br />{metadata.seriesData.Title} • S{metadata.Season.padStart(2, '0')}E{metadata.Episode.padStart(2, '0')}
                </span> : ""
                }
            </div>
            {metadata.Poster ? <img alt="Poster for media" src={metadata.Poster} /> : ""}
        </div>
    </button>
}

export default File
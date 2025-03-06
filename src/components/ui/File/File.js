"use client"

import { useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import ContextMenuContext from '@/lib/contexts/ContextMenuContext'

import RenameFile from '@/components/ui/RenameFile/RenameFile'
import { renameFile as submitRename } from '@/components/ui/RenameFile/RenameFile'

import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import styles from './File.module.scss'

const File = ({ data, list }) => {
    const contextMenuFunctions = useContext(ContextMenuContext)
    const messageFunctions = useContext(MessageContext)
    const metadata = JSON.parse(data.metadata)

    const deleteFile = async () => {
        let response = await fetch(`/api/file/${data.id}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    return <button
        className={`
            ${styles.File}
            ${styles.unstyled}
            ${metadata.Poster ? styles.hasImg : ""}
            ${list ? styles.list : ""}
            unstyled
        `}
        style={{
            padding: metadata.Poster && !list ? 0 : '1rem'
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
            {metadata.Poster ? <img src={metadata.Poster} /> : ""}
        </div>
    </button>
}

export default File
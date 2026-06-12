"use client"

import { useContext, useState } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import styles from './Download.module.scss'
import { update, delete_ } from '@/lib/actions/downloads'

const Download = ({ 
    download, 
    progress,
    disabled = false, 
    makeNonInteractable 
}) => {
    const messageFunctions = useContext(MessageContext)

    const [expanded, setExpanded] = useState(false)

    const removeDownload = async id => {
        makeNonInteractable(id, "removed")
        delete_(id)
    }

    const updateDownloadState = async (id, state) => {
        makeNonInteractable(id, state)
        update(id, {state: state})
    }

    const deleteDownload = async id => {
        const deleteResponse = await delete_(id)
        if (deleteResponse.result === "success") {
            messageFunctions.popMessage()
        }
    }

    return <div
        key={download.id}
        className={`
            ${styles.download}
            ${disabled ? styles.nonInteractible : ''}
        `}
    >
        <div className={styles.topLine}>
            <span>{download.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: "0.5rem" }}>
                {download.state === 'complete' ?
                    <>
                        <span style={{ color: 'var(--fg-color-light', fontSize: '0.75rem' }}>
                            {download.User ? download.User.name : 'Admin'}
                        </span>
                        <button
                            className='unstyled'
                            onClick={() => messageFunctions.addMessage({
                                title: "Are you sure?",
                                body: "Are you sure you want to delete this download? All attached files will be deleted!",
                                onSubmit: () => deleteDownload(download.id)
                            })}
                        >
                            <span className='material-icons'>delete</span>
                        </button>
                    </>
                : 
                    <>   
                        <span>{progress}%</span>

                        {download.state === 'downloading' ?
                            <button
                                className={`unstyled ${styles.pauseBtn}`}
                                onClick={() => updateDownloadState(download.id, 'paused')}
                            >
                                <span className='material-icons'>pause</span>
                            </button>
                            : <button
                                className={`unstyled ${styles.resumeBtn}`}
                                onClick={() => updateDownloadState(download.id, 'downloading')}
                            >
                                <span className='material-icons'>play_arrow</span>
                            </button>
                        }

                        <button
                            className={`unstyled ${styles.removeBtn}`}
                            onClick={() => removeDownload(download.id)}
                        >
                            <span className='material-icons'>cancel</span>
                        </button>
                    </>
                }

            </div>
        </div>
        
        {download.state === "complete" ?
            <>
                <button className={`${styles.expander} unstyled`} onClick={() => setExpanded(!expanded)}>
                    {expanded ? "- Hide all files" : "+ Show all files"}
                </button>
                {expanded ?
                    <table className={styles.fileList}>
                        <tbody>
                            {download.File.map(file => {
                                return <tr key={file.id}>
                                    <td>{file.name}</td>
                                    {file.area === 'video' ?
                                        <td className={styles.categoryTree}>
                                            {file.categoryTree.map(treeItem => {
                                                return <span key={treeItem.id}>{treeItem.name}</span>
                                            })}
                                        </td>
                                        : ""
                                    }
                                </tr>
                            })}
                        </tbody>
                    </table>
                : "" }
            </>
        :
            <span className={styles.destinationCategory}>
                {download.categoryTree.map((folder, index) => `${folder.name} ${index < download.categoryTree.length - 1 ? ' / ' : ''}`)}
            </span>
        }
    </div>
}

export default Download
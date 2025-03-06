"use client"

import { useContext, useState } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './FileEditor.module.scss'
import Link from 'next/link'

const FileEditor = ({ files }) => {
    const [stateFiles, setStateFiles] = useState(files)
    const messageFunctions = useContext(MessageContext)

    const deleteFile = async id => {
        const response = await fetch(`api/file/${id}`, {
            method: "DELETE"
        })
        if (response.status === 200){
            messageFunctions.popMessage()
            setStateFiles(stateFiles.filter(file => file.id != id))
        }
    }

    return <div className={styles.FileEditor}>
        <div className="buttonHeading">
            <h2>Files</h2>
        </div>
        <div className={styles.files}>
            {stateFiles.map(file => {
                return <div
                    className={styles.file}
                    key={file.id}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
                        <Link href={`api/file/${file.id}`} target='_blank'>
                            <span>{file.name}</span>
                        </Link>
                        <div style={{display: 'flex'}}>
                            <span>{file.area}</span>
                            <button
                                className='unstyled'
                                onClick={() => messageFunctions.addMessage({
                                    title: "Are you sure?",
                                    body: "Are you sure you want to remove this file? This will completely delete it from the system.",
                                    onSubmit: () => deleteFile(file.id)
                                })}
                            >
                                <span className="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            })}
        </div>
    </div>
}

export default FileEditor
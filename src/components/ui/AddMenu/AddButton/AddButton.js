"use client"

import { useState, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './AddButton.module.scss'
import DownloadMedia from '../DownloadMedia/DownloadMedia'

const AddButton = () => {
    const pathname = usePathname()

    const messageFunctions = useContext(MessageContext)

    const createCategory = async () => {
        let parentId = pathname.split('/').slice(-1)[0]
        if (parentId === 'movies') {
            parentId = 0
        } else if (parentId === 'tv') {
            parentId = 1
        } else {
            parentId = parseInt(parentId)
        }

        const newCatData = {
            name: document.querySelector('#catName').value,
            parentId: parentId
        }

        let response = await fetch(`/api/category`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newCatData)
        })
        response = await response.json()

        if (response.result === 'success') {
            messageFunctions.popMessage()
            window.location.reload()
        }
    }

    const toggleMenu = () => {
        if (document.body.classList.contains('hasMessages')) {
            messageFunctions.popMessage()
            document.body.classList.remove('hasMessages')
            return
        }

        document.body.classList.add('hasMessages')
        messageFunctions.addMessage({
            title: "Menu",
            body: <div className={styles.mainMenu}>
                <button
                    className={`unstyled ${styles.menuOption}`}
                    onClick={() => messageFunctions.addMessage({
                        title: "Add category",
                        body: <>
                            <label htmlFor='catName'>Name</label><br />
                            <input onKeyDown={e => { if (e.key === 'Enter') { createCategory() } }} type='text' name='catName' id='catName' />
                        </>,
                        onSubmit: createCategory,
                    })}
                >
                    <span className='material-icons'>create_new_folder</span>
                    <h2>Add category</h2>
                </button>
                <button
                    className={`unstyled ${styles.menuOption}`}
                    onClick={() => messageFunctions.addMessage({
                        title: "Search for media",
                        body: <DownloadMedia />
                    })}
                >
                    <span className='material-icons'>movie</span>
                    <h2>Download media</h2>
                </button>
            </div>,
            hideBoilerplate: true
        })
    }

    return <button
        className={`
            addButton
            ${styles.AddButton} 
            unstyled
        `}
        onClick={toggleMenu}
    >
        <span className='material-icons'>add_circle</span>
    </button>
}

export default AddButton
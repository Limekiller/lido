"use client"

import { useState, useContext } from 'react'
import { usePathname } from 'next/navigation'
import MessageContext from '@/lib/MessageContext'

import styles from './AddButton.module.scss'
import DownloadMedia from '../DownloadMedia/DownloadMedia'

const AddButton = () => {
    const pathname = usePathname()

    const messageFunctions = useContext(MessageContext)
    const [isActive, setIsActive] = useState(false)

    const createCategory = async () => {
        let parentId = pathname.split('/').slice(-1)[0]
        if (parentId === 'movies') {
            parentId = 0
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

    const showMenu = () => {
        setIsActive(true)
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
            ${styles.AddButton} 
            ${isActive ? styles.active : ''}
            unstyled
        `}
        onClick={showMenu}
    >
        <span className='material-icons'>add_circle</span>
    </button>
}

export default AddButton
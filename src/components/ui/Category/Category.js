"use client"

import { useContext } from 'react'
import Link from 'next/link'

import MessageContext from '@/lib/MessageContext'
import ContextMenuContext from '@/lib/ContextMenuContext'
import styles from './Category.module.scss'

const Category = ({ link, name }) => {
    const messageFunctions = useContext(MessageContext)
    const contextMenuFunctions = useContext(ContextMenuContext)

    const deleteCategory = async () => {
        const id = link.split('/').slice(-1)[0]
        let response = await fetch(`/api/category/${id}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    const renameCategory = async () => {
        const id = link.split('/').slice(-1)[0]
        const name = document.querySelector('#catRename').value
        let response = await fetch(`/api/category/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name
            })
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    return <Link href={link}>
        <div
            className={styles.Category}
            onContextMenu={e => {
                contextMenuFunctions.showMenu(e, [
                    {icon: "delete", label: "Delete", function: () => messageFunctions.addMessage({
                        title: "Are you sure?",
                        body: "Are you sure you want to delete this category? Everything inside of it, including sub-categories and movies, will be deleted too.",
                        onSubmit: deleteCategory
                    })},
                    {icon: "border_color", label: "Rename", function: () => messageFunctions.addMessage({
                        title: "Rename category",
                        body: <>
                            <label htmlFor='catRename'>Name</label><br />
                            <input type='text' id='catRename' name='catRename' />
                        </>,
                        onSubmit: renameCategory
                    })},
                ])
            }}
        >
            <span className='material-icons'>folder</span>
            <span>{name}</span>
        </div>
    </Link>
}

export default Category
"use client"

import { useContext } from 'react'
import Link from 'next/link'

import MessageContext from '@/lib/contexts/MessageContext'
import ContextMenuContext from '@/lib/contexts/ContextMenuContext'

import MoveFile from '../MoveFile/MoveFile'
import styles from './Category.module.scss'

import { update, delete_ } from '@/lib/actions/category'

const Category = ({ link, name }) => {
    const messageFunctions = useContext(MessageContext)
    const contextMenuFunctions = useContext(ContextMenuContext)
    const id = link.split('/').slice(-1)[0]

    const deleteCategory = async () => {
        const deleteResponse = await delete_(id);
        if (deleteResponse.result === 'success') {
            messageFunctions.popMessage()
        }
    }

    const renameCategory = async () => {
        const name = document.querySelector('#catRename').value
        const renameResponse = await update(id, {name: name})
        if (renameResponse.result === "success") {
            messageFunctions.popMessage()
        }
    }

    const moveCategory = async () => {
        const newId = document.querySelector('#activeCat').value
        const moveResponse = await update(id, {parentId: parseInt(newId)})
        if (moveResponse.result === "success") {
            messageFunctions.popMessage()
        }
    }

    return <Link
        href={link}
        className={styles.Category}
        onContextMenu={e => {
            contextMenuFunctions.showMenu(e, [
                {
                    icon: "delete", label: "Delete", function: () => messageFunctions.addMessage({
                        title: "Are you sure?",
                        body: "Are you sure you want to delete this category? Everything inside of it, including sub-categories and movies, will be deleted too.",
                        onSubmit: deleteCategory
                    })
                },
                {
                    icon: "border_color", label: "Rename", function: () => messageFunctions.addMessage({
                        title: "Rename category",
                        body: <>
                            <label htmlFor='catRename'>Name</label><br />
                            <input type='text' id='catRename' name='catRename' />
                        </>,
                        onSubmit: renameCategory
                    })
                },
                {
                    icon: "drive_file_move_rtl", label: "Move", function: () => messageFunctions.addMessage({
                        title: "Move file",
                        body: <MoveFile type='category' id={id} />,
                        onSubmit: moveCategory
                    })
                }
            ])
        }}
    >
        <span className='material-icons'>folder</span>
        <span>{name}</span>
    </Link>
}

export default Category
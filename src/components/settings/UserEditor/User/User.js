"use client"

import { useState, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './User.module.scss'

import { update, delete_ } from '@/lib/actions/user/user'

const User = ({
    data,
    odd
}) => {
    const messageFunctions = useContext(MessageContext)

    const [isEditing, setIsEditing] = useState(false)
    const [isInteractible, setIsInteractible] = useState(true)

    const deleteUser = async () => {
        setIsInteractible(false)
        await delete_(data.id)
        setIsEditing(false)
        messageFunctions.popMessage()
    }

    const updateUser = async () => {
        setIsInteractible(false)
        const updateData = {
            name: document.querySelector('#name').value,
            email: document.querySelector('#email').value,
            admin: document.querySelector('#admin').checked,
            profileImg: document.querySelector('#img').files[0]
        }

        const updateResult = await update(data.id, updateData)
        setIsEditing(false)
        setIsInteractible(true)
    }

    return <div
        className={`
            ${styles.User}
            ${odd ? styles.odd : ''}
            ${isInteractible ? '' : styles.disabled}
        `}
    >
        {!isEditing ?
            <div className={styles.userInfo}>
                <img alt="User profile image" src={`/api/file/${data.image}` || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
                <span className='unstyled'>{data.name}</span> •
                <span className='unstyled'>{data.email}</span>
                {data.admin ? <> • <span style={{ color: "gold" }}>Admin</span></> : ""}
            </div>
            : <div className={styles.userInfo}>
                <button className='unstyled' onClick={() => document.querySelector('#img').click()}>
                    <input 
                        style={{ display: 'none' }} 
                        type="file" 
                        id='img' 
                        name='img' 
                        accept="image/png, image/jpeg"
                        onChange={e => {
                            const file = e.target.files[0]
                            if (file) {
                                e.target.parentElement.querySelector('img').src = URL.createObjectURL(file)
                            }
                        }}
                    />
                    <img alt="User profile image" src={`/api/file/${data.image}` || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
                </button>
                <input type='text' name='name' id='name' defaultValue={data.name} />
                <input type='text' name='email' id='email' defaultValue={data.email} />
                <input type='checkbox' name='admin' id='admin' defaultChecked={data.admin} />
            </div>}

        <div className={styles.userButtons}>
            {!isEditing ?
                <div style={{ display: 'flex' }}>
                    <button
                        className='unstyled'
                        onClick={() => setIsEditing(true)}
                    >
                        <span className="material-icons">edit</span>
                    </button>
                    <button
                        className='unstyled'
                        onClick={() => messageFunctions.addMessage({
                            title: "Are you sure?",
                            body: "Are you sure you want to delete this user? All of their movies will be deleted.",
                            onSubmit: deleteUser
                        })}
                    >
                        <span className="material-icons">delete</span>
                    </button>
                </div>
                : <div style={{ display: 'flex' }}>
                    <button
                        className='unstyled'
                        onClick={updateUser}
                    >
                        <span className="material-icons">check</span>
                    </button>
                    <button
                        className='unstyled'
                        onClick={() => setIsEditing(false)}
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>}
        </div>
    </div>
}

export default User
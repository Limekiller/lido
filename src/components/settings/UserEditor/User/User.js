"use client"

import { useState, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './User.module.scss'

const User = ({
    data,
    odd,
    reportUserDeleted
}) => {
    const messageFunctions = useContext(MessageContext)

    const [userData, setUserData] = useState(data)
    const [isEditing, setIsEditing] = useState(false)
    const [isInteractible, setIsInteractible] = useState(true)

    const deleteUser = async () => {
        setIsInteractible(false)

        let response = await fetch(`/api/user/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: data.id })
        })
        response = await response.json()

        if (response.result === 'success') {
            reportUserDeleted(data.id)
        }

        setIsEditing(false)
        messageFunctions.popMessage()
    }

    const updateUser = async () => {
        setIsInteractible(false)

        let newFormData = new FormData()
        newFormData.append('id', data.id)
        newFormData.append('name', document.querySelector('#name').value)
        newFormData.append('email', document.querySelector('#email').value)
        newFormData.append('admin', document.querySelector('#admin').checked)
        newFormData.append('profileImg', document.querySelector('#img').files[0])

        let response = await fetch(`/api/user/${data.id}`, {
            method: "PUT",
            body: newFormData
        })
        response = await response.json()

        if (response.result === 'success') {
            setUserData({
                ...userData,
                name: response.data.name,
                email: response.data.email,
                admin: response.data.admin,
                image: response.data.image
            })
        }

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
                <img src={`/api/file/${userData.image}` || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
                <span className='unstyled'>{userData.name}</span> •
                <span className='unstyled'>{userData.email}</span>
                {userData.admin ? <> • <span style={{ color: "gold" }}>Admin</span></> : ""}
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
                            console.log(e.target.files)
                            const file = e.target.files[0]
                            if (file) {
                                e.target.parentElement.querySelector('img').src = URL.createObjectURL(file)
                            }
                        }}
                    />
                    <img src={`/api/file/${userData.image}` || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
                </button>
                <input type='text' name='name' id='name' defaultValue={userData.name} />
                <input type='text' name='email' id='email' defaultValue={userData.email} />
                <input type='checkbox' name='admin' id='admin' defaultChecked={userData.admin} />
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
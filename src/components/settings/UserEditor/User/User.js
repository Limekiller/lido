"use client"

import { useState, useContext } from 'react'
import MessageContext from '@/lib/MessageContext'

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
            body: JSON.stringify({id: data.id})
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

        const newUserData = {
            id: data.id,
            name: document.querySelector('#name').value,
            email: document.querySelector('#email').value,
            admin: document.querySelector('#admin').checked
        }

        let response = await fetch(`/api/user/${data.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserData)
        })
        response = await response.json()

        if (response.result === 'success') {
            setUserData({
                ...userData,
                name: response.data.name,
                email: response.data.email,
                admin: response.data.admin
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
                <span className='unstyled'>{userData.name}</span> • 
                <span className='unstyled'>{userData.email}</span> 
                {userData.admin ? <> • <span style={{color: "gold"}}>Admin</span></> : ""}
            </div>
        : <div className={styles.userInfo}>
            <input type='text' name='name' id='name' defaultValue={userData.name} />
            <input type='text' name='email' id='email' defaultValue={userData.email} />
            <input type='checkbox' name='admin' id='admin' defaultChecked={userData.admin} />
        </div>}

        <div className={styles.userButtons}>
            {!isEditing ?
                <>
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
                </>
            : <>
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
            </>}
        </div>
    </div>
}

export default User
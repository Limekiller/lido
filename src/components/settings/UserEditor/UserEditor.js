"use client"

import { useState, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import User from './User/User'
import styles from './UserEditor.module.scss'

const UserEditor = ({ users }) => {
    const messageFunctions = useContext(MessageContext)
    const [currentUsers, setCurrentUsers] = useState(users)

    const reportUserDeleted = id => {
        setCurrentUsers(currentUsers.filter(user => user.id !== id))
    }

    const createUser = async () => {
        const newUserData = {
            name: document.querySelector('#createUserName').value,
            email: document.querySelector('#createUserEmail').value,
            password: document.querySelector('#createUserPassword').value,
            admin: document.querySelector('#createUserAdmin').checked
        }

        let response = await fetch(`/api/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserData)
        })
        response = await response.json()

        if (response.result === 'success') {
            window.location.reload()
            messageFunctions.popMessage()
        }
    }

    const addUserMessage = <form>
        <label htmlFor='name'>Name</label><br />
        <input id='createUserName' type='text' name='name' /><br /><br />
        <label htmlFor='email'>Email</label><br />
        <input id='createUserEmail' type='text' name='email' /><br /><br />
        <label htmlFor='password'>Initial Password</label><br />
        <input id='createUserPassword' type='password' name='password' /><br /><br />
        <label htmlFor='admin'>Is admin?</label>
        <input id='createUserAdmin' type='checkbox' name='admin' />
    </form>

    return <div className={styles.UserEditor}>
        <div className="buttonHeading">
            <h2>Users</h2>
            <button
                onClick={() => messageFunctions.addMessage({
                    title: "Add User",
                    body: addUserMessage,
                    onSubmit: createUser
                })}
            >Add user</button>
        </div>
        {currentUsers.length > 0 ?
            currentUsers.map((user, index) => {
                return <User
                    data={user}
                    key={user.id}
                    odd={index % 2 === 0}
                    reportUserDeleted={reportUserDeleted}
                />
            })
            : <span style={{textAlign: 'center', color: "var(--fg-color-light)"}}>No users found. Why not add some?</span>
        }
    </div>
}

export default UserEditor
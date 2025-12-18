"use client"

import { useState, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import User from './User/User'
import styles from './UserEditor.module.scss'

import { create } from '@/lib/actions/user/user'

const UserEditor = ({ users }) => {
    const messageFunctions = useContext(MessageContext)

    const createUser = async () => {
        const name = document.querySelector('#createUserName').value
        const email = document.querySelector('#createUserEmail').value
        const password = document.querySelector('#createUserPassword').value
        const admin = document.querySelector('#createUserAdmin').checked

        const newUserReponse = await create(name, email, admin, password)
        if (newUserReponse.result === 'success') {
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
            >
                Add user
            </button>
        </div>
        {users.length > 0 ?
            users.map((user, index) => {
                return <User
                    data={user}
                    key={user.id}
                    odd={index % 2 === 0}
                />
            })
            : <span style={{ textAlign: 'center', color: "var(--fg-color-light)" }}>No users found. Why not add some?</span>
        }
    </div>
}

export default UserEditor
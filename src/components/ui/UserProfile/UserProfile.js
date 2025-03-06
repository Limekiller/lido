"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import styles from './UserProfile.module.scss'

const UserProfile = ({ data }) => {
    const session = useSession()
    const [errors, setErrors] = useState({})
    const [isChangingPw, setisChangingPw] = useState(false)

    const validate = () => {
        const nameVal = document.querySelector('#profileName').value
        const emailVal = document.querySelector('#profileEmail').value
        const pwVal = document.querySelector('#profilePassword').value
        const confirmPwVal = document.querySelector('#profileConfirmPassword').value

        let errors = {}
        if (!nameVal) {
            errors.profileName = "Name is a required field"
        }
        if (!emailVal) {
            errors.profileEmail = "Email is a required field"
        }

        if (isChangingPw && (pwVal === '********' || pwVal === '' || pwVal !== confirmPwVal)) {
            errors.profilePassword = "Passwords must match"
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            return false
        }

        return true
    }

    const submit = async () => {

        if (!validate()) {
            return
        }

        const newName = document.querySelector('#profileName').value
        const newEmail = document.querySelector('#profileEmail').value
        const newProfileImg = document.querySelector('#profileImg').files[0]
        const newPw = document.querySelector('#profilePassword').value

        let newFormData = new FormData()
        newFormData.append('id', data.id)
        newFormData.append('name', newName)
        newFormData.append('email', newEmail)
        newFormData.append('profileImg', newProfileImg)

        if (newPw && newPw !== '********') {
            newFormData.append('password', newPw)
        }

        let response = await fetch(`/api/user/${data.id}`, {
            method: "PUT",
            body: newFormData
        })
        response = await response.json()

        if (response.result === 'success') {
            await session.update({
                name: newName,
                email: newEmail,
                image: response.data.image
            })
            window.location.reload()
        }
    }

    const reset = () => {
        setErrors({})
        for (const field of fieldConfiguration) {
            document.querySelector(`#${field.name}`).value = field.defaultValue
        }
        document.querySelector('#profileImgThumb').src = `/api/file/${data.image}`
    }

    useEffect(() => {
        document.querySelector('#profilePassword').addEventListener('keyup', () => {
            document.querySelector('#profileConfirmPasswordContainer').style.opacity = 1
            setisChangingPw(true)
        })
    }, [])

    const fieldConfiguration = [
        { name: "profileName", label: "Name", type: "text", defaultValue: data.name },
        { name: "profileEmail", label: "Email", type: "email", defaultValue: data.email },
        { name: "profilePassword", label: "Password", type: "password", defaultValue: '********' },
        { name: "profileConfirmPassword", label: "Confirm Password", type: "password", defaultValue: '' },
    ]

    return <div className={styles.UserProfile}>

        <h1>Edit profile</h1>
        <div className={styles.mainEditForm}>
            <button className='unstyled' onClick={() => document.querySelector('#profileImg').click()}>
                <input
                    style={{ display: 'none' }}
                    type="file"
                    id='profileImg'
                    name='profileImg'
                    accept="image/png, image/jpeg"
                    onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                            e.target.parentElement.querySelector('img').src = URL.createObjectURL(file)
                        }
                    }}
                />
                <img
                    src={`/api/file/${data.image}` || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'}
                    id='profileImgThumb'
                />
            </button>

            <div className={styles.profileForm}>
                {fieldConfiguration.map(field => {
                    return <div 
                        key={field.name} 
                        id={`${field.name}Container`}
                        style={{opacity: field.name === 'profileConfirmPassword' ? 0 : 1}}
                    >
                        <label htmlFor={field.name}>{field.label}</label>
                        {errors[field.name] ? <span className={styles.error}>{errors[field.name]}</span> : ""}<br />
                        <input
                            className={`
                                ${errors[field.name] ? styles.errored : ""}
                            `}
                            defaultValue={field.defaultValue}
                            type={field.type}
                            id={field.name}
                            name={field.name}
                        /><br /><br />
                    </div>
                })}
            </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: '2rem' }}>
            <button onClick={submit}>Save</button>
            <button onClick={reset} className='secondary'>Reset</button>
        </div>

    </div>
}

export default UserProfile
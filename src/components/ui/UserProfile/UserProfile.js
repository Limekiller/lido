"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import styles from './UserProfile.module.scss'

import { update } from '@/lib/actions/user/user'

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
        if (!emailVal.match(/^\S+@\S+\.\S+$/)) {
            errors.profileEmail = "Not a valid email"
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

        let updateData = {
            name: document.querySelector('#profileName').value,
            email: document.querySelector('#profileEmail').value,
            profileImg: document.querySelector('#profileImg').files[0],
        }
        const newPw = document.querySelector('#profilePassword').value
        if (newPw && newPw !== '********') {
            updateData.password = newPw
        }

        const result = await update(data.id, updateData)
        if (result.result === 'success') {
            await session.update({
                name: updateData.name,
                email: updateData.email,
                image: result.data.image
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
        document.querySelector('#profileConfirmPasswordContainer').style.display = 'none'
    }

    useEffect(() => {
        document.querySelector('#profilePassword').addEventListener('keyup', () => {
            document.querySelector('#profileConfirmPasswordContainer').style.display = 'block'
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
                    alt="User profile image"
                />
            </button>

            <div className={styles.profileForm}>
                {fieldConfiguration.map(field => {
                    return <div 
                        key={field.name} 
                        id={`${field.name}Container`}
                        style={{display: field.name === 'profileConfirmPassword' ? 'none' : 'block'}}
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
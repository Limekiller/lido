"use client"

import { useEffect, useState, useContext } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

import ToastContext from '@/lib/contexts/ToastContext'
import Account from '../Account/Account'

import styles from './AccountSelector.module.scss'

const AccountSelector = ({ accounts }) => {
    const searchParams = useSearchParams()
    const toastFunctions = useContext(ToastContext)

    const [activeAccount, setActiveAccount] = useState(null)
    const [password, setPassword] = useState('')

    useEffect(() => {
        document.querySelector('.accounts button')?.focus()
        if (searchParams.get('error') && searchParams.get('error') === 'CredentialsSignin') {
            toastFunctions.createToast({message: "Invalid username or password", type: "alert"})
        }
    }, [])

    useEffect(() => {
        document.querySelector('.accounts button')?.focus()
        document.querySelector('input')?.focus()
    }, [activeAccount])
    

    return <div className={styles.accountSelector}>
        <button 
            className={`${styles.adminAccountSelector} unstyled`}
            onClick={() => {setActiveAccount({name: 'Admin', id: -1})}}
        >
            <span className={styles.label}>Admin account</span>
            <span className='material-icons'>settings</span>
        </button>

        {!activeAccount ? 
            <div className={`${styles.accounts} accounts`}>
                {accounts.map(account => {
                    return <Account 
                        key={account.id} 
                        id={account.id}
                        name={account.name}
                        image={account.image}
                        setActiveAccount={() => setActiveAccount(account)}
                    />
                })}
            </div>

        :   <div className={styles.activeAccount}>
            <div 
                style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                }}
            >
                <Account
                    name={activeAccount.name}
                    id={activeAccount.id}
                    image={activeAccount.image}
                    clickable={false}
                />
                <button className={`secondary ${styles.back}`} onClick={() => setActiveAccount(null)}>
                    <span className="material-icons">arrow_back</span>
                </button>
            </div>


            <div className={styles.loginForm}>
                <label htmlFor='password'>Password</label>
                <input 
                    name="password" 
                    type="password" 
                    id='password' 
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { document.querySelector('#loginSbmt').click() } }}
                />
                <button 
                    type="button"
                    id='loginSbmt'
                    onClick={() => signIn("credentials", {username: activeAccount.name, password: password})}
                >
                    Sign in
                </button>
            </div>
        </div>}
    </div>
}

export default AccountSelector
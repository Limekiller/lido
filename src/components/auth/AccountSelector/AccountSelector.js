"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Account from '../Account/Account'
import styles from './AccountSelector.module.scss'

const AccountSelector = ({ accounts }) => {
    const [activeAccount, setActiveAccount] = useState(null)
    const [password, setPassword] = useState('')

    return <div className={styles.accountSelector}>
        {!activeAccount ? 
            <div className={styles.accounts}>
                <Account
                    name='Admin'
                    id='-1'
                    setActiveAccount={() => setActiveAccount({name: 'Admin', id: -1})}
                />
                {accounts.map(account => {
                    return <Account 
                        key={account.id} 
                        id={account.id}
                        name={account.name}
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
                    clickable={false}
                />
                <button className={`unstyled ${styles.back}`} onClick={() => setActiveAccount(null)}>
                    <span className="material-icons">arrow_back</span>
                </button>
            </div>


            <form className={styles.loginForm}>
                <label htmlFor='password'>Password</label>
                <input 
                    name="password" 
                    type="password" 
                    id='password' 
                    onChange={e => setPassword(e.target.value)}
                />
                <button 
                    type="button"
                    onClick={() => signIn("credentials", {username: activeAccount.name, password: password})}
                >
                    Sign in
                </button>
            </form>
        </div>}
    </div>
}

export default AccountSelector
"use client"

import styles from './Account.module.scss'

const Account = ({ 
    name, 
    id, 
    profileImg, 
    clickable = true,
    setActiveAccount 
}) => {
    return <button 
        className={`
            ${styles.Account} 
            unstyled
        `} 
        onClick={setActiveAccount}
        style={{pointerEvents: clickable ? 'initial' : 'none'}}
    >
        <img src={profileImg || 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
        <h2>{name}</h2>
    </button>
}

export default Account
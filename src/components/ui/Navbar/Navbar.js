"use client"

import { useSession, signOut } from "next-auth/react"

import styles from './Navbar.module.scss'
import Link from 'next/link'

const Navbar = () => {
    const session = useSession()

    return <div className={`${styles.Navbar} sidebar`}>
        <div className={styles.topOptions}>
            <Link href='/'><span className="material-icons">cottage</span></Link>
            <div className={styles.divider} />
            <Link href='/movies' id='movies'><span className="material-icons">theaters</span></Link>
            <Link href='/tv'><span className="material-icons">tv</span></Link>
            <div className={styles.divider} />
            <Link href='/downloads'><span className="material-icons">cloud_download</span></Link>
            {session.data.user.admin ? <Link href='/settings'><span className="material-icons">settings</span></Link> : ""}
            <a href='#' onKeyDown={(e) => { if (e.key === "Enter") { signOut() } }}>
                <span className="material-icons" onClick={signOut}>logout</span>
            </a>
        </div>
        <div className={styles.bottomOptions}>
            {session.data.user.id !== -1 ?
                <Link href='/profile' className={styles.profile}>
                    <img alt="User profile image" src={session.data.user.image ? `/api/file/${session.data.user.image}` : 'https://www.peacocktv.com/dam/growth/assets/Library/Shrek/shrek-vertical-key-art.jpg'} />
                </Link>
                : ""
            }
        </div>
    </div>
}

export default Navbar
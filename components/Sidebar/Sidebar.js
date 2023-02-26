import styles from './Sidebar.module.scss'
import Link from 'next/link'
import { faFilm, faDownload, faTv, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

function Sidebar() {
    const { data: session } = useSession()

    if (session) {
        return (
                <div className={`
                    ${styles.sidebar}
                    sidebar
                `}>
                    <div className={styles.topOptions}>
                        <Link href='/Movies' id='movies'><FontAwesomeIcon icon={faFilm} /></Link>
                        <Link href='/TV'><FontAwesomeIcon icon={faTv} /></Link>
                    </div>
                    <div className={styles.bottomOptions}>
                        <Link href='/'><FontAwesomeIcon icon={faHome} /></Link>
                        <Link href='/downloads'><FontAwesomeIcon icon={faDownload} /></Link>
                        <a href='#' onKeyDown={(e) => {if (e.key === "Enter") {signOut()}}}>
                            <FontAwesomeIcon icon={faSignOutAlt} onClick={signOut} />
                        </a>
                    </div>
                </div>
            )
    } else {
        return null
    }

    
}

export default Sidebar

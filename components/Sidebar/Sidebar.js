import styles from './Sidebar.module.scss'
import Link from 'next/link'
import { faFilm, faDownload, faTv, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { signOut } from 'next-auth/client'
import { useSession } from 'next-auth/client'

function Sidebar() {
    const [ session, loading ] = useSession()

    if (session) {
        return (
                <div className={styles.sidebar}>
                    <div className={styles.topOptions}>
                        <Link href='/Movies'>
                            <a><FontAwesomeIcon icon={faFilm} /></a>
                        </Link>
                        <Link href='/TV'>
                            <a><FontAwesomeIcon icon={faTv} /></a>
                        </Link>
                    </div>
                    <div className={styles.bottomOptions}>
                        <Link href='/'>
                            <a><FontAwesomeIcon icon={faHome} /></a>
                        </Link>
                        <Link href='/downloads'>
                            <a><FontAwesomeIcon icon={faDownload} /></a>
                        </Link>
                        <a><FontAwesomeIcon icon={faSignOutAlt} onClick={signOut} /></a>
                    </div>
                </div>
            )
    } else {
        return null
    }

    
}

export default Sidebar

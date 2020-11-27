import styles from './Sidebar.module.scss'
import Link from 'next/link'
import { faFilm, faDownload, faTv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Sidebar() {
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
                <Link href='/downloads'>
                    <a><FontAwesomeIcon icon={faDownload} /></a>
                </Link>
            </div>
        </div>
    )
}

export default Sidebar

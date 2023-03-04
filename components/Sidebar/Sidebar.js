import styles from './Sidebar.module.scss'
import Link from 'next/link'
import { faFilm, faDownload, faTv, faSignOutAlt, faHome, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

import SpaceUsage from '@/components/home/SpaceUsage/SpaceUsage.js'
import VPN from '@/components/home/VPN/VPN.js'

function Sidebar() {
    const { data: session } = useSession()

    const [showServerInfo, setshowServerInfo] = useState(true)

    useEffect(() => {
        if (window.innerWidth < 600) {
            setshowServerInfo(false)
        }
    }, [])
    

    if (session) {
        return (
                <div className={`
                    ${styles.sidebar}
                    sidebar
                `}>
                    <div className={styles.topOptions}>
                        <Link href='/'><FontAwesomeIcon icon={faHome} /></Link>
                        <div className={styles.divider} />
                        <Link href='/Movies' id='movies'><FontAwesomeIcon icon={faFilm} /></Link>
                        <Link href='/TV'><FontAwesomeIcon icon={faTv} /></Link>
                        <div className={styles.divider} />
                        <Link href='/downloads'><FontAwesomeIcon icon={faDownload} /></Link>
                        <a href='#' onKeyDown={(e) => {if (e.key === "Enter") {signOut()}}}>
                            <FontAwesomeIcon icon={faSignOutAlt} onClick={signOut} />
                        </a>
                    </div>
                    <div className={styles.bottomOptions}>
                        {window.innerWidth > 600 ? '' : 
                            <button 
                                className='unstyled' 
                                tabIndex='-1'
                                onClick={() => setshowServerInfo(!showServerInfo)}
                            >
                                <FontAwesomeIcon icon={faEllipsisV}  />
                            </button> 
                        }
                        <div 
                            className={styles.serverInfo}
                            style={{display: showServerInfo ? 'flex' : 'none'}}
                        >
                            <SpaceUsage />
                            <VPN />
                        </div>
                    </div>
                </div>
            )
    } else {
        return null
    }

    
}

export default Sidebar

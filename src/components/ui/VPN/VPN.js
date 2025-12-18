"use client"

import { useEffect, useState } from 'react'
import styles from './VPN.module.scss'

import { get } from '@/lib/actions/vpn'

function VPN() {

    const [IPs, setIPs] = useState({})

    useEffect(() => {
        get()
        .then(response => setIPs(response.data))
    }, [])

    const VPNActive = IPs.ingress == IPs.egress ? false : true;

    return (
        <>
            <div 
                className={styles.VPN}
                style={{
                    background: VPNActive ? 'linear-gradient(to bottom, #4ec84e, #0a600a)' : 'linear-gradient(to top, darkred, #f44848)',
                    mask: `url("/images/${VPNActive ? 'lock.svg' : 'lock_open.svg'}") no-repeat 50% 50%`
                }}
            >
                <span>VPN</span>
                    <span 
                        className='material-icons'
                        style={{
                            fontSize: '10px',
                            width: '10px',
                            height: '10px',
                        }}
                    >
                        {VPNActive ? 'done' : 'close'}
                    </span>
            </div>
        </>
    )
}

export default VPN
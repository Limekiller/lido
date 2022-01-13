import { useEffect, useState } from 'react'
import styles from './VPN.module.scss'

function VPN() {

    const [IPs, setIPs] = useState({})

    useEffect(() => {
        fetch('/api/dashboard?module=space')
        .then(response => response.json())
        .then(data => setIPs(data))
    })

    const VPNActive = IPs.ingress === IPs.egress ? true : false;

    return (
        <>
            <div className={` ${styles.VPN} VPN `}>
                <span>VPN</span>
                <img className={styles.status} src={VPNActive ? '/images/icons/check.svg' : '/images/icons/times.svg'} />
            </div>
            <style jsx>{`
                .VPN {
                    background: ${VPNActive ? 'linear-gradient(to bottom, #4ec84e, #0a600a)' : 'linear-gradient(to top, darkred, #f44848)'};
                }
            `}</style>
        </>
    )
}

export default VPN

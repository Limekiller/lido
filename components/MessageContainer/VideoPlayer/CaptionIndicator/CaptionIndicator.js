import styles from './CaptionIndicator.module.scss'
import { faCheckCircle, faClosedCaptioning, faRedoAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function CaptionIndicator(props) {
    
    let loadingHTML
    let tooltipText
    let statusColor
    switch (props.state) {
        case 'fetching':
            loadingHTML = <div className={` loading ${styles.CILoading} `} />
            tooltipText = 'Fetching subtitle file...'
            statusColor = 'white'
            break;
        case 'ok':
            loadingHTML = <FontAwesomeIcon icon={faCheckCircle} />
            tooltipText = 'Subtitles loaded!'
            statusColor = '#498249'
            break
        case 'error':
            loadingHTML = <FontAwesomeIcon icon={faRedoAlt} />
            tooltipText = 'Failed to load subtitles'
            statusColor = '#b05555'
            break
    }

    return (
        <div className={styles.CaptionIndicator}>
            <span className={styles.text}><FontAwesomeIcon icon={faClosedCaptioning} /></span>
            <div className={styles.indicator} style={{color: statusColor}} >
                {loadingHTML}
            </div>
        </div>
    )
}

export default CaptionIndicator

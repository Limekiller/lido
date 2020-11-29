import styles from './LoadingIndicator.module.scss'
import { faFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const LoadingIndicator = (props) => {
    return (
        <div className={styles.loadingIndicator}>
            <FontAwesomeIcon icon={faFilm} className={styles.loading} />
        
            <style jsx>{`
                .${styles.loadingIndicator} {
                    ${props.visible ? '' : 'opacity: 0'};
                    ${props.visible ? '' : 'pointer-events: none'};
                }
            `}</style>
        </div>
    )
}

export default LoadingIndicator

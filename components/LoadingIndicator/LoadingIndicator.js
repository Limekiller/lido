import styles from './LoadingIndicator.module.scss'
import { faFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const LoadingIndicator = (props) => {
    return (
        <div className={styles.loadingIndicator}>        
            <style jsx>{`
                .${styles.loadingIndicator} {
                    ${props.visible ? '' : 'animation: none'};
                    ${props.visible ? '' : 'opacity: 0'};
                    ${!props.visible ? '' : 'width: 100%'};
                }
            `}</style>
        </div>
    )
}

export default LoadingIndicator

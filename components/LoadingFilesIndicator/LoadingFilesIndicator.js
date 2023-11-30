import styles from './LoadingFilesIndicator.module.scss'

const LoadingFilesIndicator = () => {

    let html = []
    for (let i = 1.2; i > 0.01; i -= 0.2) {
        html.push(
            <div className={`
                ${styles.loadingFile}
                file
            `} 
            key={i}
            style={{ opacity: i, animationDelay: -i+'s'}}
            />
        )
    }

    return (
        <div className={`
            ${styles.loadingFilesIndicator}
            files
        `}>
            {html.map(file => file)}
        </div>
    )
}

export default LoadingFilesIndicator

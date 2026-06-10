import styles from './Spinner.module.scss'

const Spinner = ({width = '3rem', margin = '2rem auto'}) => {
    return <div 
        style={{
            width: width,
            height: width,
            margin: margin
        }}
    >
        <div className={styles.Spinner} />
    </div>
}

export default Spinner
import styles from './EmptyAlert.module.scss'

const EmptyAlert = ({ message="Nothing here!<br />Why not start some downloads?" }) => {
  return <div className={styles.emptyAlert}>
      <span className="material-icons">all_out</span>
      <span dangerouslySetInnerHTML={{__html: message}} />
  </div>
}

export default EmptyAlert
import { Component } from 'react'
import styles from './ToastContainer.module.scss'

export default class ToastContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={styles.toastContainer}>
                {this.props.toasts.map(toast => {
                    return (
                        <div className={styles.toast}>{toast.text}</div>
                    )
                })}
            </div>
        )
    }
}

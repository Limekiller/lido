import { Component } from 'react'
import styles from './ToastContainer.module.scss'

export default class ToastContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className={styles.toastContainer}>
                {this.props.toasts.map((toast) => {
                    let background = 'linear-gradient(orange, gold)'
                    if (toast.type == 'alert') {
                        background = 'linear-gradient(#530707, #973232)'
                    }

                    return (
                        <div key={toast.id}>
                            <div 
                                id={'toast'+toast.id} 
                                className={styles.toast}
                            >{toast.text}</div>
                            <style jsx>{`
                                #${'toast'+toast.id} {
                                    background: ${background};
                                    animation-duration: ${toast.time}ms;
                                }
                            `}</style>
                        </div>
                    )
                })}
            </div>
        )
    }
}

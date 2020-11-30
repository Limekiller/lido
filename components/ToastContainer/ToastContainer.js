import { Component } from 'react'
import styles from './ToastContainer.module.scss'

export default class ToastContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={styles.toastContainer}>
                {this.props.toasts.map((toast, index) => {
                    let background = 'linear-gradient(orange, gold)'
                    if (toast.type == 'alert') {
                        background = 'linear-gradient(darkred, #f44848)'
                    }

                    return (
                        <>
                            <div id={'toast'+index} className={styles.toast}>{toast.text}</div>
                            <style jsx>{`
                                #${'toast'+index} {
                                    background: ${background};
                                }
                            `}</style>
                        </>
                    )
                })}
            </div>
        )
    }
}

import { Component, cloneElement } from 'react'
import styles from './MessageContainer.module.scss'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class MessageContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`
                ${styles.messageContainer}
                ${this.props.visible ? styles.visible : ''}
            `}>
                <div className={styles.closeButton}>
                    <FontAwesomeIcon 
                        icon={faTimes} 
                        onClick={() => this.props.closeMessage()}
                    />
                </div>
                {this.props.content ? cloneElement(this.props.content, { closeMessage: this.props.closeMessage, globalFunctions: this.props.globalFunctions }) : ''}
            </div>
        )
    }
}

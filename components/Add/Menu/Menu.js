import styles from './Menu.module.scss'
import { Component } from 'react'
import { faFolderPlus, faFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DownloadMedia from './DownloadMedia/DownloadMedia.js'
import AppContext from '@/components/AppContext.js'
import Message from '@/components/MessageContainer/Message/Message'

export class Menu extends Component {

    static contextType = AppContext

    createFolder = folderName => {
        fetch('/api/folderActions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: window.location.pathname,
                name: encodeURIComponent(folderName)
            })
        })
        .then(response => response.text())
        .then(data => {
            this.props.functions.toggleMenu()
            this.props.functions.fetchContents()
        })
    }

    setActiveOption = option => {
        let message

        switch (option) {
            case 'createFolder':
                message = <Message>
                    <input 
                        id='folderName' 
                        type='text' 
                        onKeyDown={(e) => {if (e.keyCode == 13) {this.createFolder(document.querySelector('#folderName').value)}}}
                    /><br />
                    <button onClick={() => this.createFolder(document.querySelector('#folderName').value)}>Add folder</button>
                    <button onClick={this.context.globalFunctions.closeMessage}>Cancel</button>
                </Message>
                break;
            case 'downloadMedia':
                message = <Message>
                    <DownloadMedia globalFunctions={this.props.globalFunctions} />
                </Message>
                break;
        }

        this.context.globalFunctions.createMessage(message)
    }

    render() {
        return (
            <div className={`
                ${styles.menu}
                ${this.props.menuOpen ? styles.active : ''}
            `}>              
                <button 
                    className={`
                        link
                        ${styles.menuOption}
                    `}
                    onClick={() => this.setActiveOption('createFolder')}
                >
                    <div className={styles.optionLabel}>
                        <FontAwesomeIcon icon={faFolderPlus} />
                        <span>Create<br />folder</span>
                    </div>
                </button>

                <button 
                    className={`
                        link
                        ${styles.menuOption}
                    `}
                    onClick={() => this.setActiveOption('downloadMedia')}
                >
                    <div className={styles.optionLabel}>
                        <FontAwesomeIcon icon={faFilm} />
                        <span>Download<br />Media</span>
                    </div>
                </button>
            </div>
        )
    }
}

export default Menu

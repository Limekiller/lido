import styles from './Menu.module.scss'
import { Component } from 'react'
import { faFolderPlus, faFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DownloadMedia from './DownloadMedia/DownloadMedia.js'

export class Menu extends Component {
    constructor(props) {
        super(props);
    }

    createFolder(folderName) {
        fetch('/api/folderActions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: window.location.pathname,
                name: folderName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.setState({ activeOption: null })
            this.props.functions.toggleVisibility()
            this.props.functions.fetchContents()
        })
    }

    render() {
        return (
            <div className={`
                ${styles.menu}
                ${this.props.menuOpen ? styles.active : ''}
            `}>

                <div className={`
                    ${styles.menuOptionContainer}
                    ${this.props.activeOption && this.props.activeOption != 'createFolder' ? styles.inactive : ''}
                `}>                    
                <div 
                        className={`
                            ${styles.createFolder}
                            ${styles.menuOption}
                            ${this.props.activeOption == 'createFolder' ? styles.active : ''}
                        `}
                        onClick={() => this.props.functions.setActiveOption('createFolder')}
                    >
                        <div className={styles.optionLabel}>
                            <FontAwesomeIcon icon={faFolderPlus} />
                            <span>Create<br />folder</span>
                        </div>

                        <div className={styles.activeOptions}>
                            <input 
                                id='folderName' 
                                type='text' 
                                onKeyDown={(e) => {if (e.keyCode == 13) {this.createFolder(document.querySelector('#folderName').value)}}}
                            />
                            <button 
                                onClick={() => this.createFolder(document.querySelector('#folderName').value)}>
                                Submit
                            </button>
                        </div>

                    </div>
                </div>

                <div className={`
                    ${styles.menuOptionContainer}
                    ${this.props.activeOption && this.props.activeOption != 'downloadMedia' ? styles.inactive : ''}
                `}>
                    <div 
                        className={`
                            ${styles.downloadMedia}
                            ${styles.menuOption}
                            ${this.props.activeOption == 'downloadMedia' ? styles.active : ''}
                        `}
                        onClick={() => this.props.functions.setActiveOption('downloadMedia')}
                    >
                        <div className={styles.optionLabel}>
                            <FontAwesomeIcon icon={faFilm} />
                            <span>Download<br />Media</span>
                        </div>

                        <div className={styles.activeOptions}>
                            <DownloadMedia globalFunctions={this.props.globalFunctions} />
                        </div>

                    </div>
                </div>

            </div>
        )
    }
}

export default Menu

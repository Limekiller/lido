import { Component } from 'react'
import styles from './DownloadMedia.module.scss'
import AppContext from '@/components/AppContext.js'

export default class DownloadMedia extends Component {
    
    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = { 
            loading: false,
            results: [] 
        };
    }

    getResults = (query) => {
        this.setState({ loading: true })
        fetch('/api/search/torrents?search=' + query, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data.length == 0) {
                this.context.globalFunctions.createToast('warning', 'No results found!')
            }
            this.setState({ results: data, loading: false })
        })
        .catch(error => {
            this.setState({ loading: false })
            this.context.globalFunctions.createToast('alert', 'Couldn\'t fetch results! Is your VPN turned on?')
        })
    }

    queueDownload = (magnet, e) => {
        e.target.classList.add('inactive')
        fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                magnet: magnet,
                dir: window.location.pathname
            })
        })
        .then(response => response.text())
        .then(data => {
            document.querySelector('#addButton').click()
            this.context.globalFunctions.createToast('notify', 'Your download will start soon!')
        })
    }

    render() {
        let resultsHTML
        if (this.state.loading) {
            resultsHTML = <div className='loading' />
        } else {
            // Add an empty element before results or
            // the first result will catch the end of the loading animation
            resultsHTML = <>
                {this.state.results.map((result, index) => {
                    if (parseInt(result.seeders) > parseInt(result.leechers)) {
                        return (
                            <button 
                                key={index}
                                className={`
                                    ${styles.result}
                                    download-result
                                `}
                                onClick={(e) => this.queueDownload(result.link, e)}
                            >
                                <div>{result.name}</div>
                                <div className={styles.dlInfo}>
                                    <div className={styles.seeders}>{result.seeders}</div>
                                    <div className={styles.leechers}>{result.leechers}</div>
                                </div>
                            </button>
                        )
                    }
                })}
            </>
        }

        return (
            <div className={`
                ${styles.downloadMedia}
                body
            `}>
                <h1><label htmlFor='search'>Search</label></h1>
                <div style={{display: 'flex'}}>
                    <input 
                        type='text' 
                        name='search' 
                        id='search' 
                        className={`
                            ${styles.search}
                            use-keyboard-input
                        `}
                        onKeyDown={(e) => {if (e.keyCode == 13) { this.getResults(document.querySelector('#search').value) }}} 
                    />
                    <button 
                        className={styles.confirmSearch}
                        onClick={() => this.getResults(document.querySelector('#search').value)}
                    >
                        Go
                    </button>
                </div>
                <div className={styles.results}>
                    {resultsHTML}
                </div>
            </div>
        )
    }
}

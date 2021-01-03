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
        fetch('/api/getResults?search=' + query, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            this.setState({ results: data, loading: false })
        })
    }

    queueDownload = (magnet, e) => {
        e.target.classList.add('inactive')
        fetch('/api/downloadActions', {
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
                            <div />
                            {this.state.results.map((result, index) => {
                                if (parseInt(result.seeders) > parseInt(result.leechers)) {
                                    return (
                                        <div 
                                            key={index}
                                            className={styles.result}
                                            onClick={(e) => this.queueDownload(result.link, e)}
                                        >
                                            <div>{result.name}</div>
                                            <div className={styles.dlInfo}>
                                                <div className={styles.seeders}>{result.seeders}</div>
                                                <div className={styles.leechers}>{result.leechers}</div>
                                            </div>
                                        </div>
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
                <input 
                    type='text' 
                    name='search' 
                    id='search' 
                    className={styles.search} 
                    onKeyDown={(e) => {if (e.keyCode == 13) { this.getResults(document.querySelector('#search').value) }}} 
                />
                <button 
                    className={styles.confirmSearch}
                    onClick={() => this.getResults(document.querySelector('#search').value)}
                >
                    Go
                </button>
                <div className={styles.results}>
                    {resultsHTML}
                </div>
            </div>
        )
    }
}

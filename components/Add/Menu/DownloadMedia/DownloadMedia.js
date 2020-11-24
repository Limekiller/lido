import { Component } from 'react'
import styles from './DownloadMedia.module.scss'

export default class DownloadMedia extends Component {
    constructor(props) {
        super(props);
        this.state = { results: [] };
    }

    getResults = (query) => {
        fetch('/api/getResults?search=' + query, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            this.setState({ results: data })
        })
    }

    queueDownload = (magnet) => {
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
        .then(response => response.json())
        .then(data => { console.log(data) })
    }

    render() {
        return (
            <div className={`
                ${styles.downloadMedia}
                body
            `}>
                <h1><label for='search'>Search</label></h1>
                <input type='text' name='search' id='search' className={styles.search} />
                <button 
                    className={styles.confirmSearch}
                    onClick={() => this.getResults(document.querySelector('#search').value)}
                >
                    Go
                </button>
                <div className={styles.results}>
                    {this.state.results.map((result, index) => (
                        <div 
                            className={styles.result}
                            onClick={() => this.queueDownload(result.link)}
                        >
                            {result.name}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

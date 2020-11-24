import Link from 'next/link'
import path from 'path'
import { Component } from 'react'
import Add from '@/components/Add/Add.js'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer.js'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class FolderView extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            contents: {
                folders: [],
                files: []
            } 
        };
    }

    componentDidUpdate() {
        this.fetchContents();
    }
    componentDidMount() {
        this.fetchContents();
    }

    fetchContents() {
        fetch('/api/getContents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: decodeURIComponent(window.location.pathname),
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(this.state.contents)
            console.log(data);
            if (JSON.stringify(this.state.contents) != JSON.stringify(data)) {
                this.setState({
                    contents: data
                });
            }
        })
    }

    deleteFolder(folderName) {
        fetch('/api/folderActions', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: decodeURIComponent(window.location.pathname),
                name: folderName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents();
        })
    }

    generateHTML(data) {
        return (
            <>
                <div className='folders'>
                    {data.folders.map((folder, index) => {
                        return (
                            <>
                                <div key={index} className='folderContainer'>
                                    <FontAwesomeIcon 
                                        className='trash'
                                        icon={faTrashAlt}
                                        onClick={() => this.deleteFolder(folder)} 
                                    />
                                    <Link href={window.location.pathname + '/' + folder}>
                                        <div className='folder'>
                                            <span>{folder}</span>
                                        </div>
                                    </Link>
                                </div>

                            </>
                        )
                    })}
                </div>
                <div className='files'>
                    {data.files.map((file, index) => {
                        return (
                            <>
                                <div 
                                    key={index} 
                                    className='file'
                                    onClick={() => this.props.createMessage(<VideoPlayer path={window.location.pathname + '/' + file}/>)}
                                >
                                    <span>{file}</span>
                                </div>
                            </>
                        )
                    })}
                </div>
            </>
        )
    }

    render() {
        return (
            <>
                {this.generateHTML(this.state.contents)}
                <Add 
                    fetchContents={this.fetchContents.bind(this)}
                />
            </>
        )
    }
}

export default FolderView


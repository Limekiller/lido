import Link from 'next/link'
import path from 'path'
import { Component } from 'react'
import Add from '@/components/Add/Add.js'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer.js'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.js'
import { withRouter } from 'next/router'
import Draggable from 'react-draggable';

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

    checkDropZone = (e) => {
        if (e.target.classList.contains('folder')) {
            const fileName = document.querySelector('.react-draggable-dragging').innerText
            const pathName = e.target.innerText
            this.moveFile(fileName, pathName)
        }
    }
    dragOperations = (e) => {
        document.querySelector('.react-draggable-dragging').classList.add('dragging')
        if (e.target.classList.contains('folder')) {
            document.querySelector('.react-draggable-dragging').classList.add('droppable')
        } else {
            document.querySelector('.react-draggable-dragging').classList.remove('droppable')
        }
    }
    moveFile = (fileName, destPath) => {
        fetch('/api/folderActions', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currPath: decodeURIComponent(window.location.pathname),
                destPath: destPath,
                fileName: fileName
            })
        })
        .then(response => response.text())
        .then(data => {
            this.fetchContents()
        })
    }

    generateHTML(data) {
        return (
            <>
                <div className='folders'>
                    {data.folders.map((folder, index) => {
                        return (
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
                        )
                    })}
                </div>

                <div className='files'>
                    {Object.keys(data.files).map((_key, index) => {
                        const hasPoster = data.files[_key].data.Poster == "N/A" ? false : true
                        return (
                            <Draggable
                                position={{x: 0, y: 0}}
                                onDrag={(e) => this.dragOperations(e)}
                                onStop={(e) => this.checkDropZone(e)}
                                key={index} 
                            >
                                <div 
                                    className='file'
                                    onClick={() => this.props.createMessage(<VideoPlayer path={window.location.pathname + '/' + data.files[_key].name}/>)}
                                    style={{
                                        backgroundImage: hasPoster ? 'url("' + data.files[_key].data.Poster + '")' : 'linear-gradient(#6c6c6c, #464646)',
                                        color: hasPoster ? 'rgba(0,0,0,0)' : 'white'
                                    }}
                                >
                                    <span>{decodeURIComponent(data.files[_key].name)}</span>
                                </div>
                            </Draggable>
                        )
                    })}
                </div>

            </>
        )
    }

    render() {
        return (
            <>
                <Breadcrumbs />
                <h1 className='pageTitle'>{this.props.router.asPath.split('/').slice(-1)}</h1>
                {this.generateHTML(this.state.contents)}
                <Add 
                    fetchContents={this.fetchContents.bind(this)}
                />
            </>
        )
    }
}

export default withRouter(FolderView)


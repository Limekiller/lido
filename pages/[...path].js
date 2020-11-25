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
        this.getMovieData();
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

    getMovieData() {
        document.querySelectorAll('.file').forEach(elem => {
            const title = elem.innerText.split('.').slice(0, -1).join('.')
            fetch('/api/getMovieData?title=' + title)
            .then(response => response.json())
            .then(data => {
                if (data.Poster != "N/A") {
                    elem.style.backgroundImage = 'url("' + data.Poster + '")'
                    elem.querySelector('span').classList.add('posterLoaded')
                } else {
                    elem.querySelector('span').classList.remove('posterLoaded')
                    elem.style.backgroundImage = ''
                }
            })
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
                <Breadcrumbs />
                <h1 className='pageTitle'>{this.props.router.asPath.split('/').slice(-1)}</h1>
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
                    {data.files.map((file, index) => {
                        return (
                            <Draggable
                                position={{x: 0, y: 0}}
                                onDrag={(e) => this.dragOperations(e)}
                                onStop={(e) => this.checkDropZone(e)}
                                key={index} 
                            >
                                <div 
                                    className='file'
                                    onClick={() => this.props.createMessage(<VideoPlayer path={window.location.pathname + '/' + file}/>)}
                                >
                                    <span>{decodeURIComponent(file)}</span>
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
                {this.generateHTML(this.state.contents)}
                <Add 
                    fetchContents={this.fetchContents.bind(this)}
                />
            </>
        )
    }
}

export default withRouter(FolderView)


import path from 'path'
import { Component } from 'react'
import VideoPlayer from '@/components/MessageContainer/VideoPlayer/VideoPlayer.js'
import { withRouter } from 'next/router'
import { getSession } from 'next-auth/client'
import Router from "next/router";
import AppContext from '@/components/AppContext.js'
import Search from '@/components/Search/Search.js'
import LoadingFilesIndicator from '@/components/LoadingFilesIndicator/LoadingFilesIndicator.js'

class FolderView extends Component {

    static contextType = AppContext

    constructor(props) {
        super(props);
        this.state = { files: [], hasLoaded: false };
    }

    componentDidMount = () => {
        this.getData()
        Router.events.on('routeChangeComplete', this.getData)
    }

    getData = () => {
        fetch('/api/search?query=' + Router.query.query)
        .then(results => results.json())
        .then(data => this.setState({ files: data, hasLoaded: true }))
    }

    generateHTML(data) {
        return (
            <div className='files'>
                {Object.keys(data).map((_key, index) => {
                    let hasPoster = false
                    if (data[_key].data.Poster && data[_key].data.Poster != "N/A") {
                        hasPoster = true
                    }
                    return ( 
                        <div 
                            key={index}
                            className='file'
                            onClick={() => this.context.globalFunctions.createMessage(<VideoPlayer path={data[_key].name}/>)}
                            style={{
                                backgroundImage: hasPoster ? 'url("' + data[_key].data.Poster + '")' : 'linear-gradient(#6c6c6c, #464646)',
                                color: hasPoster ? 'rgba(0,0,0,0)' : 'white'
                            }}
                        >
                            <span>{decodeURIComponent(data[_key].name)}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <>
                <Search />
                <h1 className='pageTitle searchTitle'>Search Results</h1>
                {this.state.hasLoaded ? '' : <LoadingFilesIndicator />}
                {this.generateHTML(this.state.files)}
                <style jsx>{`
                    .searchTitle {
                        margin-top: -90px;
                    }
                    @media (max-width: 1000px) {
                        .searchTitle {
                            margin-top: -10px;
                        }
                    }
                `}</style>
            </>
        )
    }
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/login" });
            context.res.end();
        }
    }

    return {
        props: { session }
    }
}

export default withRouter(FolderView)


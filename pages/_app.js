import '../styles/globals.scss'
import { useEffect, useContext, createContext } from 'react'
import Head from 'next/head'
import App, { Container } from 'next/app'
import Sidebar from '@/components/Sidebar/Sidebar.js'
import MessageContainer from '@/components/MessageContainer/MessageContainer.js'

class MyApp extends App {

  createMessage = (content) => {
    this.setState({
      messageContainer: {
        ...this.state.messageContainer,
        content: content,
        visible: true,
      }
    })
  }
  closeMessage = () => {
    this.setState({
      messageContainer: {
        ...this.state.messageContainer,
        content: '',
        visible: false,
      }
    })
  }

  state = {
    messageContainer: {
      content: null,
      visible: false,
      closeMessage: this.closeMessage
    },
    globalFunctions: {
      createMessage: this.createMessage
    }
  }

  render() {
    const { Component, pageProps } = this.props

    return (
      <>
        <Head>
          <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />
          <script src="https://kit.fontawesome.com/cae1618de2.js" crossorigin="anonymous"></script>
        </Head>

        <div className='pageContainer'>
          <Component {...pageProps} {...this.state.globalFunctions} />
        </div>

        <Sidebar />
        <MessageContainer {...this.state.messageContainer} />
      </>
    )
  }
}

export default MyApp

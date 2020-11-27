import '../styles/globals.scss'
import { useEffect, useContext, createContext } from 'react'
import Head from 'next/head'
import App, { Container } from 'next/app'
import Sidebar from '@/components/Sidebar/Sidebar.js'
import MessageContainer from '@/components/MessageContainer/MessageContainer.js'
import ToastContainer from '@/components/ToastContainer/ToastContainer.js'

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

  createToast = (text) => {
    this.setState({
      toastContainer: {
        ...this.state.toastContainer,
        toasts: [
          ...this.state.toastContainer.toasts,
          { text: text }
        ]
      }
    })
    setTimeout(() => {
      this.popToast()
    }, 5000 )
  }
  popToast = () => {
    this.setState({
      toastContainer: {
        ...this.state.toastContainer,
        toasts: this.state.toastContainer.toasts.slice(0, -1)
      }
    })
  }
  
  state = {
    messageContainer: {
      content: null,
      visible: false,
      closeMessage: this.closeMessage
    },
    toastContainer: {
      toasts: [],
      popToast: this.popToast
    },
    globalFunctions: {
      createMessage: this.createMessage,
      createToast: this.createToast
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
          <Component {...pageProps} globalFunctions={this.state.globalFunctions} />
        </div>

        <Sidebar />
        <MessageContainer {...this.state.messageContainer} />
        <ToastContainer {...this.state.toastContainer} />
      </>
    )
  }
}

export default MyApp

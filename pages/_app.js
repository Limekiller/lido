import '../styles/globals.scss'
import Head from 'next/head'
import App from 'next/app'
import Sidebar from '@/components/Sidebar/Sidebar.js'
import MessageContainer from '@/components/MessageContainer/MessageContainer.js'
import ToastContainer from '@/components/ToastContainer/ToastContainer.js'
import { Provider } from 'next-auth/client'
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator.js'
import Router from "next/router";
import AppContext from '@/components/AppContext.js'
import { createRef } from 'react'

class MyApp extends App {

  constructor(props) {
    super(props);
    this.state = {
      loadingVisible: false,

      messageContainer: {
        content: null,
        visible: false,
      },

      toasts: [],
    }

    this.toastRef = createRef(this.state.toasts)
    this.toastRef.current = this.state.toasts

    Router.events.on("routeChangeComplete", () => {this.setState({ loadingVisible: false })} );
    Router.events.on("routeChangeStart", () => {this.setState({ loadingVisible: true })} );
  }

  createMessage = (content) => {
    this.setState({
      messageContainer: {
        content: content,
        visible: true,
      }
    })
  }
  closeMessage = () => {
    this.setState({
      messageContainer: {
        content: '',
        visible: false,
      }
    })
  }

  createToast = (type, text) => {
    let tempToasts = this.state.toasts
    tempToasts.push({ text: text, type: type })
    this.setState({
      toasts: tempToasts
    })
    setTimeout(() => {
      let tempToasts = this.toastRef.current
      tempToasts.shift()
      this.setState({
        toasts: tempToasts
      })
    }, 5000 )
  }

  globalFunctions = {
    createMessage: this.createMessage,
    closeMessage: this.closeMessage,
    createToast: this.createToast
  }

  render() {
    const { Component, pageProps } = this.props
    
    return (
      <>
        <Head>
          <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />
          <script src="https://kit.fontawesome.com/cae1618de2.js" crossorigin="anonymous"></script>
        </Head>


        <AppContext.Provider value={{ globalFunctions: this.globalFunctions }}>
          <Provider session={pageProps.session}>
            <div className='pageContainer'>
                <LoadingIndicator visible={this.state.loadingVisible} />
                <Component {...pageProps}/>
            </div>
            <Sidebar />
          </Provider>

          <MessageContainer {...this.state.messageContainer}/>
          <ToastContainer toasts={this.state.toasts} />
        </AppContext.Provider>
      </>
    )
  }
}

export default MyApp

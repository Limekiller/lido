import '../styles/globals.scss'
import Head from 'next/head'
import App from 'next/app'
import Sidebar from '@/components/Sidebar/Sidebar.js'
import MessageContainer from '@/components/MessageContainer/MessageContainer.js'
import ToastContainer from '@/components/ToastContainer/ToastContainer.js'
import { Provider } from 'next-auth/client'
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator.js'
import Router from "next/router";

class MyApp extends App {

  constructor(props) {
    super(props);
    this.state = {
      loadingVisible: false,
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

    Router.events.on("routeChangeComplete", () => {this.setState({ loadingVisible: false })} );
    Router.events.on("routeChangeStart", () => {this.setState({ loadingVisible: true })} );
  }

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

  createToast = (type, text) => {
    this.setState({
      toastContainer: {
        ...this.state.toastContainer,
        toasts: [
          ...this.state.toastContainer.toasts,
          { 
            type: type,
            text: text 
          }
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
        toasts: this.state.toastContainer.toasts.slice(1)
      }
    })
  }

  
  render() {
    const { Component, pageProps } = this.props
    
    return (
      <>
        <Head>
          <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />
          <script src="https://kit.fontawesome.com/cae1618de2.js" crossorigin="anonymous"></script>
        </Head>

        <Provider session={pageProps.session}>
          <div className='pageContainer'>
              <LoadingIndicator visible={this.state.loadingVisible} />
              <Component {...pageProps} globalFunctions={this.state.globalFunctions} />
          </div>
          <Sidebar />
        </Provider>

        <MessageContainer {...this.state.messageContainer} globalFunctions={this.state.globalFunctions} />
        <ToastContainer {...this.state.toastContainer} />
      </>
    )
  }
}

export default MyApp

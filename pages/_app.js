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
      messages: [],
      toasts: [],
    }

    this.toastRef = createRef(this.state.toasts)
    this.toastRef.current = this.state.toasts

    Router.events.on("routeChangeComplete", () => {this.setState({ loadingVisible: false })} );
    Router.events.on("routeChangeStart", () => {this.setState({ loadingVisible: true })} );
  }


  /**
   * Global function to add a new message to the stack
   * Message contents and unique ID are tracked in the messages variable in this component's state
   * 
   * @param {JSX} content The content that the message should contain
   */
  createMessage = (content) => {
    const messageID = Math.floor(Math.random()*90000) + 10000
    SpatialNavigation.add(
      `message${messageID}`,
      {selector: `.message${messageID} button, .message${messageID} svg.selectable, .message${messageID} button.vjs-control, .message${messageID} input`}
    );

    let tempMessages = this.state.messages
    tempMessages.push({ content: content, id: messageID })
    this.setState({
      messages: tempMessages
    })
  }

  /**
   * Global function to clear the last message on the stack
   */
  closeMessage = () => {
    let tempMessages = this.state.messages
    const lastMessage = tempMessages.pop()
    SpatialNavigation.remove(`message${lastMessage.id}`);
    this.setState({
      messages: tempMessages
    })
  }

  /**
   * Global function to close all messages
   */
  closeAllMessages = () => {
    for (let i = 0; i <= this.state.messages.length; i++) {
      this.closeMessage()
    }
  }

  // Init spatial nav on app load
  componentDidMount() {
    window.addEventListener('load', function() {
      SpatialNavigation.init();
      SpatialNavigation.add(
        'mainNav',
        {selector: 
          `.sidebar a, 
          .pageContainer a, 
          .pageContainer input, 
          .pageContainer button, 
          .folderContainer, 
          .file,
          #addButton`
        }
      );
      SpatialNavigation.makeFocusable('mainNav');
      SpatialNavigation.focus();
    });
  }

  /**
   * Global function for creating pop-up toasts
   * 
   * @param {string} type The "alert level" of the toast
   * @param {string} text What thet toast should say
   * @param {int} time How long the toast should appear 
   */
  createToast = (type, text, time=5000) => {
    let tempToasts = this.state.toasts
    tempToasts.push({ text: text, type: type, animation: 'incoming' })
    this.setState({
      toasts: tempToasts
    })

    // Add the outgoing animation to the first toast before it is deleted
    setTimeout(() => {
      let tempToasts = this.toastRef.current
      tempToasts[0].animation = 'outgoing'
      this.setState({ toasts: tempToasts })
    }, time - 600)

    // Delete the first toast, and set the new first toast's animation to none
    // so that it doesn't re-animate the incoming anim
    setTimeout(() => {
      let tempToasts = this.toastRef.current
      tempToasts.shift()
      if (tempToasts[0]) {
        tempToasts[0].animation = 'none'
      }
      this.setState({
        toasts: tempToasts
      })
    }, time )
  }

  // Function refs are stored in the app context and passed to every component,
  // so they can be used anywhere
  globalFunctions = {
    createMessage: this.createMessage,
    closeMessage: this.closeMessage,
    closeAllMessages: this.closeAllMessages,
    createToast: this.createToast
  }

  render() {
    const { Component, pageProps } = this.props
    
    return (
      <>
        <Head>
          <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />
          <script src="https://kit.fontawesome.com/cae1618de2.js" crossOrigin="anonymous"></script>
          <script src="https://luke-chang.github.io/js-spatial-navigation/spatial_navigation.js"></script>
        </Head>


        <AppContext.Provider value={{ globalFunctions: this.globalFunctions }}>
          <Provider session={pageProps.session}>
            <div className='pageContainer'>
                <LoadingIndicator visible={this.state.loadingVisible} />
                <Component {...pageProps}/>
            </div>
            <Sidebar />
          </Provider>

          <MessageContainer messages={this.state.messages} />
          <ToastContainer toasts={this.state.toasts} />
        </AppContext.Provider>
      </>
    )
  }
}

export default MyApp

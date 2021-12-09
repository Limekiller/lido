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

    Router.events.on("routeChangeComplete", () => {
      this.setState({ loadingVisible: false })
    });
    Router.events.on("routeChangeStart", () => {this.setState({ loadingVisible: true })} );
  }

  componentDidUpdate() {
    Keyboard.bindButtons();
    SpatialNavigation.makeFocusable('mainNav');
    SpatialNavigation.makeFocusable('add');
  }

  componentDidMount() {
    this.initSpatialNav();

    // Add osk script
    const script = document.createElement("script");
    script.src = "/osk/js/keyboard.js";
    script.async = false;
    document.body.appendChild(script);

    // Disable the osk on mousemove and enable it on keyboard press
    window.onload = () => {
      window.addEventListener('mousemove', () => {
        Keyboard.properties.enabled = false;
      });
      window.addEventListener('keydown', (e) => {
        if (e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'ArrowDown') {
          Keyboard.properties.enabled = true;
        }
      })
    }
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
      {
        selector: `.message${messageID} button, .message${messageID} svg.selectable, .message${messageID} button.vjs-control, .message${messageID} input`,
        defaultElement: `.message${messageID} button`
      }
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

  /**
   * Helper function to initialize all the spatial nav stuff
   */
  initSpatialNav = () => {
    SpatialNavigation.init();
    SpatialNavigation.add(
      'mainNav', {
        selector: 
          `.sidebar a, 
          .pageContainer a, 
          .pageContainer input, 
          .pageContainer button, 
          .folderContainer, 
          .file`,
        defaultElement: '#movies'
      }
    );
    SpatialNavigation.makeFocusable('mainNav');

    SpatialNavigation.add(
      'add',
      {selector: '#addButton', defaultElement: '#addButton'}
    );
    SpatialNavigation.enable('add');

    SpatialNavigation.add(
      'keyboard',
      {selector: '.keyboard__key', defaultElement: '.keyboard__key'}
    );
    SpatialNavigation.makeFocusable('keyboard');
    SpatialNavigation.disable('keyboard');
    SpatialNavigation.focus(document.querySelector('#movies'));
  }

  /**
   * Global function for creating pop-up toasts
   * 
   * @param {string} type The "alert level" of the toast
   * @param {string} text What the toast should say
   * @param {int} time How long the toast should appear 
   */
  createToast = (type, text, time=5000) => {
    const toastID = Math.floor(Math.random()*90000) + 10000;
    let tempToasts = this.state.toasts
    tempToasts.push({ text: text, type: type, id: toastID, time: time })
    this.setState({ toasts: tempToasts })

    setTimeout(() => {
      let tempToasts = this.toastRef.current
      tempToasts.shift()
      this.setState({ toasts: tempToasts })
    }, time)
  }

  // Function refs are stored in the app context and passed to every component,
  // so they can be used anywhere
  globalFunctions = {
    createMessage: this.createMessage,
    closeMessage: this.closeMessage,
    closeAllMessages: this.closeAllMessages,
    createToast: this.createToast,
  }

  render() {
    const { Component, pageProps } = this.props
    
    return (
      <>
        <Head>
          <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />

          <script src="https://kit.fontawesome.com/cae1618de2.js" crossOrigin="anonymous"></script>
          <script src="/spatialnav/spatial_navigation.js"></script>

          <link href="/osk/css/style.css" rel="stylesheet" />
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

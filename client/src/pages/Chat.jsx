import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import {useNavigate} from 'react-router-dom'
import Contacts from '../components/Contacts'
import Welcome from '../components/Welcome'
import ChatContainer from '../components/ChatContainer'
import {io} from 'socket.io-client'
import {host} from '../utils/APIUrl'

export default function Chat() {
  const socket = useRef()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [currentUser, setCurrentUser] = useState(undefined)
  const [currentChat, setCurrentChat] = useState(undefined)
  const [token, setToken] = useState(null)
  
  //checking current user
  useEffect(() => {
    async function checkCurrentUser() {
      if (!localStorage.getItem('token')) navigate('/')
      else {
        const token = await JSON.parse(localStorage.getItem('token'))
        const response = await fetch(`${host}/api/user/current-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        }).then((res) => res.json())
        setCurrentUser(response.data.user)
      }
    }
    checkCurrentUser()
  }, [])

  //get contacts
  useEffect(() => {
    async function getContacts() {
        if (currentUser) {
            const token = await JSON.parse(localStorage.getItem ('token'))
            const response = await fetch(`${host}/api/user/all-chat-users`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                }
            }).then(res => res.json())          
            setContacts(response.data.chatList)
        }
    }
    getContacts()
}, [currentUser])

  //add online users (socket)
  useEffect(() => {
    if (currentUser) {
        socket.current = io(host)
        socket.current.emit('add-user', currentUser._id)
    }
  }, [currentUser])

  //change chat
  const handleChatChange = (chat) => {
    setCurrentChat(chat)
  }

  return (
    <>
        <Container>
        <div className="container">
            <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} />
            {
                currentChat === undefined ? 
                <Welcome  currentUser={currentUser}/> :
                <ChatContainer currentUser={currentUser} currentChat={currentChat} socket={socket}/>
            }
            
        </div>
        </Container>
    </> 
  )
}

const Container = styled.div`
height: 100vh;
width: 100vw;
display: flex;
flex-direction: column;
justify-content: center;
gap: 1rem;
align-items: center;
background-color: #131324;
.container {
  height: 85vh;
  width: 85vw;
  background-color: #00000076;
  display: grid;
  grid-template-columns: 25% 75%;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-columns: 35% 65%;
  }
}
`;

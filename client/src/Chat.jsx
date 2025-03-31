import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './modules/AuthContext'
import { getChatData, sendMessage } from './modules/Api'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import CloseButton from 'react-bootstrap/esm/CloseButton'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import { ArrowLeft, Send } from 'react-bootstrap-icons'

import socket from './modules/socket'
import Loading from './Loading'

const Chat = () => {

    const { login, user, logout } = useContext(AuthContext)
    const { groupId } = useParams()

    const [chatId, setChatId] = useState("")
    const [messagesInfo, setMessagesInfo] = useState([])
    const [message, setMessage] = useState("")
    const [joinedChat, setJoinedChat] = useState(false)
    const [shouldScroll, setShouldScroll] = useState(true)   
    const [fetched, setFetched] = useState(false) 
    const [chatLoaded, setChatLoaded] = useState(false)
    const [sentOpen, setSentOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isCreator, setIsCreator] = useState(false)

    const navigate = useNavigate()

    function pressEnter () {
        try {
        let input = document.querySelector('messageArea')
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
              event.preventDefault()
              document.getElementById("sendButton").click()
            }
          })
        } catch (e) {
            console.log(e)
        }
    }

    async function fetchData(){
        let chatInfo
        try{
            chatInfo = await getChatData(groupId)
        }
        catch(err){
            navigate('/group/'+groupId)
        }

        setMessagesInfo(
            chatInfo.messagesList
        )
        setChatId(
            chatInfo.chatId
        )
        setSentOpen(
            chatInfo.sentOpen
        )
        setIsOpen(
            chatInfo.open
        )
        setIsCreator(
            chatInfo.isCreator
        )

        socket.emit('joinChat', chatInfo.chatId)
        setFetched(true)
    }

    useEffect(() => {

        socket.connect()

        socket.on('error', (msg) => {
            console.log(msg)
        });

        socket.on('message', (msg) => {
            console.log(msg)
            fetchData().then(()=>{
                setShouldScroll(true)
            })
        });

        fetchData()
        //pressEnter()
        

        return () => {
            socket.off('message');
        };
    }, [])

    const formatDate = (dateStr) => {
        let timestamp = Date.parse(dateStr)
        let date = new Date(timestamp)
        let year = date.getFullYear()
        let month = date.getMonth() + 1 < 10 ? '0'+(date.getMonth() + 1) : date.getMonth() + 1
        let day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate()
        let hour = date.getHours() < 10 ? '0'+date.getHours() : date.getHours()
        let minute = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()

        return day + '.' + month + '.' + year + ' ' + hour + ':' + minute
    }


    return (
        <>
            {fetched &&

            <div className="chatPage">
                <div className="top">
            <div className="back" onClick={() => navigate('/group/'+groupId)}>
                    <ArrowLeft size={24} />
                </div>
                <div className="groupsText" style={{paddingTop: '20px', paddingBottom: '0px'}}>Чат</div>
                {isCreator &&
                <div className="openButtonBlock" style={{opacity: sentOpen || !isCreator ? '0.5' : '1'}}>
                    <Button variant='outline-dark' onClick={async () => {
                        await socket.emit('open', chatId, groupId, localStorage.getItem('token'))
                    }}  disabled={sentOpen || !isCreator ? true : false}>
                        Подружиться
                    </Button>
                </div>  
                }
                </div>
            
                <div 
                //style={{
                    // width: '600px', backgroundColor: 'lightgray', margin: 'auto',
                    // height: '300px', overflowY: 'auto'  }} 
                id='scrollablePanel' className='chatPanel'>
                    {messagesInfo.map((message, index) => {
                        
                        if(index == messagesInfo.length - 1 && shouldScroll) {
                            setTimeout(() => {
                                var panel = document.getElementById('scrollablePanel')
                                if(chatLoaded){
                                    panel.scrollTo({top: panel.scrollHeight, behavior: 'smooth'})
                                } else {
                                    panel.scrollTo({top: panel.scrollHeight})
                                    setChatLoaded(true)
                                }
                            }, 0)
                            setShouldScroll(false)
                        }

                        console.log(message)

                        if(message.type == 'open') 
                            return (
                                <div className='infoMessage'>
                                    {message.isFromMyGroup ? 
                                    `Ваша группа предложила подружиться!` : 
                                    `Найденная группа предложила подружиться!`
                                    }
                                </div>
                            )
                        else if(message.type == 'opened') 
                            return (
                                <div className='infoMessage'>{
                                    message.isFromMyGroup ? 
                                    `Ваша группа приняла предложение подружиться!` : 
                                    `Найденная группа приняла предложение подружиться!`
                                }
                                </div>
                            )
                        else
                            return (
                                <div className="messageBlock">
                                    <div className={ message.isFromMyGroup ? "messageAndImage" : "messageAndImageOther"}>
                                    <div key={index} className={ message.isFromMyGroup ?'ourMessage' : 'othersMessage'}
                                    >
                                        <div className='messageName'>{user._id == message.authorId ? 'Вы' : message.name}</div>
                                        <div className='messageText'>{message.message}</div>
                                        <div className='messageTime'>{formatDate(message.date)}</div>
                                    </div>
                                    {!isOpen &&
                                    <div className={ message.isFromMyGroup ? "imageChat" : "imageChatOther"}>
                                        {message.name[0] ? message.name[0] : "?"}
                                    </div>
                                    }
                                    {isOpen &&
                                        <Image src={message.image} 
                                        style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                                        roundedCircle fluid />
                                    }
                        
                                    
                                    </div>
                                </div>
                            )
                    })}
                </div>


                {/* <Modal.Body style={{marginTop: '15px'}}>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Control as="textarea" rows={5}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)
                            }} />
                        </Form.Group>
                    </Form>
                </Modal.Body> */}
                <div className="messageWriteBlock">
                    <div className="messageWrite">
                        <textarea className='messageArea' rows={2} value={message}
                        placeholder='Введите сообщение' id='messageArea'
                        onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                    </div>
                <Send size={48} className='sendButton' 
                style={{cursor: message.length > 0 ? 'pointer' : 'initial', opacity: message.length > 0 ? '1' : '0.7'}} 
                color='#414141' onClick={async () => {
                    if (message.length  == 0) {
                        return
                    }
                    await socket.emit('message', chatId, groupId, message, localStorage.getItem('token'))
                    setMessage('')
                    await fetchData()
                    setShouldScroll(true)
                }} />
                </div>



                

            </div>
            }
            {!fetched && 
            <Loading />}
        </>
    )
}

export default Chat
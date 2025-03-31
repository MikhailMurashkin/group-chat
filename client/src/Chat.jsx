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

    const navigate = useNavigate()

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
        await setChatId(
            chatInfo.chatId
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
                <div className="openButtonBlock">
                        <Button variant='outline-dark'>
                            Открыться
                        </Button>
                    </div>
                </div>

                <div onClick={async () => {
                    await socket.emit('open', chatId, groupId, localStorage.getItem('token'))
                }}
                >Открыться</div>
            
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

                        return (
                            <div className="messageBlock">
                                <div className={ message.isFromMyGroup ? "messageAndImage" : "messageAndImageOther"}>
                                <div key={index} className={ message.isFromMyGroup ?'ourMessage' : 'othersMessage'}
                                >
                                    <div className='messageName'>{user._id == message.authorId ? 'Вы' : message.name}</div>
                                    <div className='messageText'>{message.message}</div>
                                    <div className='messageTime'>{formatDate(message.date)}</div>
                                </div>
                                <div className={ message.isFromMyGroup ? "imageChat" : "imageChatOther"}>
                                    {message.name[0] ? message.name[0] : "?"}
                                </div>
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
                        onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                    </div>
                <Send size={48} style={{cursor: 'pointer'}} color='#414141' onClick={async () => {
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
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
import { ArrowLeft, Copy, Pencil } from 'react-bootstrap-icons'

import socket from './modules/socket'

const Chat = () => {

    const { login, user, logout } = useContext(AuthContext)
    const { groupId } = useParams()

    const [messagesInfo, setMessagesInfo] = useState([])
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    async function fetchData(){
        let messagesInfo = await getChatData(groupId)
        setMessagesInfo(
            messagesInfo.messagesList
        )
        console.log(messagesInfo)
    }

    useEffect(() => {

        socket.connect()
        // socket.on('message', (msg) => {
        //     console.log(msg);
        // });

        fetchData()

        
        // socket.emit('joinGroup', groupId)

        // socket.emit('message', { groupId, msg: "My message" });

        // Очистка при размонтировании компонента
        // return () => {
        //     socket.off('message');
        // };
    }, [])

    const joinGroup = () => {
        if (groupId) {
            socket.emit('joinGroup', groupId);
        }
    };

    const sendMessage = () => {
        if (groupId && message) {
            socket.emit('message', { groupId, msg: message });
            setMessage('');
        }
    };

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

            <div className="chatPage">
            <div className="back" onClick={() => navigate('/group/'+groupId)}>
                    <ArrowLeft size={24} />
                </div>
                <div className="groupsText">Чат</div>
            
                <div 
                //style={{
                    // width: '600px', backgroundColor: 'lightgray', margin: 'auto',
                    // height: '300px', overflowY: 'auto'  }} 
                id='scrollablePanel' className='chatPanel'>
                    {messagesInfo.map((message, index) => {
                        
                        if(index == messagesInfo.length - 1){
                            setTimeout(() => {
                                var panel = document.getElementById('scrollablePanel');
                                panel.scrollTop = panel.scrollHeight;
                            }, 0)
                        }

                        return (
                            <div key={index} className={ message.isFromMyGroup ?'ourMessage' : 'othersMessage'}
                            >
                                <div className='messageName'>{user._id == message.authorId ? 'Вы' : message.name}</div>
                                <div className='messageText'>{message.message}</div>
                                <div className='messageTime'>{formatDate(message.date)}</div>
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
                    <div className="messageText">
                        <textarea className='messageArea' rows={3} value={message}
                        onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                    </div>
                </div>
                <Button onClick={() => {
                    // sendMessage(groupId, message)

                    socket.timeout(3000).emit('message', groupId, message,
                        localStorage.getItem('token'), (err, response) => {
                        if (err) {
                            // the server did not acknowledge the event in the given delay
                        } else {
                            console.log(response)
                        }
                    })
                }}>Сохранить</Button>



                

            </div>
        </>
    )
}

export default Chat
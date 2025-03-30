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


    return (
        <>

            <h1>Chat</h1>
        
            <div style={{
                width: '600px', backgroundColor: 'lightgray', margin: 'auto',
                height: '300px', overflowY: 'auto'      

            }} id='scrollablePanel'>
                {messagesInfo.map((message, index) => {
                    
                    if(index == messagesInfo.length - 1){
                        setTimeout(() => {
                            var panel = document.getElementById('scrollablePanel');
                            panel.scrollTop = panel.scrollHeight;
                        }, 0)
                    }

                    return (
                        <div key={index} style={message.isFromMyGroup ? {textAlign: 'right'} : {textAlign: 'left'}}>
                            <b>{user._id == message.authorId ? 'You' : message.name}</b>
                            <p>{message.message}</p>
                        </div>
                    )
                })}
            </div>


            <Modal.Body style={{marginTop: '15px'}}>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Control as="textarea" rows={5}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                    </Form.Group>
                </Form>
            </Modal.Body>
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



            


        </>
    )
}

export default Chat
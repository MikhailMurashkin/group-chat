import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './modules/AuthContext'
import { getChatData, sendMessage } from './modules/Api'
import socket from './modules/socket'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import CloseButton from 'react-bootstrap/esm/CloseButton'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import { ArrowLeft, Copy, Pencil } from 'react-bootstrap-icons'

const Chat = () => {

    const { login, user, logout } = useContext(AuthContext)
    const { groupId } = useParams()

    const [messagesInfo, setMessagesInfo] = useState([])
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    async function fetchData(){
        let messagesInfo = await getChatData(groupId)
        setMessagesInfo(
            messagesInfo
        )
        console.log(messagesInfo)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <h1>Chat</h1>
            <Modal.Body>
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
                sendMessage(groupId, message)
            }}>Сохранить</Button>
        </>
    )
}

export default Chat
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './modules/AuthContext'
import { getGroupInfoById, startGroupSearch, getFoundGroupInfo,
    foundGroupDecision, updateGroupDescription, closeChat
 } from './modules/Api'
import socket from './modules/socket'
import Loading from './Loading'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import CloseButton from 'react-bootstrap/esm/CloseButton'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import { ArrowLeft, Copy, Pencil, Chat, XCircleFill } from 'react-bootstrap-icons'

const Group = () => {

    // const handleMessage = async () => {
    //     try {
    //         let message = await getMessage("", "")
    //         console.log(message);
    //     } catch (error) {

    //     }
    // }
    const { login, user, logout } = useContext(AuthContext)
    const { groupId } = useParams()

    const [message, setMessage] = useState('message')
    const [response, setResponse] = useState('')
    const [groupInfo, setGroupInfo] = useState({})
    const [showList, setShowList] = useState(false)
    const [fetched, setFetched] = useState(false)
    const [newGroupDescription, setNewGroupDescription] = useState('')
    const [updatedDescription, setUpdatedDescription] = useState('')
    const [modalEditShow, setModalEditShow] = useState(false)
    const [modalCloseChatShow, setModalCloseChatShow] = useState(false)
    const [groupFound, setGroupFound] = useState({})
    const navigate = useNavigate()

    async function fetchData(){
        try {
            let info = await getGroupInfoById(groupId)
            setGroupInfo(
                info
            )
        } catch (e) {
            navigate('/groups')
        }
        try {
            let found = await getFoundGroupInfo(info.groupFoundId)
            setGroupFound(found)
        } catch (e) {
            console.log(e)
        }
        // setCreator (info.isCreator)
        setFetched(true)
    }

    useEffect(() => {
        if (!fetched) {
            socket.connect()


            
            fetchData()
            
        }

        // socket.on('message', (msg) => {
        //     setResponse(msg)
        // })
    }, [])

    const openEditModal = () => {
        setNewGroupDescription(groupInfo?.description)
        setModalEditShow(true)
    }

    const editDEscription  = () => {
        setModalEditShow(false)
        // ZAPROS!!!!
    }

    async function makeDecision (decision) {
        await foundGroupDecision(groupId, decision)
        await fetchData()
    }

    return (
        <>
            {/* <Button as="a" variant="primary" onClick={()=>{
                socket.timeout(5000).emit('message', message, (err, response) => {
                    if (err) {
                        // the server did not acknowledge the event in the given delay
                      } else {
                        setResponse(response)
                      }
                })
            }}>
                Send message
            </Button>
            
            <h1>{groupInfo.inSearch ? "Searching..." : ""}</h1>
            
            <input type='text' onChange={(e) => {
                setMessage(e.target.value)
            }}></input>
            <h1>Group #{groupId}</h1>
            <h1>Response: {response}</h1>

            
            <Button as="a" variant="primary" onClick={()=>{
                startGroupSearch(groupId)
            }}>
                Начать поиск
            </Button> */}
            {/* {user.email} */}

            {fetched &&
            <div className="groupPage">
                <div className="back" onClick={() => navigate('/groups')}>
                    <ArrowLeft size={24} />
                </div>
                <div className="groupsText">{groupInfo.name}</div>

                {groupInfo.isCreator &&
                    <div className="actionsBlock">
                        <div className="invite">
                            Код приглашения: 
                            <div className="inviteCode" onClick={() => {navigator.clipboard.writeText(groupInfo.inviteCode)}}>
                                {groupInfo.inviteCode}
                                <Copy size={16} />
                            </div>
                        </div>
                        {(!groupInfo.inSearch && (!groupInfo?.groupFoundId || groupInfo?.groupFoundId?.length == 0)) &&
                        <div className="search">
                            <Button onClick={async ()=>{
                            await startGroupSearch(groupId)
                            await fetchData()
                        }}>Найти группу для общения</Button>
                        </div>}
                        {groupInfo.inSearch &&
                        <div className="searching">
                            <Spinner animation="grow" variant="primary" size="sm" />
                            Идет поиск группы...
                        </div>
                        }
                        
                    </div>}
                    {groupInfo.groupFoundId?.length > 0 && !(groupFound?.foundGroupDecision && !groupInfo.chat) &&
                        <div className="foundGroup">
                            <Card className="text-center">
                                <Card.Header>Найдена группа для общения</Card.Header>
                                <Card.Body>
                                <Card.Title>{groupFound?.name}</Card.Title>
                                <Card.Text>
                                    {groupFound?.description}
                                </Card.Text>
                                {(!groupInfo.chat && groupInfo.isCreator && !groupInfo?.myDecision && groupInfo.myDecision != false) &&
                                <div className="buttonsFound">
                                    <Button variant="primary" onClick={() => {
                                        makeDecision(true)
                                    }}>Начать общение</Button>
                                    <Button variant="secondary" onClick={() => {
                                        makeDecision(false)
                                    }}>Отказаться</Button>
                                </div>}
                                {groupInfo?.chat && 
                                    <div className="buttonsFound">
                                        <Button variant="dark" className='chatButton' onClick={() => {
                                            navigate('./chat')
                                        }}>
                                            <Chat size={18} />
                                            {' Чат'}
                                        </Button>
                                        {groupInfo.isCreator &&
                                        <Button variant="danger" className='chatButton' onClick={() => {
                                            setModalCloseChatShow(true)
                                        }}>
                                            <XCircleFill size={18} />
                                            {' Закрыть чат'}
                                        </Button>}
                                    </div>
                                }
                                {(!groupInfo.isCreator && !groupInfo?.myDecision) &&
                                <Card.Text className="text-muted">Администратор еще не принял решение</Card.Text>
                                }
                                {(groupInfo?.myDecision && !groupFound?.foundGroupDecision && groupFound.foundGroupDecision != false) &&
                                <Card.Text className="text-muted">Ожидаем ответа от другой группы...</Card.Text>
                                }
                                {groupInfo?.myDecision == false &&
                                <Card.Text className="text-muted">Вы отказались от общения</Card.Text>
                                }
                                {groupFound?.foundGroupDecision == false &&
                                <Card.Text className="text-muted">К сожалению, группа отказалась с вами общаться</Card.Text>
                                }
                                </Card.Body>
                            </Card>
                            
                            {/* {groupInfo.chat &&
                                <Button variant="primary" onClick={() => {
                                    navigate('./chat')
                                }}>Открыть чат</Button>
                            } */}
                        </div>
                    }
                    {groupFound?.foundGroupDecision && !groupInfo.chat &&
                        <h1>Поиск нового чата будет доступен завтра</h1>
                    }

                <div className="textBlock">
                    <div className="text">Создатель группы: {groupInfo?.participants[0].name}</div>
                    <div className="descriptionBlock">Описание: 
                        {groupInfo.isCreator &&
                        <Pencil className='editButton' size={18} onClick={openEditModal} />}
                        <div className="description">
                            {updatedDescription ? updatedDescription : groupInfo.description}
                        </div>
                    </div>
                    <div className="participants">
                        <div className="textParticipants">Участники: 
                            <div className="showButton" onClick={() => setShowList(!showList)}>{showList ? "скрыть" : "показать"}</div>
                        </div>
                        {showList && 
                        groupInfo.participants.map((member, i) => {
                            console.log(member)
                            if (i > 0) {
                                return(
                                    <div className="memberInfo" key={i}>{i + ". " + member.name}</div>
                                )
                            }
                        })
                        }
                    </div>
                    
                    
                </div>


            </div>
            }
            {!fetched && 
            <Loading />}

            <Modal
                show={modalEditShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Редактирование описания группы
                </Modal.Title>
                <CloseButton onClick={() => setModalEditShow(false)} />
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Control as="textarea" rows={5}
                        value={newGroupDescription}
                        onChange={(e) => {
                            setNewGroupDescription(e.target.value)
                        }} />
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalEditShow(false)}>Отмена</Button>
                <Button onClick={() => {
                    updateGroupDescription(newGroupDescription, groupId).then(()=>{
                        setUpdatedDescription(newGroupDescription)
                        setModalEditShow(false)
                    })
                }}>Сохранить</Button>
                </Modal.Footer>
            </Modal>


            <Modal
                show={modalCloseChatShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Закрытие чата
                </Modal.Title>
                <CloseButton onClick={() => setModalCloseChatShow(false)} />
                </Modal.Header>
                <Modal.Body>
                    Чат с группой {groupFound?.name} будет прекращен. Вы уверены, что хотите закрыть чат?
                </Modal.Body>
                <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalEditShow(false)}>Отмена</Button>
                <Button variant='danger' onClick={async () => {
                        await closeChat(groupId)
                        await fetchData()
                        setModalEditShow(false)
                    }
                }>Закрыть чат</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Group
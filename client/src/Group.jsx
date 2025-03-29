import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './modules/AuthContext';
import { getGroupInfoById, startGroupSearch } from './modules/Api';
import socket from './modules/socket'

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/esm/CloseButton'
import Form from 'react-bootstrap/Form';

import ListGroup from 'react-bootstrap/ListGroup';
import { ArrowLeft, Copy, Pencil } from 'react-bootstrap-icons';

const Group = () => {

    // const handleMessage = async () => {
    //     try {
    //         let message = await getMessage("", "")
    //         console.log(message);
    //     } catch (error) {

    //     }
    // }
    const { login, user, logout } = useContext(AuthContext);
    const { groupId } = useParams();

    const [message, setMessage] = useState('message');
    const [response, setResponse] = useState('');
    const [groupInfo, setGroupInfo] = useState({});
    const [showList, setShowList] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [modalEditShow, setModalEditShow] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (!fetched) {
            socket.connect()


            async function fetchData(){
                // let info = await getGroupInfoById(groupId)
                setGroupInfo(
                    await getGroupInfoById(groupId)
                )
                // setCreator(info.isCreator)
                setFetched(true)
            }
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

    return (
        <>
            <Button as="a" variant="primary" onClick={()=>{
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
            </Button>
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
                        {/* {(groupInfo.inSearch || )
                        <div className="search" onClick={()=>{startGroupSearch(groupId)}}>
                            <Button >Найти группу для общения</Button>
                        </div>} */}
                    </div>}

                <div className="textBlock">
                    <div className="text">Создатель группы: {groupInfo?.participants[0].name}</div>
                    <div className="descriptionBlock">Описание: 
                        {groupInfo.isCreator &&
                        <Pencil className='editButton' size={18} onClick={openEditModal} />}
                        <div className="description">{groupInfo.description}</div>
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
                <Button onClick={
                    //варечка умница
                    editDEscription
                }>Сохранить</Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}

export default Group;
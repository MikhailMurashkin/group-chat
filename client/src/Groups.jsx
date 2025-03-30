import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './modules/AuthContext'
import { createGroup, getGroupsByUserId, joinGroupByCode } from './modules/Api'

import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/esm/CloseButton'
import Card from 'react-bootstrap/Card';
import Loading from './Loading'
// import { PeopleFill, PlusCircleFill } from 'react-bootstrap-icons';


const Groups = () => {

    // const handleMessage = async () => {
    //     try {
    //         let message = await getMessage("", "")
    //         console.log(message);
    //     } catch (error) {

    //     }
    // }
    const { login, user, logout } = useContext(AuthContext);
    const [modalCreateShow, setModalCreateShow] = useState(false);
    const [modalJoinShow, setModalJoinShow] = useState(false);
    const [modalErrorShow, setModalErrorShow] = useState(false);
    const [groupsCreated, setGroupsCreated] = useState([]);
    const [groupsJoined, setGroupsJoined] = useState([]);

    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [fetched, setFetched] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData(){
            let groups = await getGroupsByUserId()
            setGroupsCreated(groups.groupsCreated)
            setGroupsJoined(groups.groupsJoined)
            setFetched(true)
            // setGroups(
            //     await getGroupsByUserId()
            // )
        }
        if (!fetched) {
            fetchData()
        }
    }, [])

    const GroupElement = (par) => {
        return (
            <div>
                {par.name}
            </div>
        )
    }


    return (
        <>
        {fetched &&
        <div>
            <Navbar className="bg-body-tertiary justify-content-between">
                <Form>
                </Form>
                <Form>
                    <Col xs="auto" style={{margin: '0 20px'}}>
                    <Button variant="outline-danger" onClick={()=>{
                        logout()
                    }}>
                        Выйти из аккаунта
                    </Button>
                    </Col>
                </Form>
            </Navbar>

            <div className="groupsListBlock">
                <div className="groupsButtons">
                    <Button variant="primary" size="lg" style={{margin: '30px 0'}} onClick={() => {
                        setModalCreateShow(true)
                    }}>
                        Создать новую группу
                    </Button>
                    <Button variant="outline-primary" size="lg" style={{margin: '30px 0'}} onClick={() => {
                        setModalJoinShow(true)
                    }}>
                        Присоединиться к группе
                    </Button>
            </div>

                <div className="groupsText" style={{display: groupsCreated.length > 0 ? 'initial' : 'none'}}>Созданные Вами группы</div>
                <div className="groupsList">
                {/* <Card bg="primary" border="primary" style={{ width: '20rem', height: '14rem' }} 
                className='groupButton' onClick={() => setModalShow(true)}>
                    <PlusCircleFill width='80' height='80' color='rgba(255,255,255,0.65)'/>
                    <Card.Text style={{color: 'white'}}>
                    Создать группу
                    </Card.Text>
                </Card> */}
                {groupsCreated.map(group => {
                    // let admin = room.admin._id == user._id ? "Вы" : room.admin.name
                    return(
                    <Card style={{ width: '20rem', height: '14rem' }} key={group.id} 
                    onClick={() => navigate(`/group/${group.id}`)} className='groupCard'>
                        <Card.Body>
                            <Card.Title as="h3">{group.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Участников: {new Array(...group.participantsId).length}
                            </Card.Subtitle>
                            <Card.Text>{group.description}</Card.Text>
                        </Card.Body>
                    </Card>
                )})}
                </div>

                <div className="groupsText" 
                style={{paddingTop: '20px', display: groupsJoined.length > 0 ? 'initial' : 'none'}}>
                    Группы, в которых Вы состоите
                </div>
                <div className="groupsList">
                {groupsJoined.map(group => {
                    // let admin = room.admin._id == user._id ? "Вы" : room.admin.name
                    return(
                    <Card style={{ width: '20rem', height: '14rem' }} key={group.id} 
                    onClick={() => navigate(`/group/${group.id}`)} className='groupCard'>
                        <Card.Body>
                            <Card.Title as="h3">{group.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Участников: {new Array(...group.participantsId).length}
                            </Card.Subtitle>
                            <Card.Text>{group.description}</Card.Text>
                        </Card.Body>
                    </Card>
                )})}
                </div>
            </div>
            
            {/* <Button variant="outline-primary" style={{margin: '30px 0'}} onClick={() => {
                setModalCreateShow(true)
            }}>
                Создать новую группу
            </Button> */}

            <Modal
                show={modalCreateShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Создать новую группу
                </Modal.Title>
                <CloseButton onClick={() => setModalCreateShow(false)} />
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Название Вашей группы</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder=""
                        autoFocus
                        onChange={(e) => {
                            setNewGroupTitle(e.target.value)
                        }}
                    />
                    </Form.Group>
                    <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                    >
                    <Form.Label>Описание</Form.Label>
                    <Form.Control as="textarea" rows={3}
                        placeholder="Вы сможете отредактировать описание в настройках группы"
                        onChange={(e) => {
                            setNewGroupDescription(e.target.value)
                        }} />
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalCreateShow(false)}>Отмена</Button>
                <Button onClick={() => {
                    createGroup(newGroupTitle, newGroupDescription)
                }}>Создать</Button>
                </Modal.Footer>
            </Modal>


            <Modal
                show={modalJoinShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Присоединиться к группе
                </Modal.Title>
                <CloseButton onClick={() => setModalJoinShow(false)} />
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Шестизначный код</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder=""
                        autoFocus
                        onChange={(e) => {
                            setJoinCode(e.target.value)
                        }}
                    />
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalJoinShow(false)}>Отмена</Button>
                <Button onClick={async () => {
                    //варечка умница
                    try {
                    await joinGroupByCode(joinCode)
                    } catch (e) {
                        console.log('got', e)
                        setModalJoinShow(false)
                        setModalErrorShow(true)
                    }
                }}>Присоединиться</Button>
                </Modal.Footer>
            </Modal>


            <Modal
                show={modalErrorShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header 
                variant='danger'>
                <Modal.Title id="contained-modal-title-vcenter">
                    К сожалению, в данный момент невозможно присоединиться к группе
                </Modal.Title>
                <CloseButton onClick={() => modalErrorShow(false)} />
                </Modal.Header>
                <Modal.Footer>
                <Button variant='dark' onClick={ () => {setModalErrorShow(false)
                }}>Понятно</Button>
                </Modal.Footer>
            </Modal>

             {/* {groups.map((group, i) => 
                <GroupElement name={group.name} key={i} />
            )} */}
            </div>}
            {!fetched &&
            <Loading />}
        </>
    );
}


export default Groups;
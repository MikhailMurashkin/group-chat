import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './modules/AuthContext'
import { createGroup, getGroupsByUserId } from './modules/Api'

import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/esm/CloseButton'


const Groups = () => {

    // const handleMessage = async () => {
    //     try {
    //         let message = await getMessage("", "")
    //         console.log(message);
    //     } catch (error) {

    //     }
    // }
    const { login, user, logout } = useContext(AuthContext);
    const [modalShow, setModalShow] = useState(false);
    const [groups, setGroups] = useState([]);

    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');


    useEffect(() => {
        async function fetchData(){
            setGroups(
                await getGroupsByUserId(localStorage.getItem("token"))
            )
        }
        fetchData()
    }, [])

    const GroupElement = () => {
        return (
            <div>
                Group
            </div>
        )
    }


    return (
        <>
            <Navbar className="bg-body-tertiary justify-content-between">
                <Form>
                </Form>
                <Form>
                    <Col xs="auto" style={{margin: '0 20px'}}>
                    <Button variant="primary" onClick={()=>{
                        logout()
                    }}>
                        Log out
                    </Button>
                    </Col>
                </Form>
            </Navbar>
            
            <Button variant="outline-primary" style={{margin: '30px 0'}} onClick={() => {
                setModalShow(true)
            }}>
                Создать новую группу
            </Button>

            <Modal
                show={modalShow}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Создать новую группу
                </Modal.Title>
                <CloseButton onClick={() => setModalShow(false)} />
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Название вашей группы</Form.Label>
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
                <Button onClick={() => setModalShow(false)}>Отмена</Button>
                <Button onClick={() => {
                    createGroup(newGroupTitle, newGroupDescription,
                        localStorage.getItem('token'))
                }}>Создать</Button>
                </Modal.Footer>
            </Modal>

             {groups.map((group, i) => (<GroupElement key={i} />) ) }
             
        </>
    );
}


export default Groups;
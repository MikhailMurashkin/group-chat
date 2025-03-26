import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './modules/AuthContext';
import { getGroupInfoById } from './modules/Api';
import socket from './modules/socket'

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { ArrowLeft } from 'react-bootstrap-icons';

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
    const navigate = useNavigate();


    useEffect(() => {
        if (!fetched) {
            socket.connect()


            async function fetchData(){
                setGroupInfo(
                    await getGroupInfoById(groupId)
                )
                setFetched(true)
            }
            fetchData()
            
        }

        // socket.on('message', (msg) => {
        //     setResponse(msg)
        // })
    }, [])

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
            
            
            <input type='text' onChange={(e) => {
                setMessage(e.target.value)
            }}></input>
            <h1>Group #{groupId}</h1>
            <h1>Response: {response}</h1>
            {/* {user.email} */}

            {fetched &&
            <div className="groupPage">
                <div className="back" onClick={() => navigate('/groups')}>
                    <ArrowLeft size={24} />
                </div>
                <div className="groupsText">{groupInfo.name}</div>
                <div className="textBlock">
                    <div className="text">Создатель группы: {groupInfo?.participants[0].name}</div>
                    <div className="description">{groupInfo.description}</div>
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
        </>
    );
}

export default Group;
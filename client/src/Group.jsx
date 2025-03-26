import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './modules/AuthContext';
import { getGroupInfoById } from './modules/api';
import socket from './modules/socket'

import Button from 'react-bootstrap/Button';

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


    useEffect(() => {
        socket.connect()


        async function fetchData(){
            setGroupInfo(
                await getGroupInfoById(groupId)
            )
        }
        fetchData()

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
        </>
    );
}

export default Group;
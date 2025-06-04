import React, {useState} from "react";
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const Home = ()=>{
    const navigate = useNavigate();
    const[roomId, setRoomId] = useState('');
    const[username,setUsername] = useState('');

    const createNewRoom = (e)=>{
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created new room');
    }

    const joinRoom = ()=>{
        if(!roomId || !username){
            toast.error('Room ID & Username is required');
            return;
        }
        console.log('Joining room with ID:', roomId, 'and username:', username);
        //Redirect
        navigate(`/editor/${roomId}`,{
            state:{
                username
            }
        })

    }

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img src="src\assets\peerPREPlogomain.png" alt="peerPREP-logo" className="homePageLogo" />
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input type="text" className="inputBox" placeholder='Enter ROOM ID' onChange={(e)=>{setRoomId(e.target.value)}} value={roomId}/>
                    <input type="text" className="inputBox" placeholder='Enter Name' onChange={(e)=>{setUsername(e.target.value)}} value={username}/>
                    <button className="btn joinBtn" onClick={joinRoom} disabled={!roomId || !username}>Join</button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp; 
                        <a onClick={createNewRoom} href="#" className="createNewBtn">New room</a>
                    </span>
                </div>
                

            </div>
            <footer>
                <h4>Built with 💙 by &nbsp; <a href="https://github.com/Aditya-Kumar-Gautam">Aditya</a></h4>
            </footer>
        </div>
    )
}

export default Home;
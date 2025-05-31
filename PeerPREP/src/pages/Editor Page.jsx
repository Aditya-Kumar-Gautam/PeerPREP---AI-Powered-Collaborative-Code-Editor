import React,{useState} from "react";

const Editor = ()=>{
    const[clients, setClients] = useState([
        {socketId:1, username: 'Aditya'},
        {socketId:2, username: 'same'},
    ]);

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInnter">
                    <div className="logo">
                        <img src="/src/assets/peerPREPlogomain.png" alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clienstList">
                        {
                            clients.map(client => (
                                <Client key={client.socketId} username={client.username} />
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="editorWrap">Editor goes here..</div>

        </div>
    )
}

export default Editor;
import {io} from 'socket.io-client';

let socket=null;

export const initSocket = async() =>{
    // const options={
    //     'force new connection': false,
    //     reconnectionAttempts: 'Infinity',
    //     timeout: 10000, // in milliseconds
    //     transports: ['websocket'],
    // };
    // // return io(process.env.REACT_APP_BACKEND_URL, options);
    // return io(import.meta.env.VITE_BACKEND_URL, options);



    
    //Experimental
    if (!socket) {
        const options = {
            'force new connection': false,
            reconnectionAttempts: 'Infinity',
            timeout: 10000,
            transports: ['websocket'],
        };
        socket = io(import.meta.env.VITE_BACKEND_URL, options);
    }
    return socket;

}
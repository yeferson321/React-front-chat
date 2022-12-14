import { useState, useEffect, useContext } from "react"
import io from 'socket.io-client';
import { DataContext } from '../../context/DataContext';

export const useForm = () => {

    const socket = io("https://chat-node-expres.herokuapp.com", {
       maxHttpBufferSize: 1000e8
    })
    // const socket = io("http://localhost:5000", {
    //     maxHttpBufferSize: 1000e8
    // })

    const { setContextMessageText } = useContext(DataContext);
    const [messageText, setMessageText] = useState('');
    const [messagesText, setMessagesText] = useState([]);
    const [file, setFile] = useState('');

    setContextMessageText(messagesText)

    const filesSelect = (e) => {
        setFile(
            {
                file: e.target.files[0],
                type: e.target.files[0].type,
                name: e.target.files[0].name,
                size: e.target.files[0].size
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (file) {
            const messageObject = {
                body: file.file,
                type: "file",
                mimeType: file.type,
                name: file.name,
                from: "You"
            }
            setMessagesText([...messagesText, messageObject])
            setMessageText("");
            setFile("");

            socket.emit("messageText", messageObject);

        } else {
            const messageObject = {
                body: messageText,
                type: "text",
                from: "You"
            }
            setMessagesText([...messagesText, messageObject])
            setMessageText("");

            socket.emit("messageText", messageObject);

        }
    }

    useEffect(() => {

        const receiveMessage = messageText => {
            setMessagesText([...messagesText, messageText])
        };

        socket.on('message', receiveMessage)

        return () => {
            socket.off('message', receiveMessage)
        }

    }, [messagesText, messageText, socket])

    return { messageText, filesSelect, setMessageText, handleSubmit }

}

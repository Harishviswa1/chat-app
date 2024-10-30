import React, { useEffect, useState, useRef } from 'react';
import "./Chat.css";
import avatar from "../../assets/avatar.png"; 
import phone from "../../assets/phone.png";
import video from "../../assets/video.png";
import info from "../../assets/info.png";
import emoji from "../../assets/emoji.png";
import camera from "../../assets/camera.png";
import mic from "../../assets/mic.png";
import EmojiPicker from "emoji-picker-react";
import { auth, db, storage } from "../lib/firebase";  
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import required functions
import { useUserStore } from '../lib/userStore';
import { useChatStore } from '../lib/chatStore';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const { currentUser } = useUserStore();
  const { user, chatId, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const endRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    
    recorder.ondataavailable = (event) => {
        setAudioBlob(event.data);
    };

    recorder.onstop = () => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
};

const stopRecording = () => {
    mediaRecorder.stop();
};

const uploadAudio = async (audioBlob) => {
  const storageRef = ref(storage, `audio/${Date.now()}.webm`);
  await uploadBytes(storageRef, audioBlob);
  return await getDownloadURL(storageRef);
};

const handleSend = async () => {
  if (text === "" && !audioBlob) return; // Ensure there's something to send

  let imgUrl = null;
  let audioUrl = null;

  try {
      if (img.file) {
          imgUrl = await upload(img.file);
      }

      if (audioBlob) {
          audioUrl = await uploadAudio(audioBlob); // Call the defined uploadAudio function
      }

      const timestamp = new Date();

      await updateDoc(doc(db, 'chats', chatId), {
          messages: arrayUnion({
              senderId: currentUser.id,
              text,
              createdAt: timestamp,
              ...(imgUrl && { img: imgUrl }),
              ...(audioUrl && { audio: audioUrl }), // Include audio URL
              timestamp: timestamp.toISOString(),
          })
      });

      // Reset state after sending
      setImg({ file: null, url: "" });
      setText("");
      setAudioBlob(null); // Reset the audio blob
  } catch (error) {
      console.log(error);
  }
};


useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, []);

useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
    });

    return () => {
        unSub();
    };
}, [chatId]);

const handleImage = (e) => {
    if (e.target.files[0]) {
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0]),
        });
    }
};

const handleEmoji = e => {
    setText(prev => prev + e.emoji);
    setOpen(false);
};

const defaultAvatar = isCurrentUserBlocked || isReceiverBlocked ? avatar : user?.avatar;
const defaultUsername = isCurrentUserBlocked || isReceiverBlocked ? "User" : user?.username;

return (
    <div className="chat"> 
        <div className='top'>
            <div className='user'>
                <img src={defaultAvatar} alt="User Avatar" />
                <div className='texts'>
                    <span>{defaultUsername}</span>
                    <p>Lorem ipsum dolor sit amet.</p>
                </div>
            </div>
            {/* <div className='icons'>
                <img src={phone} alt="Phone" />
                <img src={video} alt="Video" />
                <img src={info} alt="Info" />
            </div> */}
        </div>

        <div className='center'>
        {chat?.messages?.map((message) => (
    <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message?.createdAt}>
        <div className="texts">
            {message.img && <img src={message.img} alt="Message" />}
            <p>{message.text}</p>
            {message.audio && <audio controls src={message.audio}></audio>} {/* Add this line */}
            <span className="timestamp">{new Date(message.timestamp).toLocaleString()}</span>
        </div>
    </div>
))}

            {img.url && (
                <div className='message own'>
                    <div className='texts'>
                        <img src={img.url} alt="Uploaded" />
                    </div>
                </div>
            )}
            <div ref={endRef}></div>
        </div>

        <div className='bottom'>
            <div className="icons">
                <label htmlFor="file">
                    <img src={camera} alt="Attach" />
                </label>
                <input type="file" id="file" style={{ display: "none" }} onChange={handleImage} />
                <img 
                    src={mic} 
                    alt="Microphone" 
                    onClick={isRecording ? stopRecording : startRecording} 
                    style={{ cursor: 'pointer' }} 
                />
            </div>
            <input 
                type="text" 
                placeholder='Type a message' 
                value={text} 
                onChange={e => setText(e.target.value)} 
            />
            <div className="emoji">
                <img src={emoji} alt="Emoji" onClick={() => setOpen(prev => !prev)} />
                <div className="picker">
                    <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                </div>
            </div>
            <button 
                className={`sendbutton ${isCurrentUserBlocked || isReceiverBlocked ? 'disabled' : ''}`} 
                onClick={handleSend} 
                disabled={isCurrentUserBlocked || isReceiverBlocked}
            >
                Send
            </button>
        </div>

    </div>
  );
}

export default Chat;

import React, { useEffect, useState } from 'react'
import "./ChatList.css"
import avatar from "../../assets/avatar.png";
import Search from "../../assets/search.png";
import plus from "../../assets/plus.png";
import minus from "../../assets/minus.png"
import AddUser from './adduser/AddUser';
import { auth, db } from "../lib/firebase.js";  
import { useUserStore } from '../lib/userStore.js';
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { useChatStore } from '../lib/chatStore.js';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();
  const [input,setInput]=useState([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (res.exists()) {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.recieverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        setChats([]); 
      }
    });

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats=chats.map(item=>{
      const {user,...rest}=item;
      return rest;
    })

    const chatIndex=userChats.findIndex(item=>item.chatId===chat.chatId);

    userChats[chatIndex].isSeen=true;

    const userChatRef=

    changeChat(chat.chatId, chat.user);
  };

  // const filteredChats=chats.filter((c)=>c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src={Search} alt="" />
          <input type="text" placeholder="Search" onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img
          src={addMode ? minus : plus}
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.map((chat) => (
        <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}style={{backgroundColor:chat?.isSeen ? "transparent":"#5183fe"}}>
          <img src={chat.user.avatar || avatar} alt="" />
          <div className="texts">
            <span>
              <p>{chat.user.blocked.includes(currentUser.id)?"User":chat.user.username}</p>
            </span>
            <span>
              <p>{chat.lastMessage}</p>
            </span>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
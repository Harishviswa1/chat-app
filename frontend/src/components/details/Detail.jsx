import React from 'react';
import "./Detail.css";
import avatar from "../../assets/avatar.png";
import { auth } from '../lib/firebase';
import { useUserStore } from '../lib/userStore';
import { useChatStore } from '../lib/chatStore';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
   if (!user || !currentUser) return;
 
   const userDocRef = doc(db, "users", currentUser.id);
   try {
     await updateDoc(userDocRef, {
       blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
     });
     
     changeBlock();

     changeChat(chatId, user);
   } catch (error) {
     console.error("Error blocking/unblocking user:", error);
   }
 };
 
 const profile=isCurrentUserBlocked || isReceiverBlocked ? avatar : user?.avatar;
 const name=isCurrentUserBlocked || isReceiverBlocked ? "Username" : user?.username;

  return (
    <div className='detail'> 
      <div className="user">
        <img src={profile} alt="User Avatar" />
        <h2>{name}</h2>
      </div>
      <div className="info">
        <button onClick={handleBlock}>
          {isCurrentUserBlocked ? "You are Blocked" : isReceiverBlocked ? "Unblock User" : "Block User"}
        </button>
        <button className='logout' onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;

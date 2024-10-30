import React, { useState } from 'react';
import "./AddUser.css";
import Avatar from "../../../assets/avatar.png";
import { arrayUnion, collection, doc, getDocs, getDoc,query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';

const AddUser = () => {
   const [user, setUser] = useState(null);
   const {currentUser} = useUserStore();

   const handleSearch = async(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const username = formData.get("username");

      try {
         const userRef = collection(db, "users");
         const q = query(userRef, where("username", "==", username));
         const querySnapshot = await getDocs(q);

         if (!querySnapshot.empty) {
            setUser(querySnapshot.docs[0].data());
         } else {
            console.log("No user found");
         }

      } catch (error) {
         console.log(error);
      }
   };

   const handleAdd = async () => {
      const chatRef = collection(db, "chats");
      const userChatRef = collection(db, "userchats");
    
      try {
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });
    
        // Check if the user chat document exists for the other user
        const userChatDoc = doc(userChatRef, user.id);
        const userChatSnap = await getDoc(userChatDoc);
    
        if (!userChatSnap.exists()) {
          await setDoc(userChatDoc, { chats: [] });
        }
    
        // Update the user chat document
        await updateDoc(userChatDoc, {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            recieverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        });
    
        // Check if the user chat document exists for the current user
        const currentUserChatDoc = doc(userChatRef, currentUser.id);
        const currentUserChatSnap = await getDoc(currentUserChatDoc);
    
        if (!currentUserChatSnap.exists()) {
          await setDoc(currentUserChatDoc, { chats: [] });
        }
    
        await updateDoc(currentUserChatDoc, {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            recieverId: user.id,
            updatedAt: Date.now(),
          }),
        });
    
        console.log("Chat added with ID: ", newChatRef.id);
      } catch (error) {
        console.log("Error adding user: ", error);
      }
    };
    


   return (
      <div className='adduser'>
         <form onSubmit={handleSearch}>
            <input type="text" placeholder='Username' name='username' /> 
            <button>Search</button>
         </form>
         {user && <div className="user">
            <div className="detail">
               <img src={user.avatar || Avatar} alt="" />
               <span>{user.username}</span> 
            </div>
            <button onClick={handleAdd}>Add User</button>
         </div>}
      </div>
   );
};

export default AddUser;

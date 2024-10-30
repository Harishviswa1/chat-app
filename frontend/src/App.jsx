import React, { useEffect } from 'react';
import List from "./components/List/List.jsx";
import Detail from "./components/details/Detail.jsx";
import Chat from "./components/chat/Chat.jsx";
import Login from './components/login/Login.jsx';
import Notification from './components/notification/notification.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/lib/firebase.js';
import { useUserStore } from './components/lib/userStore.js';
import { useChatStore } from './components/lib/chatStore.js';

const App = () => {
  const {currentUser,isLoading,fetchUserInfo} =useUserStore();
  const{chatId}=useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserInfo(user.uid); 
      } else {
        fetchUserInfo(null);
      }
    });
  
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  

  if(isLoading)return<div className='loading'>Loading</div>

  return (
    <div className='container'>
      {currentUser ?(
          <>
            {<List/>}
            {chatId && <Chat/>} 
            {chatId && <Detail/>}
          </>
        ) : (
        <Login/>
      )}
      <Notification/>
    </div>
  )
}

export default App;

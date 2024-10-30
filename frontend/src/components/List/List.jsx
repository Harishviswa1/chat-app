import React from 'react'
import './List.css';
import UserInfo from '../userinfo/userinfo';
import ChatList from '../chatlist/chatList.jsx';


const List = () => {
  return (
    <div className='list'>
       <UserInfo/>
       <ChatList/>
    </div>
  )
}

export default List;

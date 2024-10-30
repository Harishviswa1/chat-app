import React from 'react'
import "./UserInfo.css";
import avatar from '../../assets/avatar.png';
import moreIcon from '../../assets/more.png';
import videoIcon from '../../assets/video.png';
import editIcon from '../../assets/edit.png';
import { useUserStore } from '../lib/userStore';

const UserInfo = () => {

  const {currentUser} =useUserStore();

  return (
    <div className='userinfo'>
      <div className='user'>
        <img src={currentUser.avatar || avatar} alt='profile-pic'/> 
        <h2>{currentUser.username}</h2>
      </div>
        {/* <div className='icons'>
          <img src={moreIcon} alt=""/>
          <img src={videoIcon} alt=""/>
          <img src={editIcon} alt=""/>
        </div> */}
    </div>
  )
}


export default UserInfo;

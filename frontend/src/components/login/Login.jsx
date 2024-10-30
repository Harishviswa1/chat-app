import React, { useState } from 'react';
import Avatar from "../../assets/avatar.png";
import { toast } from 'react-toastify';
import "./login.css";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase.js";
import { doc, setDoc } from 'firebase/firestore';
import { upload } from '../lib/upload.js';
import { useUserStore } from '../lib/userStore.js'; // Import the user store

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });
    
    const { fetchUserInfo } = useUserStore(); // Access fetchUserInfo from the store

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);
            await fetchUserInfo(userCredential.user.uid); // Set currentUser globally
            toast.success("User Signed in");
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        if (!avatar.file) {
            toast.error("Please select an avatar");
            setLoading(false);
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });

            await fetchUserInfo(res.user.uid); // Set currentUser globally
            toast.success("Account created! You can login now");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login'>
            <div className='item'>
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder='Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading}>Sign In</button>
                </form>
            </div>
            <div className='separator'></div>
            <div className='item'>
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || Avatar} alt="" />
                        Upload an image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name='username' />
                    <input type="text" placeholder='Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;

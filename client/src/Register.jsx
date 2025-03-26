import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './modules/AuthContext';

import Button from 'react-bootstrap/Button';

const Login = () => {
    const [name, setName] = useState('Varya');
    const [email, setEmail] = useState('varya@email.com');
    const [password, setPassword] = useState('password');
    const [inputColor, setInputColor] = useState('grey');
    const [checked, setChecked] = useState(false);
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!checked) {
        if(localStorage.getItem('token')) {
          navigate('/groups')
        }
        setChecked(true)
      }
    })
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = await register(name, email, password);
      } catch (error) {
        console.error('Login error:', error.message);
        setInputColor('red')
      }
    };
  
    return (
        <form onSubmit={handleSubmit}>
            <div className="loginForm">
                <div className="title">Регистрация</div>
                <div className="inputs">
                <input className="basicInput" type="text" placeholder="Имя пользователя" value={name} style={{borderColor: inputColor}} onFocus={() => setInputColor('grey')} onChange={(e) => setName(e.target.value)} required />
                <input className="basicInput" type="email" placeholder="Email" value={email} style={{borderColor: inputColor}} onFocus={() => setInputColor('grey')} onChange={(e) => setEmail(e.target.value)} required />
                <input className="basicInput" type="password" placeholder="Пароль" value={password} style={{borderColor: inputColor}} onFocus={() => setInputColor('grey')} onChange={(e) => setPassword(e.target.value)} required />
                <Button className="basicButton" type="submit">Зарегистрироваться</Button>
                <Button variant='link' onClick={() => navigate('/login')}>Есть аккаунт? Войдите</Button>
                </div>
            </div>
        </form>
    );
  };

export default Login;
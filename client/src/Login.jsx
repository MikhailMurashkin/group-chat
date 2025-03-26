import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './modules/AuthContext';

import Button from 'react-bootstrap/Button';

const Login = () => {
    const [email, setEmail] = useState('varya@email.com');
    const [password, setPassword] = useState('password');
    const [checked, setChecked] = useState(false);
    const [inputColor, setInputColor] = useState('grey');
    const { login, user } = useContext(AuthContext);
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
        const data = await login(email, password);
      } catch (error) {
        console.error('Login error:', error.message);
        setInputColor('red')
      }
    };
  
    return (
        <form onSubmit={handleSubmit}>
            <div className="loginForm">
                <div className="title">Вход в аккаунт</div>
                <div className="inputs">
                <input className="basicInput" type="email" placeholder="Email" value={email} style={{borderColor: inputColor}} onFocus={() => setInputColor('grey')} onChange={(e) => setEmail(e.target.value)} required />
                <input className="basicInput" type="password" placeholder="Пароль" value={password} style={{borderColor: inputColor}} onFocus={() => setInputColor('grey')} onChange={(e) => setPassword(e.target.value)} required />
                <Button className="basicButton" type="submit">Войти</Button>
                <Button variant='link' onClick={() => navigate('/register')}>Нет аккаунта? Зарегистрируйтесь</Button>
                </div>
            </div>
        </form>
    );
  };

export default Login;
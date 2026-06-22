import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api'; // เช็คไฟล์นี้ให้ชัวร์ว่าไม่มี / เกินมา
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 🟢 แก้ไขบรรทัดนี้ให้ตรงกับ Backend: /api/auth/login
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      localStorage.setItem('token', res.data.token);
      Swal.fire('สำเร็จ', 'เข้าสู่ระบบแล้ว', 'success').then(() => navigate('/menu'));
    } catch (err) {
      console.error(err);
      Swal.fire('ไม่สำเร็จ', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
        <input className="w-full p-3 border rounded-lg mb-4" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full p-3 border rounded-lg mb-6" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}
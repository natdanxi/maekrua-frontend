import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';
import { ChevronLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setIsSubmitting(true);
    try {
      // 🟢 จุดเชื่อมต่อ: ยิงไปที่ /api/orders ให้ตรงกับที่ตั้งไว้ใน server.js
      await axios.post(`${API_URL}/api/orders`, {
        items: cartItems,
        totalPrice: totalPrice,
        paymentMethod: 'transfer'
      }, { headers: { Authorization: `Bearer ${token}` } });

      localStorage.removeItem('cart');
      Swal.fire('สำเร็จ', 'ส่งออเดอร์แล้ว', 'success').then(() => navigate('/status'));
    } catch (err) {
      console.error(err);
      Swal.fire('ผิดพลาด', 'สั่งซื้อไม่สำเร็จ (เช็ค API Route)', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="p-4 bg-white border-b flex items-center">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24}/></button>
        <h1 className="font-bold ml-2">ตะกร้าของฉัน</h1>
      </div>
      <div className="max-w-md mx-auto p-4">
        {cartItems.map((item, i) => (
          <div key={i} className="bg-white p-3 rounded-lg mb-2 flex justify-between shadow-sm">
            <span>{item.title} x {item.quantity}</span>
            <span>฿{item.price * item.quantity}</span>
          </div>
        ))}
        <button onClick={confirmOrder} disabled={isSubmitting} className="w-full bg-orange-600 text-white py-3 rounded-lg mt-4 font-bold">
          {isSubmitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
        </button>
      </div>
    </div>
  );
}
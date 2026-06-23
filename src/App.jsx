// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🟢 นำเข้าหน้าของ User
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/User/Menu';
import Cart from './pages/User/Cart';
import History from './pages/User/History';
import OrderStatus from './pages/User/OrderStatus';
import Profile from './pages/User/Profile';

// 🟢 นำเข้าหน้าของ Admin ทั้งหมดให้ครบ!
import AdminOrders from './pages/Admin/index'; // หน้าร้าน POS
import AdminHome from './pages/Admin/Home/index'; // หน้าแดชบอร์ด
import MenuManagement from './pages/Admin/MenuManagement'; // หน้าจัดการเมนู
import Customers from './pages/Admin/Customers'; // หน้าข้อมูลลูกค้า
import Settings from './pages/Admin/Settings'; // หน้าตั้งค่าร้านค้า

export default function App() {
  return (
    <Router>
      <Routes>
        {/* เส้นทางทั่วไป */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* เส้นทางของลูกค้า (User) */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/history" element={<History />} />
        <Route path="/status" element={<OrderStatus />} />
        <Route path="/profile" element={<Profile />} />

        {/* 🟢 เส้นทางของแอดมิน (Admin) ที่คุณต้องเติมให้ครบ! */}
        <Route path="/admin" element={<AdminOrders />} /> 
        <Route path="/admin/home" element={<AdminHome />} /> 
        <Route path="/admin/menu-management" element={<MenuManagement />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
export default App;
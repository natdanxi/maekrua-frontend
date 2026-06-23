import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 🟢 นำเข้าไฟล์หน้า User
import Login from './pages/Login'; 
import Register from './pages/Register';
import Menu from './pages/User/Menu';
import Cart from './pages/User/Cart';
import History from './pages/User/History';
import OrderStatus from './pages/User/OrderStatus';
import Profile from './pages/User/Profile';

// 🟢 นำเข้าไฟล์หน้า Admin
import AdminOrders from './pages/Admin/index'; 
import AdminHome from './pages/Admin/Home/index'; 
import MenuManagement from './pages/Admin/MenuManagement'; 
import Customers from './pages/Admin/Customers'; 
import Settings from './pages/Admin/Settings'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- โซนลูกค้า (User) --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/history" element={<History />} />
        <Route path="/status" element={<OrderStatus />} />
        <Route path="/profile" element={<Profile />} />

        {/* --- 🟢 โซนผู้ดูแลระบบ (Admin) เติมให้ครบตรงนี้ครับ! --- */}
        <Route path="/admin" element={<AdminOrders />} />
        <Route path="/admin/dashboard" element={<AdminHome />} /> {/* 👈 ตัวแก้ปัญหาหน้าขาว */}
        <Route path="/admin/menu-management" element={<MenuManagement />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
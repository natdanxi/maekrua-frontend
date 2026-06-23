import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Clock, Phone, MapPin, X, Info, Menu, ShoppingCart, User, ClipboardList, LogOut, ChevronRight, ShoppingBag, LayoutDashboard, Utensils, Users, Settings } from 'lucide-react';
import { API_URL } from '../api'; 
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [shopStatus, setShopStatus] = useState({ isOpenNow: false, reason: '' });
  const [showShopModal, setShowShopModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const isAdmin = window.location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/shop`);
        const shop = res.data || {};
        setShopInfo(shop);
        
        const isCurrentlyOpen = shop.isOpen === true || String(shop.isOpen) === 'true';

        setShopStatus({
          isOpenNow: isCurrentlyOpen,
          reason: isCurrentlyOpen ? '' : 'แอดมินปิดรับออเดอร์ชั่วคราว'
        });
      } catch (err) { console.error("Failed to fetch shop status:", err); }
    };

    const fetchUserInfo = async () => {
      if (isLoggedIn) {
        try {
          const res = await axios.get(`${API_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
          setUserInfo(res.data);
        } catch (err) { console.error("Failed to fetch user:", err); }
      }
    };
  
    fetchShopInfo();
    fetchUserInfo();
    const interval = setInterval(fetchShopInfo, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  const handleLogout = () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ")) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const handleNav = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="bg-white h-[76px] px-4 md:px-8 flex justify-between items-center shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95 relative z-50 cursor-pointer">
            <Menu size={24} />
          </button>
          
          <button onClick={() => setShowShopModal(true)} className="flex items-center gap-1.5 md:gap-2.5 text-left hover:opacity-70 transition-all active:scale-95 group focus:outline-none">
            <h1 className="text-[18px] md:text-[22px] font-black text-gray-900 tracking-tight line-clamp-1 max-w-[120px] md:max-w-none">{shopInfo?.name || 'แม่ครัวตัวกลม'}</h1>
            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-500 transition-colors shrink-0"><Info size={12} className="text-gray-400 group-hover:text-orange-500" /></div>
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button onClick={() => isLoggedIn ? setShowProfileModal(true) : navigate('/login')} className="flex items-center gap-2 md:gap-3 bg-orange-50/50 hover:bg-orange-50 py-1.5 px-3 md:px-4 rounded-full border border-orange-100 transition-colors cursor-pointer relative z-50">
             <div className="w-7 h-7 md:w-8 md:h-8 text-orange-600 rounded-full flex items-center justify-center shrink-0 border border-orange-200 bg-white">
                <User size={16} strokeWidth={2.5} />
             </div>
             <div className="text-left pr-1 md:pr-2 leading-none hidden sm:block">
                <p className="text-[14px] md:text-[15px] font-black text-gray-900 tracking-tight">{isLoggedIn ? (userInfo?.firstname || 'User') : 'Guest'}</p>
                <p className="text-[10px] md:text-[11px] font-bold text-gray-500 mt-0.5 whitespace-nowrap">{isAdmin ? 'ผู้ดูแลระบบ' : (isLoggedIn ? 'สมาชิกทั่วไป' : 'ผู้เยี่ยมชม')}</p>
             </div>
          </button>
          
          {isLoggedIn && !isAdmin && (
            <button onClick={() => handleNav('/cart')} className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-full flex items-center justify-center transition-colors relative active:scale-95 shrink-0 border border-orange-100 z-50">
              <ShoppingCart size={20} />
              <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          )}
        </div>
      </nav>

      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`p-6 pb-8 relative flex flex-col items-center pt-12 ${isAdmin ? 'bg-slate-800' : 'bg-[#141b2d]'}`}>
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20"><X size={24} /></button>
          <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center text-orange-600 mb-4 shadow-md"><User size={36} strokeWidth={2.5} /></div>
          <h2 className="text-[20px] font-bold text-white leading-tight">{isLoggedIn ? `${userInfo?.firstname || 'User'} ${userInfo?.lastname || ''}` : 'ยินดีต้อนรับ'}</h2>
          <p className="text-[13px] text-gray-300 mt-1">{isLoggedIn ? userInfo?.email : 'กรุณาเข้าสู่ระบบเพื่อสั่งอาหาร'}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isAdmin ? (
            <>
              <button onClick={() => handleNav('/admin/dashboard')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-slate-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><LayoutDashboard size={20} className="text-gray-500" /><span className="font-bold text-[15px]">แดชบอร์ด</span></div><ChevronRight size={16} className="text-gray-300" /></button>
              <button onClick={() => handleNav('/admin')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-slate-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><Store size={20} className="text-gray-500" /><span className="font-bold text-[15px]">หน้าร้าน (POS)</span></div><ChevronRight size={16} className="text-gray-300" /></button>
              <button onClick={() => handleNav('/admin/menu-management')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-slate-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><Utensils size={20} className="text-gray-500" /><span className="font-bold text-[15px]">จัดการเมนูอาหาร</span></div><ChevronRight size={16} className="text-gray-300" /></button>
              <button onClick={() => handleNav('/admin/customers')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-slate-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><Users size={20} className="text-gray-500" /><span className="font-bold text-[15px]">ข้อมูลลูกค้า</span></div><ChevronRight size={16} className="text-gray-300" /></button>
              <button onClick={() => handleNav('/admin/settings')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-slate-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><Settings size={20} className="text-gray-500" /><span className="font-bold text-[15px]">ตั้งค่าร้านค้า</span></div><ChevronRight size={16} className="text-gray-300" /></button>
            </>
          ) : (
            <>
              <button onClick={() => handleNav('/menu')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><ShoppingBag size={20} className="text-gray-500" /><span className="font-bold text-[15px]">เมนูอาหาร</span></div><ChevronRight size={16} className="text-gray-300" /></button>
              {isLoggedIn && (
                <>
                  <button onClick={() => handleNav('/status')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><Clock size={20} className="text-gray-500" /><span className="font-bold text-[15px]">สถานะออเดอร์ (วันนี้)</span></div><ChevronRight size={16} className="text-gray-300" /></button>
                  <button onClick={() => handleNav('/history')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><ClipboardList size={20} className="text-gray-500" /><span className="font-bold text-[15px]">ประวัติการสั่งซื้อ</span></div><ChevronRight size={16} className="text-gray-300" /></button>
                  <button onClick={() => handleNav('/profile')} className="w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"><div className="flex items-center gap-4"><User size={20} className="text-gray-500" /><span className="font-bold text-[15px]">แก้ไขข้อมูลส่วนตัว</span></div><ChevronRight size={16} className="text-gray-300" /></button>
                </>
              )}
            </>
          )}
        </div>

        <div className="p-6">
          <button onClick={handleLogout} className={`flex items-center gap-3 font-bold text-[15px] transition-colors w-full text-left group ${isLoggedIn ? 'text-red-500 hover:text-red-600' : 'text-[#ea580c] hover:text-orange-700'}`}>
            <LogOut size={20} className={isLoggedIn ? "" : "rotate-180"} />{isLoggedIn ? 'ออกจากระบบ' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>

      {/* Profile & Shop Modals keep as is */}
    </>
  );
};

export default Navbar;
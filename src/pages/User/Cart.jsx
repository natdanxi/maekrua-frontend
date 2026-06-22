import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';
import { ChevronLeft, Trash2, Minus, Plus, CreditCard, Banknote, Edit3, X, QrCode, Upload, Receipt, Loader2, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';

const ADDONS_LIST = [
  { name: 'ไข่ดาว', price: 5 }, { name: 'ไข่เจียว', price: 5 },
  { name: 'พิเศษ', price: 5 }, { name: 'เพิ่มข้าว', price: 5 }
];

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editAddons, setEditAddons] = useState([]);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const confirmOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อน', 'warning');
        return navigate('/login');
    }

    if (cartItems.length === 0) {
        return Swal.fire('ตะกร้าว่าง', 'กรุณาเลือกสินค้าก่อนสั่งซื้อ', 'warning');
    }

    setIsSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const formattedItems = cartItems.map(item => ({
        product_id: item.product_id || item.id,
        price: item.price,
        quantity: item.quantity,
        note: item.note || ''
      }));

      // ส่งเป็น JSON ตามที่ Backend รอรับอยู่
      const jsonPayload = {
        items: formattedItems,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        orderType: 'online',
        note: cartItems.map(i => i.note).filter(Boolean).join(' | ')
      };

      await axios.post(`${API_URL}/api/orders`, jsonPayload, { headers });
      
      localStorage.removeItem('cart');
      setShowPaymentModal(false);
      setCartItems([]);
      Swal.fire('สำเร็จ', 'ส่งออเดอร์เรียบร้อยแล้ว', 'success').then(() => navigate('/status'));

    } catch (err) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถสั่งซื้อได้', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-10 mt-20">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-500">ตะกร้าว่างเปล่า</h2>
        <button onClick={() => navigate('/menu')} className="mt-6 bg-[#ea580c] text-white px-8 py-3 rounded-xl font-bold">เลือกเมนูอาหาร</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />
      <div className="bg-white p-4 border-b flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24}/></button>
        <h1 className="font-bold ml-2">ตะกร้าของฉัน</h1>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {cartItems.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl flex gap-4">
             <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                {item.image && <img src={`${API_URL}/uploads/${item.image}`} className="w-full h-full object-cover" alt="" />}
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-orange-600 font-bold">฿{item.price * item.quantity}</p>
                <div className="flex items-center gap-2 mt-2">
                   <button onClick={() => { const nc=[...cartItems]; if(nc[idx].quantity>1) nc[idx].quantity--; saveCart(nc); }} className="p-1 border rounded"><Minus size={14}/></button>
                   <span className="font-bold">{item.quantity}</span>
                   <button onClick={() => { const nc=[...cartItems]; nc[idx].quantity++; saveCart(nc); }} className="p-1 border rounded"><Plus size={14}/></button>
                   <button onClick={() => { saveCart(cartItems.filter((_,i)=>i!==idx)); }} className="ml-auto text-red-500"><Trash2 size={16}/></button>
                </div>
             </div>
          </div>
        ))}

        <div className="bg-white p-4 rounded-xl mt-4">
            <h3 className="font-bold mb-3">วิธีการชำระเงิน</h3>
            <div className="flex gap-2">
                <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 p-3 border rounded-xl ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50' : ''}`}>โอนจ่าย</button>
                <button onClick={() => setPaymentMethod('cash')} className={`flex-1 p-3 border rounded-xl ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : ''}`}>เงินสด</button>
            </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
            <p className="text-xl font-bold text-orange-600">รวม: ฿{totalPrice}</p>
            <button onClick={confirmOrder} disabled={isSubmitting} className="bg-[#ea580c] text-white px-8 py-3 rounded-xl font-bold">
                {isSubmitting ? <Loader2 className="animate-spin"/> : "ยืนยันสั่งซื้อ"}
            </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import { ShoppingCart, Star, Flame, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserMenu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [shopConfig, setShopConfig] = useState({ openTime: '08:30', closeTime: '16:00', isOpen: true });
  const [isStoreOpenNow, setIsStoreOpenNow] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, shopRes] = await Promise.all([
          axios.get(`${API_URL}/api/product`),
          axios.get(`${API_URL}/api/category`),
          axios.get(`${API_URL}/api/shop/status`)
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        
        // ดึงโครงสร้างข้อมูลร้านค้า
        const open = shopRes.data.openTime || '08:30';
        const close = shopRes.data.closeTime || '16:00';
        const manualStatus = shopRes.data.isOpenNow ?? shopRes.data.isOpen ?? true;
        
        setShopConfig({ openTime: open, closeTime: close, isOpen: manualStatus });
        
        // คำนวณเวลาไทย GMT+7 ทันที
        checkRealTimeShopStatus(open, close, manualStatus);
      } catch (err) {
        console.error("Error fetching menu data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟢 ฟังก์ชันคำนวณเวลาประเทศไทย (GMT+7) ป้องกันบั๊กเวลาเซิร์ฟเวอร์นอก
  const checkRealTimeShopStatus = (openTime, closeTime, manualStatus) => {
    if (!manualStatus) {
      setIsStoreOpenNow(false);
      return;
    }

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const thailandTime = new Date(utc + (3600000 * 7)); // ปรับเป็นเวลาไทย
    const currentMinutes = thailandTime.getHours() * 60 + thailandTime.getMinutes();

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes < openMinutes) {
      setIsStoreOpenNow(currentMinutes >= openMinutes || currentMinutes <= closeMinutes);
    } else {
      setIsStoreOpenNow(currentMinutes >= openMinutes && currentMinutes <= closeMinutes);
    }
  };

  const handleAddToCart = (product) => {
    if (!isStoreOpenNow) {
      Swal.fire({
        icon: 'error',
        title: 'ร้านปิดให้บริการ',
        text: `ขออภัยค่ะ ไม่สามารถสั่งอาหารได้ในขณะนี้ (เวลาทำการ: ${shopConfig.openTime} - ${shopConfig.closeTime} น.)`,
        confirmButtonColor: '#ea580c'
      });
      return;
    }
    
    // โค้ดสำหรับดึงของลงตะกร้าเดิมของคุณ...
    Swal.fire({
      toast: true, position: 'top-end', icon: 'success',
      title: `เพิ่ม ${product.title} ลงตะกร้าแล้ว`, showConfirmButton: false, timer: 1500
    });
  };

  const getSafeImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath.split('/').pop()}`;
  };

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">กำลังโหลดเมนูอาหาร...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 🔴 ป้ายแจ้งเตือนสถานะร้านอิงเวลาไทย */}
      {!isStoreOpenNow && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
          <Clock className="shrink-0" />
          <div>
            <p className="font-black text-sm">ขณะนี้ร้านปิดให้บริการชั่วคราว</p>
            <p className="text-xs opacity-90">ขออภัยค่ะ นอกเวลาทำการของร้าน ({shopConfig.openTime} - ${shopConfig.closeTime} น.)</p>
          </div>
        </div>
      )}

      {/* Categories Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveCategory('all')} className={`px-5 py-2 rounded-full font-bold text-xs border shrink-0 transition-colors ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>ทั้งหมด</button>
        {categories.map(cat => (
          <button key={cat.categoryId} onClick={() => setActiveCategory(cat.categoryId)} className={`px-5 py-2 rounded-full font-bold text-xs border shrink-0 transition-colors ${activeCategory === cat.categoryId ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{cat.categoryName}</button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products
          .filter(p => activeCategory === 'all' || p.categoryId === activeCategory)
          .map(product => (
            <div key={product.productId} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group relative ${!product.isAvailable || !isStoreOpenNow ? 'opacity-70' : ''}`}>
              <div className="relative h-40 bg-gray-50 overflow-hidden">
                <img src={getSafeImageUrl(product.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={product.title} />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isRecommended && <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1"><Star size={8} fill="currentColor"/> แนะนำ</span>}
                </div>
                {(!product.isAvailable || !isStoreOpenNow) && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-xl font-black text-xs border border-red-400 shadow">ร้านปิด / หมด</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1 space-y-1">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-1 flex-1">{product.description || 'ไม่มีรายละเอียด'}</p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="font-black text-orange-600 text-sm">฿{product.price}</span>
                  <button onClick={() => handleAddToCart(product)} disabled={!product.isAvailable || !isStoreOpenNow} className={`p-2 rounded-xl text-white transition-all ${!product.isAvailable || !isStoreOpenNow ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'}`}><ShoppingCart size={16} /></button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
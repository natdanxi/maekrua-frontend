import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import { ShoppingCart, Star, Flame, Clock, Search, Plus, Minus, X, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Swal from 'sweetalert2';

export default function UserMenu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  
  const [shopStatus, setShopStatus] = useState({ isOpenNow: true, reason: 'นอกเวลาทำการ' });
  const [shopConfig, setShopConfig] = useState({ openTime: '08:30', closeTime: '16:00' });
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const addonsList = [
    { name: 'ไข่ดาว', price: 5 }, 
    { name: 'ไข่เจียว', price: 5 }, 
    { name: 'พิเศษ', price: 5 }, 
    { name: 'เพิ่มข้าว', price: 5 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, shopRes] = await Promise.all([
          axios.get(`${API_URL}/api/product`),
          axios.get(`${API_URL}/api/category`),
          axios.get(`${API_URL}/api/shop/status`)
        ]);

        const publicCategories = catRes.data.filter(cat => !cat.categoryName.includes('หน้าร้าน'));
        setCategories([{ categoryName: 'ทั้งหมด' }, ...publicCategories]);

        let publicProducts = prodRes.data.filter(p => !p.category?.categoryName?.includes('หน้าร้าน'));
        publicProducts.sort((a, b) => {
          if (b.isRecommended !== a.isRecommended) return b.isRecommended ? 1 : -1;
          return b.soldCount - a.soldCount;
        });
        setProducts(publicProducts);

        if (shopRes.data) {
          setShopConfig({
            openTime: shopRes.data.openTime || '08:30',
            closeTime: shopRes.data.closeTime || '16:00'
          });
        }
      } catch (err) { 
        console.error("Fetch Data Error:", err); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const fetchShopStatus = async () => {
      try {
        const statusRes = await axios.get(`${API_URL}/api/shop/status`);
        const isShopOpen = statusRes.data.isOpenNow ?? statusRes.data.isOpen ?? true;
        setShopStatus({
          isOpenNow: isShopOpen,
          reason: statusRes.data.reason || 'นอกเวลาทำการ'
        });
      } catch (err) { 
        console.error("Fetch shop status error:", err); 
      }
    };
    
    fetchShopStatus();
    const interval = setInterval(fetchShopStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (product) => {
    if (!shopStatus.isOpenNow) {
      Swal.fire({
        icon: 'error',
        title: 'ร้านปิดให้บริการ',
        text: `ขออภัยค่ะ ไม่สามารถสั่งอาหารได้ในขณะนี้เนื่องจากร้านปิดรับออเดอร์`,
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    if (!product.isAvailable) {
      Swal.fire({
        title: 'สินค้าหมด',
        text: 'ขออภัยค่ะ เมนูนี้หมดชั่วคราว',
        icon: 'info',
        confirmButtonColor: '#9ca3af'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'สงวนสิทธิ์เฉพาะสมาชิก',
        text: 'กรุณาเข้าสู่ระบบหรือสมัครสมาชิกเพื่อทำการสั่งอาหารค่ะ',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'เข้าสู่ระบบ',
        cancelButtonText: 'ดูเมนูต่อ'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'; 
        }
      });
      return; 
    }
    
    setSelectedProduct(product);
    setQuantity(1);
    setNote('');
    setSelectedAddons([]);
  };

  const confirmAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const addonsPrice = selectedAddons.length * 5;
    const addonsText = selectedAddons.length > 0 ? `เพิ่ม: ${selectedAddons.join(', ')}` : '';
    const finalNote = [addonsText, note].filter(Boolean).join(' | ');

    const newItem = {
      id: selectedProduct.productId, 
      product_id: selectedProduct.productId,
      title: selectedProduct.title,
      name: selectedProduct.title,
      price: parseFloat(selectedProduct.price) + addonsPrice,
      image: selectedProduct.image, 
      quantity: quantity,
      note: finalNote
    };

    existingCart.push(newItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));
    setSelectedProduct(null);
    setShowSuccessToast(true);
    
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const filteredProducts = products.filter(item => {
    const matchCategory = activeCategory === 'ทั้งหมด' || item.category?.categoryName === activeCategory || item.categoryId === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">กำลังโหลดเมนูอาหารแม่ครัวตัวกลม...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10 font-sans">
      <Navbar />

      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white border border-green-100 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="font-bold text-[14px] text-gray-800">เพิ่มลงตะกร้าสำเร็จ!</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        {!shopStatus.isOpenNow && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 shadow-sm mb-6 animate-pulse">
            <Clock className="shrink-0" />
            <div>
              <p className="font-black text-sm">ขณะนี้ร้านปิดให้บริการชั่วคราว</p>
              <p className="text-xs opacity-90">ขออภัยในความไม่สะดวก ทางร้านปิดรับคำสั่งซื้อภายนอกค่ะ</p>
            </div>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="ค้นหาเมนูอาหารที่คุณต้องการทาน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 shadow-sm" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map((cat, idx) => (
            <button key={idx} onClick={() => setActiveCategory(cat.categoryName)} className={`px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all border ${activeCategory === cat.categoryName ? 'bg-[#ea580c] text-white border-orange-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {cat.categoryName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div key={item.productId} onClick={() => handleOpenModal(item)} className={`bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm border-b-2 flex flex-col cursor-pointer group hover:shadow-md transition-all ${!item.isAvailable || !shopStatus.isOpenNow ? 'opacity-75 grayscale-[30%]' : ''}`}>
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                {item.image ? <img src={`${API_URL}/uploads/${item.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} /> : <div className="w-full h-full flex items-center justify-center text-gray-300">ไม่มีรูปภาพ</div>}
                
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {item.isRecommended && <span className="bg-orange-500 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md flex items-center gap-1"><Star size={12} fill="currentColor"/> แนะนำ</span>}
                  {item.soldCount >= 10 && <span className="bg-pink-500 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-md flex items-center gap-1"><Flame size={12} fill="currentColor"/> ขายดี</span>}
                </div>

                {(!item.isAvailable || !shopStatus.isOpenNow) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-black text-sm border-2 border-red-400">
                      {!shopStatus.isOpenNow ? 'ร้านปิดทำการ' : 'หมดชั่วคราว'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-[16px] font-bold text-gray-800 mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-[12px] text-gray-400 line-clamp-2 mb-4">{item.description || 'ไม่มีรายละเอียดเนื้อหา'}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[20px] font-black text-[#ea580c]">฿{item.price}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${item.isAvailable && shopStatus.isOpenNow ? 'bg-[#ea580c] group-hover:bg-orange-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                    <Plus size={18} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-[24px] p-6 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900 line-clamp-1">{selectedProduct.title}</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors shrink-0"><X size={18}/></button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">เพิ่มตัวเลือกพิเศษ (รายการละ ฿5)</p>
              <div className="grid grid-cols-2 gap-3">
                {addonsList.map((addon, i) => (
                  <button type="button" key={i} onClick={() => setSelectedAddons(prev => prev.includes(addon.name) ? prev.filter(a => a !== addon.name) : [...prev, addon.name])} className={`flex justify-between border rounded-xl px-3 py-2.5 transition-all active:scale-95 ${selectedAddons.includes(addon.name) ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold' : 'border-gray-200 text-gray-600'}`}>
                    <span className="text-[13px] font-bold">{addon.name}</span><span className="text-[12px]">+฿{addon.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3">หมายเหตุระบุถึงแม่ครัว</p>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น ไม่เผ็ด, ไข่ดาวสุกๆ, แยกน้ำราด..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-2 py-2 w-[110px] shrink-0">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-gray-800 p-1"><Minus size={18}/></button>
                <span className="font-bold text-gray-800 text-[16px]">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-gray-800 p-1"><Plus size={18}/></button>
              </div>
              <button type="button" onClick={confirmAddToCart} className="flex-1 bg-[#ea580c] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex justify-between px-5 transition-all shadow-sm active:scale-95">
                <span>เพิ่มลงตะกร้า</span>
                <span className="font-black text-[16px]">฿{(parseFloat(selectedProduct.price) + (selectedAddons.length * 5)) * quantity}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
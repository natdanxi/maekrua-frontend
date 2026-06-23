import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Store, Clock, MapPin, Phone, UploadCloud, Trash2, QrCode, Save, Info } from 'lucide-react';
import { API_URL } from '../../api';
import Navbar from '../../components/Navbar.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ShopSettings() {
  const [shopData, setShopData] = useState({ shopName: '', phone: '', address: '', openTime: '08:30', closeTime: '16:00', isOpen: true });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [removeQr, setRemoveQr] = useState(false);

  const [statusModal, setStatusModal] = useState({ show: false, type: '', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '' });

  const logoInputRef = useRef(null);
  const qrInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => { 
    const fetchShopInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/shop`);
        if (res.data) {
          setShopData({ 
            shopName: res.data.name || res.data.shopName || '', 
            phone: res.data.phone || '', 
            address: res.data.address || '', 
            openTime: res.data.openTime || '08:30', 
            closeTime: res.data.closeTime || '16:00', 
            isOpen: res.data.isOpen === true || String(res.data.isOpen) === 'true' 
          });
          if (res.data.logo) setLogoPreview(`${API_URL}/uploads/${res.data.logo}`);
          checkQrImage();
        }
      } catch (err) { console.error(err); }
    };
    fetchShopInfo(); 
  }, []);

  const checkQrImage = () => {
    const qrUrl = `${API_URL}/uploads/shop-qrcode.jpg?t=${new Date().getTime()}`;
    const img = new Image();
    img.onload = () => setQrPreview(qrUrl);
    img.onerror = () => {
        const qrUrlPng = `${API_URL}/uploads/shop-qrcode.png?t=${new Date().getTime()}`;
        const imgPng = new Image();
        imgPng.onload = () => setQrPreview(qrUrlPng);
        imgPng.onerror = () => setQrPreview(null);
        imgPng.src = qrUrlPng;
    };
    img.src = qrUrl;
  };

  const handleSave = async () => {
    setStatusModal({ show: true, type: 'loading', title: 'โปรดรอสักครู่', message: 'กำลังบันทึกข้อมูล...' });
    try {
      const formData = new FormData();
      formData.append('name', shopData.shopName); 
      formData.append('phone', shopData.phone);
      formData.append('address', shopData.address); 
      formData.append('openTime', shopData.openTime);
      formData.append('closeTime', shopData.closeTime); 
      formData.append('isOpen', shopData.isOpen);

      if (logoFile) formData.append('logo', logoFile); 
      formData.append('removeLogo', removeLogo);

      if (qrFile) formData.append('qrCode', qrFile); 
      formData.append('removeQrCode', removeQr);

      await axios.put(`${API_URL}/api/shop`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      
      setStatusModal({ show: true, type: 'success', title: 'สำเร็จ!', message: 'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว' });
      setTimeout(() => setStatusModal({ show: false }), 2000);
      if (qrFile || removeQr) setTimeout(checkQrImage, 500);
    } catch (err) { 
        setStatusModal({ show: true, type: 'error', title: 'เกิดข้อผิดพลาด', message: 'บันทึกข้อมูลไม่สำเร็จ' }); 
    }
  };

  const confirmRemoveImage = () => {
    if (deleteConfirm.type === 'logo') { setLogoFile(null); setLogoPreview(null); setRemoveLogo(true); }
    else if (deleteConfirm.type === 'qr') { setQrFile(null); setQrPreview(null); setRemoveQr(true); }
    setDeleteConfirm({ show: false, type: '' });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">ตั้งค่าร้านค้า</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">จัดการข้อมูลทั่วไปและสถานะการรับออเดอร์</p>
            </div>
            <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Save size={18} /> บันทึกการตั้งค่า
            </button>
        </div>

        {/* Logo & Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 flex flex-col sm:flex-row items-center p-6 gap-6">
            <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" /> : <Store size={40} className="text-slate-300" />}
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-black text-slate-800 mb-3">{shopData.shopName || 'ระบุชื่อร้านค้า'}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <button onClick={() => logoInputRef.current.click()} className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-100 transition"><UploadCloud size={16}/> เปลี่ยนโลโก้</button>
                    {logoPreview && <button onClick={() => setDeleteConfirm({show: true, type: 'logo'})} className="bg-red-50 text-red-500 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-100 transition"><Trash2 size={16}/></button>}
                </div>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {setLogoFile(e.target.files[0]); setLogoPreview(URL.createObjectURL(e.target.files[0])); setRemoveLogo(false);}} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* General Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3"><Info size={18} className="text-blue-500"/> ข้อมูลทั่วไป</h3>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">ชื่อร้าน</label>
                    <input type="text" value={shopData.shopName} onChange={e => setShopData({...shopData, shopName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:bg-white transition text-sm font-medium" placeholder="กรอกชื่อร้าน" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">เบอร์โทรศัพท์ติดต่อ</label>
                    <input type="tel" value={shopData.phone} onChange={e => setShopData({...shopData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:bg-white transition text-sm font-medium" placeholder="เช่น 08X-XXX-XXXX" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">ที่ตั้งร้าน</label>
                    <textarea rows="3" value={shopData.address} onChange={e => setShopData({...shopData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:bg-white resize-none transition text-sm font-medium" placeholder="กรอกที่ตั้งร้านค้า"></textarea>
                </div>
            </div>

            {/* Operating Hours & Status */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="font-bold text-slate-800">ระบบรับออเดอร์</h3>
                            <p className="text-xs text-slate-500 mt-1">เปิด/ปิด รับรายการสั่งซื้อจากลูกค้า</p>
                        </div>
                        <button onClick={() => setShopData({...shopData, isOpen: !shopData.isOpen})} className={`relative w-14 h-8 rounded-full transition-colors ${shopData.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${shopData.isOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    <div className={`mt-4 px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${shopData.isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {shopData.isOpen ? 'ร้านเปิดให้บริการปกติ' : 'ร้านปิดรับออเดอร์ชั่วคราว'}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4"><Clock size={18} className="text-orange-500"/> เวลาทำการปกติ</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">เวลาเปิด</label>
                            <input type="time" value={shopData.openTime} onChange={e => setShopData({...shopData, openTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400 focus:bg-white transition text-sm font-medium" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">เวลาปิด</label>
                            <input type="time" value={shopData.closeTime} onChange={e => setShopData({...shopData, closeTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400 focus:bg-white transition text-sm font-medium" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-5"><QrCode size={18} className="text-purple-500"/> ข้อมูลรับชำระเงิน (QR Code)</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-48 h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {qrPreview ? <img src={qrPreview} className="w-full h-full object-contain p-2" /> : <div className="text-center text-slate-400"><QrCode size={40} className="mx-auto mb-2 opacity-50" /><p className="text-xs">ยังไม่มี QR Code</p></div>}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-slate-600 mb-4">อัปโหลดภาพ QR Code เพื่อให้ลูกค้าสามารถสแกนชำระเงินผ่านระบบออนไลน์ได้</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <button onClick={() => qrInputRef.current.click()} className="bg-purple-50 border border-purple-200 text-purple-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-100 transition">อัปโหลดภาพ QR ใหม่</button>
                        {qrPreview && <button onClick={() => setDeleteConfirm({show: true, type: 'qr'})} className="bg-red-50 text-red-500 px-4 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition"><Trash2 size={18}/></button>}
                    </div>
                </div>
                <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => {setQrFile(e.target.files[0]); setQrPreview(URL.createObjectURL(e.target.files[0])); setRemoveQr(false);}} />
            </div>
        </div>
      </div>

      <ConfirmDialog isOpen={statusModal.show} type={statusModal.type} title={statusModal.title} message={statusModal.message} onConfirm={() => setStatusModal({ ...statusModal, show: false })} />
      <ConfirmDialog isOpen={deleteConfirm.show} type="warning" title="ยืนยันการลบ" message={`คุณต้องการลบ${deleteConfirm.type === 'logo' ? 'โลโก้' : 'QR Code'}นี้หรือไม่?`} onConfirm={confirmRemoveImage} onCancel={() => setDeleteConfirm({ show: false, type: '' })} confirmText="ลบข้อมูล" />
    </div>
  );
}
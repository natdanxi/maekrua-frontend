import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Loader2, LayoutGrid, Upload, Save, Settings2, Star, Flame } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../api';
import Modal from '../../components/ui/Modal';
import Navbar from '../../components/Navbar';

export default function MenuManagement() {
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [activeCategory, setActiveCategory] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const token = localStorage.getItem('token'); 
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };
  
  const initialFormState = { title: '', description: '', price: '', categoryId: '', image: null, previewImage: null, isRecommended: false, isAvailable: true };
  const [forms, setForms] = useState([{ ...initialFormState, id: Date.now() }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/product`),
        axios.get(`${API_URL}/api/category`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) { console.error("Fetch Data Error:", err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddCategory = async () => {
    const { value: categoryName } = await Swal.fire({ title: 'เพิ่มหมวดหมู่', input: 'text', showCancelButton: true });
    if (categoryName) {
      try { await axios.post(`${API_URL}/api/category`, { categoryName }, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'เพิ่มไม่ได้', 'error'); }
    }
  };

  const handleEditCategory = async (categoryId, currentName) => {
    const { value: categoryName } = await Swal.fire({ title: 'แก้ไขหมวดหมู่', input: 'text', inputValue: currentName, showCancelButton: true });
    if (categoryName) {
      try { await axios.put(`${API_URL}/api/category/${categoryId}`, { categoryName }, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'แก้ไขไม่ได้', 'error'); }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try { await axios.delete(`${API_URL}/api/category/${categoryId}`, authConfig); fetchData(); } 
    catch (err) { Swal.fire('ผิดพลาด', 'ลบไม่ได้ (อาจมีเมนูค้างอยู่)', 'error'); }
  };

  const handleDeleteProduct = async (productId, title) => {
    const result = await Swal.fire({ title: 'ยืนยันลบ', text: `ลบเมนู "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (result.isConfirmed) {
      try { await axios.delete(`${API_URL}/api/product/${productId}`, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'ลบไม่ได้', 'error'); }
    }
  };

  const openAddModal = () => { setModalMode('add'); setEditingId(null); setForms([{ ...initialFormState, id: Date.now() }]); setIsModalOpen(true); };
  
  const openEditModal = (item) => {
    setModalMode('edit'); setEditingId(item.productId);
    setForms([{ 
      id: item.productId, title: item.title || '', description: item.description || '', price: item.price || '', categoryId: item.categoryId || '', isRecommended: item.isRecommended || false, isAvailable: item.isAvailable ?? true, image: null, previewImage: getSafeImageUrl(item.image) 
    }]);
    setIsModalOpen(true);
  };

  // 🟢 เพิ่มฟังก์ชันจัดการอาร์เรย์ของการเพิ่มหลายฟอร์ม
  const handleAddMoreForm = () => setForms([...forms, { ...initialFormState, id: Date.now() }]);
  const handleRemoveForm = (id) => setForms(forms.filter(f => f.id !== id));

  const handleFormChange = (index, field, value) => { const newForms = [...forms]; newForms[index][field] = value; setForms(newForms); };
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newForms = [...forms]; newForms[index].image = file; newForms[index].previewImage = URL.createObjectURL(file); setForms(newForms); e.target.value = ''; 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const config = { headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' } };
    
    try {
      for (const form of forms) {
        if (!form.categoryId) throw new Error("กรุณาเลือกหมวดหมู่ให้ครบทุกเมนู");
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description || '');
        payload.append('price', Number(form.price));
        payload.append('categoryId', Number(form.categoryId));
        payload.append('isRecommended', form.isRecommended);
        payload.append('isAvailable', form.isAvailable);
        if (form.image) payload.append('image', form.image);

        if (modalMode === 'add') await axios.post(`${API_URL}/api/product`, payload, config);
        else await axios.put(`${API_URL}/api/product/${editingId}`, payload, config);
      }
      fetchData(); setIsModalOpen(false);
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || err.message, 'error');
    } finally { setIsSubmitting(false); }
  };

  const getSafeImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath.split('/').pop()}`;
  };

  const filteredProducts = products.filter(item => {
    const matchCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-10 font-sans">
      <Navbar />
      
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <h2 className="font-black text-xl text-slate-800 flex items-center gap-3"><LayoutGrid className="text-orange-500"/> จัดการเมนูอาหาร</h2>
          <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="ค้นหาเมนู..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-400 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={openAddModal} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm"><Plus size={18}/> เพิ่มเมนู</button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveCategory('all')} className={`px-5 py-2 rounded-full font-bold text-sm border transition-colors whitespace-nowrap ${activeCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>ทั้งหมด</button>
          {categories.map(cat => (
            <button key={cat.categoryId} onClick={() => setActiveCategory(cat.categoryId)} className={`px-5 py-2 rounded-full font-bold text-sm border transition-colors whitespace-nowrap ${activeCategory === cat.categoryId ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{cat.categoryName}</button>
          ))}
          <button onClick={() => setIsCategoryModalOpen(true)} className="px-5 py-2 bg-orange-50 text-orange-600 rounded-full font-bold text-sm border border-orange-200 ml-2 flex items-center gap-2 whitespace-nowrap hover:bg-orange-100 transition-colors"><Settings2 size={16}/> จัดการหมวดหมู่</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map(item => (
            <div key={item.productId} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col relative group transition-all hover:shadow-md hover:border-orange-200 ${!item.isAvailable ? 'opacity-60 grayscale-[50%]' : ''}`}>
              <div className="relative h-40 bg-slate-100 shrink-0">
                <img src={getSafeImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {item.isRecommended && <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1"><Star size={10} fill="currentColor"/> แนะนำ</span>}
                    {item.soldCount >= 10 && <span className="bg-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1"><Flame size={10} fill="currentColor"/> ขายดี</span>}
                </div>

                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-black text-[11px] shadow-sm">ปิดรับออเดอร์</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 z-20 transition-opacity backdrop-blur-sm">
                    <button onClick={() => openEditModal(item)} className="bg-white p-2.5 rounded-full text-slate-700 hover:text-orange-500 hover:scale-110 transition-all shadow-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteProduct(item.productId, item.title)} className="bg-white p-2.5 rounded-full text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-lg"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.title}</h3>
                <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="font-black text-orange-600 text-base">฿{item.price}</span>
                    <span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">ขายแล้ว {item.soldCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="จัดการหมวดหมู่">
          <button onClick={handleAddCategory} className="w-full py-3 mb-4 border-2 border-dashed border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold rounded-xl flex justify-center gap-2 transition-colors"><Plus size={18}/> เพิ่มหมวดหมู่</button>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.categoryId} className="flex justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl items-center">
                <span className="font-bold text-slate-700 text-sm">{cat.categoryName}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditCategory(cat.categoryId, cat.categoryName)} className="text-blue-500 bg-white p-1.5 rounded-md shadow-sm border border-slate-100 hover:bg-blue-50"><Edit2 size={14}/></button>
                  <button onClick={() => handleDeleteCategory(cat.categoryId, cat.categoryName)} className="text-red-500 bg-white p-1.5 rounded-md shadow-sm border border-slate-100 hover:bg-red-50"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* 🟢 หน้าต่าง Modal สำหรับเพิ่มเมนูแบบอลังการ */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'เพิ่มเมนูใหม่' : 'แก้ไขเมนู'}>
          <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar px-1 pb-4">
            {forms.map((form, index) => (
              <div key={form.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative mb-5 transition-all hover:border-orange-300">
                {modalMode === 'add' && forms.length > 1 && (
                  <button type="button" onClick={() => handleRemoveForm(form.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                )}
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex justify-center sm:block shrink-0">
                    <label className="w-32 h-32 border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl flex items-center justify-center cursor-pointer bg-slate-50 relative overflow-hidden transition-colors">
                      {form.previewImage ? <img src={form.previewImage} className="w-full h-full object-cover"/> : <div className="text-slate-400 flex flex-col items-center"><Upload size={24} className="mb-2 text-slate-300"/><span className="text-[11px] font-bold">ใส่รูปภาพ</span></div>}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
                    </label>
                  </div>

                  <div className="flex-1 space-y-3">
                    <input type="text" placeholder="ชื่อเมนูอาหาร" required value={form.title} onChange={e => handleFormChange(index, 'title', e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-bold text-slate-800 text-sm" />
                    
                    <div className="flex gap-3">
                      <div className="relative w-1/3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">฿</span>
                        <input type="number" placeholder="ราคา" required value={form.price} onChange={e => handleFormChange(index, 'price', e.target.value)} className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-bold text-slate-800 text-sm" min="0" />
                      </div>
                      <select required value={form.categoryId} onChange={e => handleFormChange(index, 'categoryId', e.target.value)} className="w-2/3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-bold text-slate-600 text-sm">
                        <option value="" disabled>-- หมวดหมู่ --</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.isAvailable} onChange={e => handleFormChange(index, 'isAvailable', e.target.checked)} className="w-4 h-4 accent-emerald-500 cursor-pointer rounded" />
                          <span className={`text-xs font-bold ${form.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>เปิดขาย</span>
                      </label>
                      <div className="w-px bg-slate-200"></div>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.isRecommended} onChange={e => handleFormChange(index, 'isRecommended', e.target.checked)} className="w-4 h-4 accent-orange-500 cursor-pointer rounded" />
                          <span className={`text-xs font-bold ${form.isRecommended ? 'text-orange-600' : 'text-slate-400'}`}>เมนูแนะนำ</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 🟢 ปุ่มเพิ่มเมนูทีละหลายๆ อัน */}
            {modalMode === 'add' && (
              <button type="button" onClick={handleAddMoreForm} className="w-full py-3.5 border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 text-orange-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                <Plus size={18}/> เพิ่มเมนูถัดไป (ใส่พร้อมกันหลายเมนู)
              </button>
            )}

          </form>
          <div className="pt-4 border-t border-slate-100 mt-2">
            <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-slate-800 hover:bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
              {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} ยืนยันบันทึกข้อมูล
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
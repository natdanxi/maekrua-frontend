import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import { Users, Trash2, Search, User, Calendar, ShieldCheck, Mail, Phone, Edit, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import Modal from '../../components/ui/Modal';
import { useFetchData } from '../../hooks/useFetchData';
import Navbar from '../../components/Navbar';

export default function Customers() {
  const { data: users, refetch } = useFetchData('/api/users');
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editId, setEditId] = useState(null); 
  const [formData, setFormData] = useState({ firstname: '', lastname: '', tel: '', role: 'user' }); 

  const handleEditClick = (user) => {
    setEditId(user.id);
    setFormData({ firstname: user.firstname || '', lastname: user.lastname || '', tel: user.tel || '', role: user.role || 'user' });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/users/${editId}`, formData);
      Swal.fire({ title: 'สำเร็จ!', text: 'แก้ไขข้อมูลเรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
      setIsModalOpen(false);
      refetch();
    } catch (err) { Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาด: ' + err.message, 'error'); }
  };

  const handleRemove = async (id) => {
    const result = await Swal.fire({ title: 'ยืนยันการลบ?', text: "ไม่สามารถกู้คืนข้อมูลนี้ได้", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/users/${id}`);
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้งานถูกลบแล้ว', 'success');
        refetch();
      } catch (err) { Swal.fire('ผิดพลาด', 'ลบไม่สำเร็จ มีออเดอร์ค้างอยู่', 'error'); }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
      const term = searchTerm.toLowerCase();
      return (user.firstname || "").toLowerCase().includes(term) || (user.email || "").toLowerCase().includes(term);
  }) : [];

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-200"><Users size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-800">ฐานข้อมูลลูกค้าสมาชิก</h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">รวมทั้งหมด {users.length || 0} บัญชีในระบบ</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหาชื่อ หรือ อีเมล..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* 🟢 เปลี่ยนเป็น Customer Cards Grid แสนสวยงาม */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative group hover:shadow-md hover:border-blue-200 transition-all">
              
              <div className="flex justify-between items-start mb-5">
                <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-md ${user.role === 'admin' ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                  {user.firstname ? user.firstname.charAt(0).toUpperCase() : '?'}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${user.role === 'admin' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {user.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />} {user.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-800 text-[17px] leading-tight mb-1 truncate">{user.firstname} {user.lastname}</h3>
                <p className="text-[11px] font-bold text-slate-400 mb-4 tracking-wide uppercase">ID: {user.id}</p>
              </div>

              <div className="space-y-2.5 bg-slate-50 rounded-xl p-3.5 mb-5 border border-slate-100">
                <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600"><Mail size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{user.email || "-"}</span></div>
                <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600"><Phone size={14} className="text-slate-400 shrink-0" /> {user.tel || "-"}</div>
                <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600"><Calendar size={14} className="text-slate-400 shrink-0" /> สมัคร: {new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEditClick(user)} className="flex-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"><Edit size={14} /> แก้ไข</button>
                <button onClick={() => handleRemove(user.id)} disabled={user.role === 'admin'} className="w-12 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center shadow-sm disabled:opacity-30 disabled:hover:border-slate-200"><Trash2 size={16} /></button>
              </div>

            </div>
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="แก้ไขข้อมูลสมาชิก" icon={Edit}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">ชื่อ</label><input name="firstname" value={formData.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">นามสกุล</label><input name="lastname" value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">เบอร์โทรศัพท์</label><input name="tel" value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">สถานะผู้ใช้งาน</label><select name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"><option value="user">User (ลูกค้าทั่วไป)</option><option value="admin">Admin (ผู้ดูแลระบบ)</option></select></div>
            <button type="submit" className="w-full py-4 bg-slate-800 hover:bg-black text-white rounded-xl font-black shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 mt-4"><Save size={18} /> บันทึกการแก้ไข</button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
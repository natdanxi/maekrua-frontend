import React, { useState } from 'react';
import { Wallet, Utensils, Users, Clock, MonitorSmartphone, Store, UserPlus, TrendingUp, ChefHat, BarChart3, User, Mail, Phone, Calendar } from 'lucide-react';
import { API_URL } from '../../../api';
import StatusBadge from '../../../components/ui/StatusBadge';
import LineChart from './LineChart';

// 🟢 ใส่ Default Props (={}) กันบัคเวลา Backend ส่งข้อมูลมาไม่ครบ
export const SalesModalContent = ({ graphData = {}, todaySales = 0 }) => {
  const [timeRange, setTimeRange] = useState('weekly');
  const currentData = graphData[timeRange] || []; // กันพังถ้าไม่มีข้อมูลกราฟ

  return (
  <div className="animate-in fade-in p-2 md:p-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/3 space-y-6">
              <div className="bg-gradient-to-br from-[#0f172a] to-[#334155] p-8 rounded-[28px] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <p className="text-sm font-bold opacity-90 tracking-wide text-slate-300">ยอดขายสุทธิ (วันนี้)</p>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10"><Wallet size={20} className="text-orange-400"/></div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black relative z-10 tracking-tight"><span className="text-2xl text-orange-400 mr-1">฿</span>{(todaySales || 0).toLocaleString()}</h3>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm">
                  <p className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2"><BarChart3 size={18} className="text-slate-400"/> สัดส่วนช่องทางการขาย</p>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 text-purple-600 flex items-center justify-center"><Store size={18}/></div>
                          <div><p className="text-[13px] font-bold text-slate-700">หน้าร้าน (POS)</p><p className="text-[11px] text-slate-400 font-bold">ลูกค้า Walk-in</p></div>
                        </div>
                        <span className="font-black text-slate-900 text-lg">฿{currentData.reduce((s, d) => s + (d.walkin || 0), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 text-blue-600 flex items-center justify-center"><MonitorSmartphone size={18}/></div>
                          <div><p className="text-[13px] font-bold text-slate-700">ออนไลน์</p><p className="text-[11px] text-slate-400 font-bold">ลูกค้าสั่งผ่านเว็บ</p></div>
                        </div>
                        <span className="font-black text-slate-900 text-lg">฿{currentData.reduce((s, d) => s + (d.online || 0), 0).toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
          <div className="lg:w-2/3 bg-white border border-slate-100 p-6 md:p-8 rounded-[28px] shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h4 className="font-black text-slate-800 text-lg flex items-center gap-2"><TrendingUp size={22} className="text-orange-500"/> กราฟเปรียบเทียบยอดขาย</h4>
                  <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100 text-[13px] font-bold shrink-0">
                      <button onClick={()=>setTimeRange('daily')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='daily'?'bg-white shadow-sm border border-slate-200 text-slate-900':'text-slate-500 hover:text-slate-700'}`}>วันนี้</button>
                      <button onClick={()=>setTimeRange('weekly')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='weekly'?'bg-white shadow-sm border border-slate-200 text-slate-900':'text-slate-500 hover:text-slate-700'}`}>7 วัน</button>
                      <button onClick={()=>setTimeRange('monthly')} className={`px-5 py-2.5 rounded-lg transition-all ${timeRange==='monthly'?'bg-white shadow-sm border border-slate-200 text-slate-900':'text-slate-500 hover:text-slate-700'}`}>เดือนนี้</button>
                  </div>
              </div>
              <div className="flex-1 mt-auto"><LineChart data={currentData} /></div>
              <div className="flex justify-center gap-8 mt-14 text-[13px] font-bold text-slate-600 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-purple-500 rounded-full shadow-sm border border-purple-400"></div> ยอดขายหน้าร้าน</div>
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-sm border border-blue-400"></div> ยอดขายออนไลน์</div>
              </div>
          </div>
      </div>
  </div>
  )
};

export const AllMenusModalContent = ({ groupedMenus = {} }) => (
  <div className="animate-in fade-in p-2 md:p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <div className="space-y-10">
          {Object.entries(groupedMenus).map(([category, items], idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-3 h-8 bg-slate-800 rounded-full"></div> {category} 
                  <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{items.length} รายการ</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {items.map(menu => {
                      const isAvailable = menu.isAvailable === true || menu.is_available === true;
                      return (
                          <div key={menu.id} className={`border border-slate-100 rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ${!isAvailable ? 'opacity-60 grayscale-[50%]' : ''}`}>
                              <div className="h-28 bg-slate-50 relative overflow-hidden">
                                  {menu.image ? <img src={`${API_URL}/uploads/${menu.image}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"/> : <Utensils className="w-full h-full p-8 text-slate-300"/>}
                                  {!isAvailable && (
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[11px] font-black tracking-widest shadow-sm">ปิดการขาย</span></div>
                                  )}
                              </div>
                              <div className="p-4 flex flex-col justify-between h-[80px]">
                                  <p className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">{menu.title}</p>
                                  <span className="font-black text-[#ea580c] text-[15px] mt-1">฿{menu.price}</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
          ))}
      </div>
  </div>
);

export const QueueModalContent = ({ activeOrders = [] }) => (
  <div className="animate-in fade-in p-2 md:p-4 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
      {!activeOrders || activeOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><ChefHat size={60} className="mx-auto mb-4 opacity-20"/><p className="text-lg font-bold">ไม่มีคิวออเดอร์ที่กำลังปรุงในขณะนี้</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOrders.map(order => (
            <div key={order.ordersId || order.id} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex flex-col hover:border-emerald-300 transition-colors">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg">#{order.ordersId || order.id}</div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{(!order.user || order.orderType === 'walkin') ? (order.customerInfo || 'หน้าร้าน') : `${order.user?.firstname} ${order.user?.lastname || ''}`}</p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1"><Clock size={10}/> {new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status?.toLowerCase()} />
               </div>
               <div className="mt-auto border-t border-dashed border-slate-100 pt-3 flex justify-between items-center">
                 <span className="text-[12px] font-bold text-slate-500">{order.items?.length || 0} รายการ</span>
                 <span className="font-black text-orange-500">฿{order.totalPrice || order.totalAmount}</span>
               </div>
            </div>
          ))}
        </div>
      )}
  </div>
);

export const CustomersModalContent = ({ details = {} }) => {
  const newUsers = details.newUsers || [];
  
  return (
  <div className="space-y-6 animate-in fade-in p-2 md:p-4">
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] flex flex-col justify-center shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 bg-blue-50 w-24 h-24 rounded-full opacity-50"></div>
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 text-blue-500 rounded-xl flex items-center justify-center mb-4 relative z-10"><MonitorSmartphone size={22}/></div>
              <h4 className="text-3xl font-black text-slate-900 relative z-10">{details.onlineOrders || 0}</h4>
              <p className="text-[12px] font-bold text-slate-500 mt-1 relative z-10">ออเดอร์ออนไลน์ (วันนี้)</p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] flex flex-col justify-center shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 bg-purple-50 w-24 h-24 rounded-full opacity-50"></div>
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 relative z-10"><Store size={22}/></div>
              <h4 className="text-3xl font-black text-slate-900 relative z-10">{details.walkinOrders || 0}</h4>
              <p className="text-[12px] font-bold text-slate-500 mt-1 relative z-10">ลูกค้าหน้าร้าน (วันนี้)</p>
          </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h4 className="font-black text-slate-900 text-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center"><UserPlus size={20}/></div>
                สมาชิกล่าสุด
              </h4>
              <span className="text-[13px] font-bold bg-slate-50 text-slate-600 px-4 py-2 rounded-full border border-slate-200">ทั้งหมด {details.registered || 0} คนในระบบ</span>
          </div>

          {newUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold border border-dashed rounded-2xl">ยังไม่มีลูกค้าใหม่ในช่วงนี้</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newUsers.map((u, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex items-start gap-4 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
                    {u.firstname ? u.firstname.charAt(0).toUpperCase() : <User size={18}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 text-[15px] truncate leading-tight mb-1">{u.firstname} {u.lastname}</h5>
                    <div className="space-y-1">
                      <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5"><Mail size={12} className="text-slate-400"/> <span className="truncate">{u.email}</span></p>
                      <p className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {u.tel || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
  </div>
  )
};
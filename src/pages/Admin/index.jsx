import React from 'react';
import { Wallet, Utensils, Users, Clock, Activity, User, TrendingUp, ChefHat, ReceiptText } from 'lucide-react';

// 🟢 แก้ไข: เปลี่ยน Path นำเข้าโฟลเดอร์ให้ถูกต้อง (ถอยแค่ 2 ชั้น ../../)
import { useAdminHome } from '../../hooks/useAdminHome';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { SalesModalContent, AllMenusModalContent, QueueModalContent, CustomersModalContent } from './DashboardModals';
import Navbar from '../../components/Navbar';

export default function Home() {
  const { loading, activeModal, setActiveModal, dashboardData } = useAdminHome();

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full"></div></div>;

  const { stats, recentOrders, graphData, groupedMenus, customerDetails, activeOrdersList } = dashboardData;

  const modalConfigs = {
    sales: { title: 'ยอดขายและกราฟเปรียบเทียบ', icon: <ReceiptText size={20} className="text-slate-600"/>, content: <SalesModalContent graphData={graphData} todaySales={stats.sales} />, maxWidth: 'max-w-[1000px]' },
    menus: { title: 'เมนูอาหารทั้งหมด (แบ่งหมวดหมู่)', icon: <Utensils size={20} className="text-slate-600"/>, content: <AllMenusModalContent groupedMenus={groupedMenus} />, maxWidth: 'max-w-[1100px]' },
    queue: { title: 'คิวออเดอร์ที่กำลังปรุง', icon: <ChefHat size={20} className="text-slate-600"/>, content: <QueueModalContent activeOrders={activeOrdersList} />, maxWidth: 'max-w-[800px]' },
    customers: { title: 'สถิติลูกค้าและช่องทางการสั่ง', icon: <Users size={20} className="text-slate-600"/>, content: <CustomersModalContent details={customerDetails} />, maxWidth: 'max-w-[800px]' },
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-10 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
        
        {/* --- ส่วนการ์ดสถิติ 4 ใบ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          
          <div onClick={() => setActiveModal('sales')} className="group bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-[16px] bg-slate-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Wallet size={20} /></div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm"><TrendingUp size={12} /> อัปเดตล่าสุด</span>
            </div>
            <div className="mt-6">
              <p className="text-[13px] font-bold text-slate-500 mb-1 tracking-wide">ยอดขายสุทธิ (วันนี้)</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight"><span className="text-slate-400 text-2xl mr-1">฿</span>{stats.sales.toLocaleString()}</h3>
            </div>
          </div>
          
          <div onClick={() => setActiveModal('menus')} className="group bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-[16px] bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Utensils size={20} /></div>
              <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">ข้อมูลเมนู</span>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="flex flex-col"><p className="text-[13px] font-bold text-slate-500 mb-1 tracking-wide">เมนูที่เปิดขาย</p><h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.totalMenus}</h3></div><span className="text-sm font-bold text-slate-400">รายการ</span>
            </div>
          </div>
          
          <div onClick={() => setActiveModal('queue')} className="group bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-[16px] bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Activity size={20} /></div>
              <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span> กำลังปรุง
              </span>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="flex flex-col"><p className="text-[13px] font-bold text-slate-500 mb-1 tracking-wide">คิวที่รอ/กำลังทำ</p><h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.activeUsers}</h3></div><span className="text-sm font-bold text-slate-400">คิว</span>
            </div>
          </div>

          <div onClick={() => setActiveModal('customers')} className="group bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer min-h-[160px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-[16px] bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><Users size={20} /></div>
              <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">สมาชิกระบบ</span>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="flex flex-col"><p className="text-[13px] font-bold text-slate-500 mb-1 tracking-wide">ลูกค้าสมาชิก</p><h3 className="text-4xl font-black text-slate-900 tracking-tight">{stats.totalCustomers}</h3></div><span className="text-sm font-bold text-slate-400">คน</span>
            </div>
          </div>
        </div>

        {/* --- ส่วนตารางออเดอร์ล่าสุด --- */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5"><Clock className="text-slate-400" size={20}/> ออเดอร์ล่าสุด</h2>
            <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[12px] font-bold px-4 py-1.5 rounded-full">{recentOrders.length} รายการ</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100">
                  <th className="px-6 py-4">หมายเลขคิว</th><th className="px-6 py-4">ลูกค้า</th><th className="px-6 py-4">ยอดสุทธิ</th><th className="px-6 py-4">ช่องทาง</th><th className="px-6 py-4 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-[14px] divide-y divide-slate-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-16 text-center font-bold text-slate-400">ยังไม่มีรายการออเดอร์ในขณะนี้</td></tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-slate-800 font-black">#{order.ordersId || order.id}</td>
                      <td className="px-6 py-5 text-slate-600 font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"><User size={14}/></div>
                        {(!order.user || order.orderType === 'walkin') ? (order.customerInfo || 'ลูกค้าหน้าร้าน') : `${order.user?.firstname} ${order.user?.lastname || ''}`}
                      </td>
                      <td className="px-6 py-5 font-black text-slate-800 text-[15px]">฿{Number(order.totalPrice || order.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-5">
                        {order.orderType === 'walkin' ? <span className="bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">หน้าร้าน</span>
                        : <span className="bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">ออนไลน์</span>}
                      </td>
                      <td className="px-6 py-5 text-right"><StatusBadge status={order.status?.toLowerCase()} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeModal && modalConfigs[activeModal] && (
        <Modal 
          isOpen={true} onClose={() => setActiveModal(null)} 
          title={<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-[10px] bg-slate-100 flex items-center justify-center">{modalConfigs[activeModal].icon}</div><span className="text-[18px] font-black text-slate-800">{modalConfigs[activeModal].title}</span></div>} 
          maxWidth={modalConfigs[activeModal].maxWidth} bgHeader="bg-white border-b border-slate-100"
        >
          {modalConfigs[activeModal].content}
        </Modal>
      )}
    </div>
  );
}
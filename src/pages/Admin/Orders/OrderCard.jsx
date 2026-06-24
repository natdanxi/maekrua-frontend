import React from 'react';
import { User, Phone, Clock, Utensils, XCircle, QrCode, Banknote, Receipt, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../../api';

const OrderCard = ({ order, setViewSlipImage, openRejectModal, handleStatusChange }) => {
  const isWalkin = !order.user || order.orderType === 'walkin';
  
  const customerName = isWalkin ? (order.customerInfo || 'ลูกค้าหน้าร้านทั่วไป') : `${order.user?.firstname || 'ไม่ระบุชื่อ'} ${order.user?.lastname || ''}`;
  const customerPhone = !isWalkin && order.user?.tel ? order.user.tel : null;

  const statusColors = {
    pending: 'bg-orange-500',
    cooking: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  return (
    <div className={`bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all duration-300 border-2 ${order.status === 'pending' ? 'border-orange-200 hover:border-orange-400' : 'border-transparent'} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]`}>
        {/* แถบสีด้านบน */}
        <div className={`h-2 w-full ${statusColors[order.status] || 'bg-gray-200'}`}></div>

        {/* ส่วนหัว (Header) ของการ์ด */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start bg-gradient-to-b from-gray-50/80 to-white">
           <div>
               <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[22px] font-black text-gray-900 leading-none tracking-tight">#{order.ordersId || order.id}</h3>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isWalkin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                      {isWalkin ? 'ทานที่ร้าน/สั่งกลับ' : 'สั่งออนไลน์'}
                  </span>
               </div>
               <div className="flex flex-col gap-1 mt-2">
                 <p className="text-[14px] font-bold text-gray-700 flex items-center gap-1.5 bg-gray-100/50 w-fit px-2 py-1 rounded-lg">
                   <User size={14} className="text-gray-500"/> {customerName}
                 </p>
                 {customerPhone && (
                   <p className="text-[13px] font-bold text-gray-500 flex items-center gap-1.5 ml-[2px]">
                     <Phone size={13} className="text-gray-400"/> {customerPhone}
                   </p>
                 )}
               </div>
           </div>
           <div className="text-right">
               <span className="text-[13px] font-black text-gray-600 bg-white border-2 border-gray-100 shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                 <Clock size={14} className="text-orange-500"/> {new Date(order.createdAt || order.orderDate).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
               </span>
           </div>
        </div>

        {/* ส่วนรายการอาหาร (Order Items) เน้นให้อ่านง่าย */}
        <div className="flex-1 p-5 space-y-4 bg-white">
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">เมนูที่ต้องทำ</p>
            {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                    <div className="w-14 h-14 bg-white rounded-[14px] overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {item.product?.image ? <img src={`${API_URL}/uploads/${item.product.image}`} className="w-full h-full object-cover" /> : <Utensils size={20} className="text-gray-300"/>}
                    </div>
                    <div className="flex-1 pt-0.5">
                        <p className="text-[16px] font-black text-gray-800 leading-tight mb-1">
                          <span className="text-white bg-[#ea580c] px-2 py-0.5 rounded-md text-[14px] mr-2 shadow-sm">{item.quantity}x</span> 
                          {item.product?.title || item.name}
                        </p>
                        
                        {/* ส่วนหมายเหตุ (Note) แยกระหว่าง Add-ons กับ ข้อความปกติ */}
                        {item.note && (
                          <div className="mt-2 flex flex-wrap gap-2">
                             {item.note.split('|').map((n, i) => {
                                const noteText = n.trim();
                                if (!noteText) return null;
                                // เน้น Add-ons ด้วยสีส้ม
                                if (noteText.includes('เพิ่ม:')) {
                                  return (
                                    <span key={i} className="bg-orange-100 text-orange-700 text-[13px] font-bold px-2.5 py-1 rounded-lg border border-orange-200 shadow-sm">
                                      {noteText}
                                    </span>
                                  );
                                }
                                // ข้อความปกติใช้สีเทาเข้ม
                                return (
                                  <span key={i} className="bg-gray-100 text-gray-700 text-[13px] font-bold px-2.5 py-1 rounded-lg border border-gray-200">
                                    ⭐ {noteText}
                                  </span>
                                );
                             })}
                          </div>
                        )}
                    </div>
                </div>
            ))}

            {order.status === 'cancelled' && order.rejectReason && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
                <p className="text-[13px] font-black text-red-700 flex items-center gap-1.5 mb-1.5"><XCircle size={16}/> สาเหตุที่ยกเลิกออเดอร์</p>
                <p className="text-[14px] text-red-600 font-bold">{order.rejectReason}</p>
              </div>
            )}
        </div>

        {/* ส่วนด้านล่าง (Footer) ชำระเงินและปุ่มกด */}
        <div className="p-5 bg-gray-50/80 border-t border-gray-100">
            <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">วิธีชำระเงิน</span>
                  {order.paymentMethod === 'transfer' ? (
                    <span className="text-[14px] font-black text-blue-600 flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg"><QrCode size={16} strokeWidth={2.5}/> โอนเงินเข้าบัญชี</span>
                  ) : (
                    <span className="text-[14px] font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg"><Banknote size={16} strokeWidth={2.5}/> จ่ายเงินสด</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 block">ยอดสุทธิ</span>
                  <span className="text-[26px] font-black text-[#ea580c] leading-none block">฿{order.totalPrice || order.totalAmount || 0}</span>
                </div>
            </div>
            
            {order.paymentMethod === 'transfer' && (
                <button 
                  onClick={() => {
                      const slipPath = order.slipImage || order.slip_image || 
                                       (order.payments && order.payments[0]?.slipImage) || 
                                       (order.payment && order.payment?.slipImage) ||
                                       (order.Payment && order.Payment[0]?.slipImage);
                      if (slipPath) {
                          setViewSlipImage(`${API_URL}/uploads/${slipPath}`);
                      } else {
                          Swal.fire({ title: 'ไม่พบสลิป', html: 'ลูกค้าไม่ได้แนบสลิปโอนเงินมาครับ', icon: 'info' });
                      }
                  }} 
                  className="w-full mb-3 flex items-center justify-center gap-2 text-[14px] bg-white border-2 border-blue-200 text-blue-600 py-3 rounded-xl font-black hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                >
                  <Receipt size={18}/> ตรวจสอบสลิปโอนเงิน
                </button>
            )}

            {order.status === 'pending' && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => openRejectModal(order.ordersId || order.id)} className="flex-1 py-3.5 border-2 border-red-200 text-red-500 bg-white rounded-[16px] text-[15px] font-black hover:bg-red-50 hover:border-red-300 transition-all shadow-sm">ปฏิเสธ</button>
                <button onClick={() => handleStatusChange(order.ordersId || order.id, 'cooking')} className="flex-[2] py-3.5 bg-[#ea580c] hover:bg-orange-600 text-white rounded-[16px] text-[16px] font-black shadow-[0_8px_20px_rgba(234,88,12,0.25)] transition-all active:scale-95">รับออเดอร์เลย</button>
              </div>
            )}
            {order.status === 'cooking' && (
              <button onClick={() => handleStatusChange(order.ordersId || order.id, 'completed')} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-[16px] text-[16px] font-black shadow-[0_8px_20px_rgba(34,197,94,0.25)] transition-all active:scale-95 flex justify-center items-center gap-2 mt-2">
                <CheckCircle size={22}/> เสิร์ฟอาหารสำเร็จ
              </button>
            )}
        </div>
    </div>
  );
};

export default OrderCard;
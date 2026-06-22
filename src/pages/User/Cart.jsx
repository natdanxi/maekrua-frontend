// ค้นหาฟังก์ชัน confirmOrder ภายในไฟล์ Cart.jsx แล้วนำชุดนี้ไปวางทับครับ
const confirmOrder = async () => {
  const token = localStorage.getItem('token');
  if (!token) return navigate('/login');

  setIsSubmitting(true);
  try {
    const headers = { Authorization: `Bearer ${token}` };

    const formattedItems = cartItems.map(item => ({
      id: item.product_id || item.id, 
      product_id: item.product_id || item.id,
      price: item.price,
      quantity: item.quantity,
      note: item.note || ''
    }));

    const overallNote = cartItems.map(item => item.note).filter(Boolean).join(' | ');

    // 🟢 บังคับใช้โครงสร้าง JSON Payload สากลแทนการส่ง FormData ป้องกันหลังบ้าน Render ค้นหาเส้นทาง Path ไม่เจอ
    const jsonPayload = {
      items: formattedItems,
      totalPrice: totalPrice,
      totalAmount: totalPrice,
      paymentMethod: paymentMethod,
      orderType: 'online',
      note: overallNote
    };

    // 🟢 ยิงเข้าตำแหน่ง API ออเดอร์หลักของเซิร์ฟเวอร์โดยตรง ดักตัดปัญหา /user/order หรือเครื่องหมายโคลอน : ทิ้งแบบถาวร
    await axios.post(`${API_URL}/api/orders`, jsonPayload, { headers });
    
    localStorage.removeItem('cart');
    setShowPaymentModal(false);
    setCartItems([]);
    window.dispatchEvent(new Event('storage'));
    
    Swal.fire({ 
      title: 'สำเร็จ!', 
      text: 'ส่งคำสั่งซื้อเรียบร้อยแล้ว', 
      icon: 'success', 
      timer: 2000, 
      showConfirmButton: false 
    }).then(() => { navigate('/status'); });

  } catch (err) {
    console.error("Order submit failed:", err);
    Swal.fire('สั่งซื้อไม่สำเร็จ', err.response?.data?.message || 'เกิดข้อผิดพลาดในการรับ-ส่งข้อมูลบนคลาวด์หลังบ้าน', 'error');
  } finally { setIsSubmitting(false); }
};
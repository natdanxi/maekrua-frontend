const handleWalkinCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;
    
    // 🟢 1. แปลงรูปแบบข้อมูลให้ตรงกับที่ Backend ต้องการเป๊ะๆ
    const formattedItems = cart.map(item => ({
      id: item.productId || item.id,
      quantity: item.qty,
      price: item.price,
      note: item.note || ''
    }));

    try {
      await axios.post(`${API_URL}/api/order-walkin`, { 
        items: formattedItems,      // เปลี่ยนจาก cart เป็น items
        totalPrice: cartTotal,      // เปลี่ยนจาก cartTotal เป็น totalPrice
        orderType: 'walkin', 
        paymentMethod: paymentMethod, 
        customerInfo: tableInfo || 'ลูกค้าหน้าร้าน' 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setCart([]); setTableInfo(''); fetchOrders(); 
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกยอดขายหน้าร้านเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) { 
      console.error(err);
      // 🟢 2. ให้แสดงข้อความ Error จาก Backend ออกมาให้เห็นชัดๆ เผื่อมีปัญหาอื่น
      Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error'); 
    }
  };
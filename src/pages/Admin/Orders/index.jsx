const handleWalkinCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;

    // 🟢 1. แปลงโครงสร้างตะกร้าให้เหมือนฝั่งออนไลน์เป๊ะๆ
    const formattedItems = cart.map(item => ({
      id: item.productId || item.id,
      product_id: item.productId || item.id,
      name: item.title || item.name || '',
      price: item.price,
      quantity: item.qty,
      note: item.note || ''
    }));

    try {
      // 🟢 2. เปลี่ยนมาใช้ FormData แบบเดียวกับตะกร้าลูกค้า เพื่อป้องกันบั๊กจาก Backend
      const formData = new FormData();
      formData.append('items', JSON.stringify(formattedItems));
      formData.append('totalPrice', cartTotal);
      formData.append('totalAmount', cartTotal);
      formData.append('orderType', 'walkin');
      formData.append('paymentMethod', paymentMethod);
      formData.append('customerInfo', tableInfo || 'ลูกค้าหน้าร้าน');
      // หมายเหตุ: ออเดอร์หน้าร้าน เราไม่ต้อง .append('slip') ระบบก็จะทำงานได้ปกติ

      const headers = { 
        Authorization: `Bearer ${token}` 
      };

      await axios.post(`${API_URL}/api/order-walkin`, formData, { headers });
      
      setCart([]); 
      setTableInfo(''); 
      fetchOrders(); 
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกยอดขายหน้าร้านเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) { 
      console.error("Checkout Error:", err);
      // 🟢 3. ดึงข้อความ Error มาแสดงให้ชัดเจนที่สุด เผื่อติดปัญหาอื่น
      const errorMsg = err.response?.data?.message || err.message || 'ไม่สามารถบันทึกข้อมูลได้';
      Swal.fire('เกิดข้อผิดพลาด', errorMsg, 'error'); 
    }
  };
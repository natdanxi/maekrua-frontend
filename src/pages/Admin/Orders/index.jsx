const handleWalkinCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;

    // 🟢 1. จัดโครงสร้างตะกร้าให้เป็น Object ที่สมบูรณ์
    const formattedItems = cart.map(item => ({
      id: parseInt(item.productId || item.id), 
      quantity: parseInt(item.qty),
      price: parseFloat(item.price),
      note: item.note || ''
    }));

    try {
      // 🟢 2. เปลี่ยนมาส่งเป็น JSON Payload ธรรมดา (ลบ FormData ออกให้หมด)
      const payload = { 
        items: formattedItems,      
        totalPrice: cartTotal,      
        orderType: 'walkin', 
        paymentMethod: paymentMethod, 
        customerInfo: tableInfo || 'ลูกค้าหน้าร้าน' 
      };

      const headers = { 
        Authorization: `Bearer ${token}` 
      };

      // Axios จะแปลง Payload เป็น JSON อัตโนมัติ ซึ่งปลอดภัยและไม่บั๊กแน่นอน
      await axios.post(`${API_URL}/api/order-walkin`, payload, { headers });
      
      setCart([]); 
      setTableInfo(''); 
      fetchOrders(); 
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกยอดขายหน้าร้านเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) { 
      console.error("Checkout Error:", err);
      // 🟢 3. ดึงข้อความ Error มาแสดงให้ชัดเจนที่สุด
      const errorMsg = err.response?.data?.message || err.message || 'ไม่สามารถบันทึกข้อมูลได้';
      Swal.fire('เกิดข้อผิดพลาด', errorMsg, 'error'); 
    }
  };
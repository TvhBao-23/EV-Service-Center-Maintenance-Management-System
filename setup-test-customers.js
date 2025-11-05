// Script để tạo dữ liệu test cho Customer, Vehicle, Booking và Records
// Chạy script này trong Console của browser tại trang Admin

console.log('🚀 Bắt đầu tạo dữ liệu test...')

// 1. Tạo test customers
const testCustomers = [
  {
    id: 'cust-001',
    fullName: 'Trần Vô Hoài Bảo',
    email: 'tranvhoaibao321@gmail.com',
    phone: '0901234567',
    address: 'TP. Hồ Chí Minh',
    role: 'customer',
    createdAt: new Date('2025-01-15').toISOString()
  },
  {
    id: 'cust-002',
    fullName: 'Nguyễn Thị B',
    email: 'nguyenthib@gmail.com',
    phone: '0907654321',
    address: 'Hà Nội',
    role: 'customer',
    createdAt: new Date('2025-02-20').toISOString()
  },
  {
    id: 'cust-003',
    fullName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0912345678',
    address: 'Đà Nẵng',
    role: 'customer',
    createdAt: new Date('2025-03-10').toISOString()
  }
]

// 2. Tạo test vehicles
const testVehicles = [
  // Xe của customer 1
  {
    id: 'veh-001',
    userId: 'cust-001',
    brand: 'Tesla',
    model: 'Model 3',
    licensePlate: '30A-12345',
    year: 2023,
    batteryCapacity: '75 kWh',
    status: 'active'
  },
  {
    id: 'veh-002',
    userId: 'cust-001',
    brand: 'VinFast',
    model: 'VF8',
    licensePlate: '30B-67890',
    year: 2024,
    batteryCapacity: '87.7 kWh',
    status: 'active'
  },
  // Xe của customer 2
  {
    id: 'veh-003',
    userId: 'cust-002',
    brand: 'Tesla',
    model: 'Model Y',
    licensePlate: '29A-11111',
    year: 2023,
    batteryCapacity: '75 kWh',
    status: 'active'
  },
  // Xe của customer 3
  {
    id: 'veh-004',
    userId: 'cust-003',
    brand: 'BYD',
    model: 'Atto 3',
    licensePlate: '43A-22222',
    year: 2024,
    batteryCapacity: '60.48 kWh',
    status: 'active'
  }
]

// 3. Tạo test bookings
const testBookings = [
  // Bookings của customer 1
  {
    id: 'book-001',
    vehicleId: 'veh-001',
    service: 'Bảo dưỡng định kỳ',
    date: new Date('2025-11-10').toISOString(),
    time: '09:00',
    status: 'done',
    estimatedPrice: 500000,
    notes: 'Kiểm tra hệ thống pin'
  },
  {
    id: 'book-002',
    vehicleId: 'veh-001',
    service: 'Thay lốp xe',
    date: new Date('2025-11-15').toISOString(),
    time: '14:00',
    status: 'in_maintenance',
    estimatedPrice: 2000000,
    notes: 'Thay bộ 4 lốp mới'
  },
  {
    id: 'book-003',
    vehicleId: 'veh-002',
    service: 'Kiểm tra tổng quát',
    date: new Date('2025-11-18').toISOString(),
    time: '10:00',
    status: 'received',
    estimatedPrice: 300000,
    notes: 'Kiểm tra trước chuyến đi dài'
  },
  // Bookings của customer 2
  {
    id: 'book-004',
    vehicleId: 'veh-003',
    service: 'Sửa chữa động cơ',
    date: new Date('2025-11-12').toISOString(),
    time: '08:00',
    status: 'done',
    estimatedPrice: 5000000,
    notes: 'Động cơ bị lỗi điện tử'
  },
  {
    id: 'book-005',
    vehicleId: 'veh-003',
    service: 'Bảo dưỡng pin',
    date: new Date('2025-11-20').toISOString(),
    time: '15:00',
    status: 'pending',
    estimatedPrice: 1500000,
    notes: 'Kiểm tra dung lượng pin'
  },
  // Bookings của customer 3
  {
    id: 'book-006',
    vehicleId: 'veh-004',
    service: 'Thay dầu phanh',
    date: new Date('2025-11-05').toISOString(),
    time: '11:00',
    status: 'done',
    estimatedPrice: 800000,
    notes: 'Dầu phanh đã cũ'
  }
]

// 4. Tạo test service records
const testRecords = [
  // Records của customer 1
  {
    id: 'rec-001',
    vehicleId: 'veh-001',
    service: 'Bảo dưỡng định kỳ',
    date: new Date('2025-10-01').toISOString(),
    cost: 500000,
    status: 'done',
    technician: 'Nguyễn Văn A',
    notes: 'Hoàn thành tốt'
  },
  {
    id: 'rec-002',
    vehicleId: 'veh-001',
    service: 'Kiểm tra hệ thống điện',
    date: new Date('2025-09-15').toISOString(),
    cost: 800000,
    status: 'done',
    technician: 'Trần Văn B',
    notes: 'Thay thế một số linh kiện điện'
  },
  {
    id: 'rec-003',
    vehicleId: 'veh-002',
    service: 'Bảo dưỡng định kỳ',
    date: new Date('2025-10-20').toISOString(),
    cost: 600000,
    status: 'done',
    technician: 'Lê Văn C',
    notes: 'Xe mới, không có vấn đề'
  },
  // Records của customer 2
  {
    id: 'rec-004',
    vehicleId: 'veh-003',
    service: 'Thay pin 12V',
    date: new Date('2025-08-10').toISOString(),
    cost: 2000000,
    status: 'done',
    technician: 'Phạm Văn D',
    notes: 'Pin cũ hết tuổi thọ'
  },
  {
    id: 'rec-005',
    vehicleId: 'veh-003',
    service: 'Bảo dưỡng phanh',
    date: new Date('2025-09-05').toISOString(),
    cost: 1200000,
    status: 'done',
    technician: 'Hoàng Văn E',
    notes: 'Thay má phanh trước'
  },
  // Records của customer 3
  {
    id: 'rec-006',
    vehicleId: 'veh-004',
    service: 'Kiểm tra tổng quát',
    date: new Date('2025-07-15').toISOString(),
    cost: 400000,
    status: 'done',
    technician: 'Đỗ Văn F',
    notes: 'Xe hoạt động bình thường'
  },
  {
    id: 'rec-007',
    vehicleId: 'veh-004',
    service: 'Vệ sinh điều hòa',
    date: new Date('2025-10-10').toISOString(),
    cost: 300000,
    status: 'done',
    technician: 'Võ Văn G',
    notes: 'Vệ sinh sạch sẽ'
  }
]

// 5. Lưu vào localStorage
function setupTestData() {
  try {
    // Lấy dữ liệu hiện tại
    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const currentVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]')
    const currentBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    const currentRecords = JSON.parse(localStorage.getItem('records') || '[]')

    // Merge với test data (không duplicate)
    const mergedUsers = [...currentUsers]
    testCustomers.forEach(customer => {
      if (!mergedUsers.find(u => u.id === customer.id)) {
        mergedUsers.push(customer)
      }
    })

    const mergedVehicles = [...currentVehicles]
    testVehicles.forEach(vehicle => {
      if (!mergedVehicles.find(v => v.id === vehicle.id)) {
        mergedVehicles.push(vehicle)
      }
    })

    const mergedBookings = [...currentBookings]
    testBookings.forEach(booking => {
      if (!mergedBookings.find(b => b.id === booking.id)) {
        mergedBookings.push(booking)
      }
    })

    const mergedRecords = [...currentRecords]
    testRecords.forEach(record => {
      if (!mergedRecords.find(r => r.id === record.id)) {
        mergedRecords.push(record)
      }
    })

    // Lưu vào localStorage
    localStorage.setItem('users', JSON.stringify(mergedUsers))
    localStorage.setItem('vehicles', JSON.stringify(mergedVehicles))
    localStorage.setItem('bookings', JSON.stringify(mergedBookings))
    localStorage.setItem('records', JSON.stringify(mergedRecords))

    // Trigger event để update UI
    window.dispatchEvent(new Event('local-bookings-updated'))
    window.dispatchEvent(new Event('storage'))

    console.log('✅ Đã tạo dữ liệu test thành công!')
    console.log(`📊 Thống kê:`)
    console.log(`   - Customers: ${testCustomers.length} mới`)
    console.log(`   - Vehicles: ${testVehicles.length} mới`)
    console.log(`   - Bookings: ${testBookings.length} mới`)
    console.log(`   - Records: ${testRecords.length} mới`)
    console.log(`\n🔄 Reload trang để thấy dữ liệu mới!`)
    
    return {
      success: true,
      data: {
        customers: testCustomers.length,
        vehicles: testVehicles.length,
        bookings: testBookings.length,
        records: testRecords.length
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu:', error)
    return { success: false, error: error.message }
  }
}

// Chạy setup
const result = setupTestData()

// Export để có thể gọi lại
window.setupTestData = setupTestData

// Hướng dẫn sử dụng
console.log(`
╔════════════════════════════════════════════════════════════╗
║  ✅ HƯỚNG DẪN SỬ DỤNG                                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. Copy toàn bộ file này                                 ║
║  2. Mở Console trong trang Admin (F12)                    ║
║  3. Paste và Enter                                        ║
║  4. Reload trang (F5)                                     ║
║  5. Vào tab "Khách hàng & Xe"                             ║
║  6. Bạn sẽ thấy 3 customers với đầy đủ dữ liệu           ║
║                                                            ║
║  📝 Để chạy lại: window.setupTestData()                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`)


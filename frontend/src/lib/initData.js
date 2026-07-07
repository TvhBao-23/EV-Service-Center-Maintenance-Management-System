// Initialize sample data for testing
export function initializeSampleData() {
  // Check if data already exists
  if (localStorage.getItem('users')) {
    return
  }

  // Create sample users
  const sampleUsers = [
    {
      id: 'user-1',
      fullName: 'Trần Võ Hoài Bảo',
      email: 'tranvohoaibao321@gmail.com',
      password: '123456',
      phone: '0909090909',
      role: 'customer',
      customerId: 'customer-1',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      dateOfBirth: '1995-01-01',
      emergencyContact: 'Nguyễn Văn A',
      emergencyPhone: '0987654321'
    },
    {
      id: 'user-2',
      fullName: 'Nguyễn Thị B',
      email: 'nguyenthib@gmail.com',
      password: '123456',
      phone: '0987654321',
      role: 'customer',
      customerId: 'customer-2',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      dateOfBirth: '1990-05-15',
      emergencyContact: 'Trần Văn C',
      emergencyPhone: '0912345678'
    }
  ]

  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(sampleUsers))
  
  console.log('Sample data initialized:', sampleUsers)
}

// Call this function when the app starts
initializeSampleData()

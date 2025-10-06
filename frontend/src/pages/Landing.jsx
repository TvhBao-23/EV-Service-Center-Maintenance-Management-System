import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold">EV Service Center</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Landing is public; keep login button here */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Quản lý bảo dưỡng xe điện{" "}
              <span className="text-green-600">thông minh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Theo dõi lịch sử bảo dưỡng, đặt lịch dịch vụ và quản lý chi phí cho xe điện của bạn - tất cả trong một nền tảng
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Bắt đầu ngay
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="p-3 rounded-md bg-green-100 w-fit mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h9v-2H4a2 2 0 01-2-2V5a2 2 0 012-2h9v2H4v14z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nhắc nhở thông minh</h3>
              <p className="text-gray-600">
                Nhận thông báo tự động về lịch bảo dưỡng định kỳ theo km hoặc thời gian
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="p-3 rounded-md bg-green-100 w-fit mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Đặt lịch dễ dàng</h3>
              <p className="text-gray-600">
                Đặt lịch bảo dưỡng và sửa chữa trực tuyến, chọn trung tâm dịch vụ phù hợp
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="p-3 rounded-md bg-green-100 w-fit mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quản lý chi phí</h3>
              <p className="text-gray-600">
                Theo dõi chi phí bảo dưỡng, lưu trữ lịch sử dịch vụ đầy đủ
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Tính năng nổi bật
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="p-2 rounded-md bg-gray-100 h-fit">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Quản lý nhiều xe</h4>
                    <p className="text-sm text-gray-600">
                      Theo dõi tất cả xe điện của bạn trong một tài khoản
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 rounded-md bg-gray-100 h-fit">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Gói bảo dưỡng định kỳ</h4>
                    <p className="text-sm text-gray-600">
                      Đăng ký gói dịch vụ tiết kiệm, nhận nhắc nhở gia hạn
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 rounded-md bg-gray-100 h-fit">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Theo dõi trạng thái</h4>
                    <p className="text-sm text-gray-600">
                      Cập nhật real-time: chờ → đang bảo dưỡng → hoàn tất
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-gray-100 rounded-lg p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-lg font-medium">Hệ thống quản lý chuyên nghiệp</p>
                <p className="text-gray-600">cho xe điện hiện đại</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>© 2025 EV Service Center. Hệ thống quản lý bảo dưỡng xe điện.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing

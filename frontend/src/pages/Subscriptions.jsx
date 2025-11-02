import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import subscriptionAPI from '../api/subscriptionAPI';

const Subscriptions = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' or 'my-subscriptions'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load packages (always works)
      try {
        const packagesData = await subscriptionAPI.getPackages();
        console.log('✅ Packages loaded:', packagesData);
        console.log('📦 Number of packages:', packagesData?.length);
        setPackages(packagesData);
      } catch (error) {
        console.error('❌ Error loading packages:', error);
        alert('Không thể tải danh sách gói dịch vụ: ' + error.message);
      }
      
      // Load subscriptions (may fail if user has none)
      try {
        console.log('🔄 Calling getMySubscriptions API...');
        const subscriptionsData = await subscriptionAPI.getMySubscriptions();
        console.log('📅 Subscriptions data received:', subscriptionsData);
        console.log('📅 Subscriptions count:', subscriptionsData?.length || 0);
        
        if (subscriptionsData && subscriptionsData.length > 0) {
          console.log('📅 First subscription full object:', subscriptionsData[0]);
          console.log('📅 First subscription dates:', {
            startDate: subscriptionsData[0].startDate,
            endDate: subscriptionsData[0].endDate,
            startDateType: typeof subscriptionsData[0].startDate,
            endDateType: typeof subscriptionsData[0].endDate
          });
        } else {
          console.warn('⚠️ No subscriptions found or empty array returned');
        }
        setMySubscriptions(subscriptionsData || []);
      } catch (error) {
        console.error('❌❌❌ Error loading subscriptions:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
        // Don't show error for subscriptions - user may have none
        setMySubscriptions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (!confirm('Bạn có chắc muốn đăng ký gói dịch vụ này?')) {
      return;
    }

    try {
      await subscriptionAPI.subscribe(packageId);
      alert('Đăng ký gói dịch vụ thành công!');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Không thể đăng ký: ' + error.message);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Bạn có chắc muốn hủy gói dịch vụ này?')) {
      return;
    }

    try {
      await subscriptionAPI.cancelSubscription(subscriptionId);
      alert('Hủy gói dịch vụ thành công!');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Không thể hủy gói: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
      EXPIRED: { label: 'Hết hạn', color: 'bg-red-100 text-red-800' },
      EXHAUSTED: { label: 'Đã dùng hết', color: 'bg-orange-100 text-orange-800' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log('📅 formatDate: No date provided');
      return 'N/A';
    }
    try {
      console.log('📅 formatDate input:', dateString, typeof dateString);
      const date = new Date(dateString);
      console.log('📅 formatDate parsed:', date, 'isValid:', !isNaN(date.getTime()));
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date:', dateString);
        return 'Invalid Date';
      }
      const formatted = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      console.log('📅 formatDate result:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const parseBenefits = (benefitsString) => {
    if (!benefitsString) return [];
    return benefitsString.split(',').map(b => b.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Gói Dịch Vụ</h2>

          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('packages')}
                className={`${
                  activeTab === 'packages'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Gói dịch vụ có sẵn
              </button>
              <button
                onClick={() => setActiveTab('my-subscriptions')}
                className={`${
                  activeTab === 'my-subscriptions'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Gói của tôi ({mySubscriptions.length})
              </button>
            </nav>
          </div>

          {/* Available Packages Tab */}
          {activeTab === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Không có gói dịch vụ nào
                </div>
              )}
              {packages.map((pkg) => (
                <div
                  key={pkg.packageId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-green-600">
                        {Number(pkg.price).toLocaleString('vi-VN')} VNĐ
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.durationMonths} tháng • {pkg.servicesIncluded} dịch vụ
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Quyền lợi:</h4>
                      <ul className="space-y-1">
                        {parseBenefits(pkg.benefits).map((benefit, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSubscribe(pkg.packageId)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Subscriptions Tab */}
          {activeTab === 'my-subscriptions' && (
            <div>
              {mySubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gói dịch vụ nào</h3>
                  <p className="text-gray-600 mb-4">Đăng ký gói dịch vụ để nhận nhiều ưu đãi</p>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xem gói dịch vụ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mySubscriptions.map((sub) => (
                    <div key={sub.subscriptionId} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{sub.servicePackage.name}</h3>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ngày bắt đầu:</span>
                          <span className="font-medium">{formatDate(sub.startDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ngày hết hạn:</span>
                          <span className="font-medium">{formatDate(sub.endDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dịch vụ đã sử dụng:</span>
                          <span className="font-medium">
                            {sub.servicesUsed} / {sub.servicePackage.servicesIncluded}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(sub.servicesUsed / sub.servicePackage.servicesIncluded) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      {sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelSubscription(sub.subscriptionId)}
                          className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          Hủy gói
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
    </div>
  );
};

export default Subscriptions;


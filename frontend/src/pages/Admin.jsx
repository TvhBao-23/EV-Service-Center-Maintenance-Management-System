// src/pages/Admin.jsx

import { useEffect, useMemo, useState } from "react";
import { getCurrentUserId, loadList } from "../lib/store";

// Sửa đường dẫn import
import CustomerManagementTab from "../components/CustomerManagementTab";
// Sửa import: Lấy adminAPI từ lib/api.js
import { adminAPI } from "../lib/api.js";

function Admin() {
  const userId = useMemo(() => getCurrentUserId(), []);
  const [activeTab, setActiveTab] = useState("dashboard");

  // State thống nhất: `customers` (từ API) sẽ được dùng cho cả Dashboard và Tab
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // State cho các tab khác (tạm thời vẫn dùng localStorage)
  const [bookings, setBookings] = useState([]);
  const [records, setRecords] = useState([]);
  const [parts, setParts] = useState([]);
  const [assignments, setAssignments] = useState([]);


  const [staffAndTechForDashboard, setStaffAndTechForDashboard] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Tải dữ liệu khách hàng từ API (đã có auth token)
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const data = await adminAPI.getCustomers(); // Gọi hàm API mới
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
      setIsLoadingCustomers(false);
    };
    fetchCustomers();

    // Tạm thời tải `users` (để lấy staff/tech) và các list khác cho Dashboard
    try {
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      setStaffAndTechForDashboard(
        allUsers.filter(
          (u) =>
            u.role === "staff" ||
            u.role === "technican" ||
            u.role === "technician"
        )
      );
    } catch (e) { console.error(e); }

    setBookings(loadList("bookings", []));
    setRecords(loadList("records", []));
    setParts(loadList("parts", []));
    setAssignments(loadList("assignments", []));
  }, [userId]);

  // Hàm refresh data (chỉ tải lại customers)
  const refreshCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await adminAPI.getCustomers(); // Gọi hàm API mới
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
    setIsLoadingCustomers(false);
  };

  // Dashboard Statistics (Logic tính toán đã được cập nhật ở câu trả lời trước)
  const dashboardStats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalVehicles = customers.reduce( (sum, c) => sum + (c.vehicleCount || 0), 0 );
    const totalStaff = staffAndTech.filter((u) => u.role === "staff").length;
    const totalTechnicians = staffAndTech.filter( (u) => u.role === "technican" || u.role === "technician" ).length;
    // ... (logic tính toán còn lại giữ nguyên)
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const activeBookings = bookings.filter((b) => ["received", "in_maintenance"].includes(b.status)).length;
    const completedBookings = bookings.filter((b) => b.status === "done").length;
    const completedRecords = records.filter( (r) => r.status === "done" || r.status === "Hoàn tất" );
    const totalRevenue = completedRecords.reduce( (sum, r) => sum + (Number(r.cost) || 0), 0 );
    const pendingPayments = bookings.filter((b) => b.status === "pending").reduce((sum, b) => sum + (Number(b.estimatedPrice) || 0), 0);
    const lowStockParts = parts.filter( (p) => (Number(p.currentStock) || 0) <= (Number(p.minStock) || 0) );
    const totalPartsValue = parts.reduce( (sum, p) => sum + (Number(p.currentStock) || 0) * (Number(p.price) || 0), 0 );

    return { totalCustomers, totalVehicles, totalStaff, totalTechnicians, totalBookings, pendingBookings, activeBookings, completedBookings, totalRevenue, pendingPayments, lowStockParts: lowStockParts.length, totalPartsValue, };
  }, [customers, bookings, records, parts, staffAndTechForDashboard]);

  // Recent activities (Logic tính toán giữ nguyên)
  const recentActivities = useMemo(() => {
      const activities = [];
      const localVehicles = loadList("vehicles", []);
      bookings.slice(-5).forEach((booking) => { /*...*/ });
      records.filter((r) => r.status === "done" || r.status === "Hoàn tất").slice(-3).forEach((record) => { /*...*/ });
      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [bookings, records]);


  const tabs = [
    { id: "dashboard", label: "Tổng quan", icon: "📊" },
    { id: "customers", label: "Khách hàng & Xe", icon: "👥" },
    { id: "staff", label: "Nhân sự", icon: "👨‍💼" },
    { id: "bookings", label: "Lịch hẹn & Dịch vụ", icon: "📅" },
    { id: "parts", label: "Phụ tùng", icon: "🔧" },
    { id: "finance", label: "Tài chính", icon: "💰" },
    { id: "reports", label: "Báo cáo", icon: "📈" },
  ];

  // (renderDashboard, renderStaff, renderBookings, renderParts, renderFinance, renderReports
  // giữ nguyên code như trong file bạn cung cấp, chỉ cập nhật phần hiển thị metrics)

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
                {/* Icon */}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng khách hàng (API)</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalCustomers}</p>
                </div>
            </div>
         </div>
         <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
                 {/* Icon */}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng xe (API)</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalVehicles}</p>
                </div>
            </div>
         </div>
         {/* Các metrics khác (Lịch đặt, Doanh thu) */}
         <div className="bg-white rounded-lg shadow-md p-6">{/* Lịch đặt */}</div>
         <div className="bg-white rounded-lg shadow-md p-6">{/* Doanh thu */}</div>
      </div>
      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">{/* Trạng thái dịch vụ */}</div>
          <div className="bg-white rounded-lg shadow-md p-6">{/* Nhân sự */}</div>
      </div>
       {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">{/* Hoạt động gần đây */}</div>
    </div>
  );
  // (Các hàm render khác giữ nguyên như file gốc bạn cung cấp)
  const renderBookings = () => ( <div className="space-y-6">{/* ... */}</div> );
  const renderParts = () => ( <div className="space-y-6">{/* ... */}</div> );
  const renderFinance = () => ( <div className="space-y-6">{/* ... */}</div> );
  const renderReports = () => ( <div className="space-y-6">{/* ... */}</div> );


  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "customers":
        return (
          <CustomerManagementTab
            customers={customers}
            isLoading={isLoadingCustomers}
            onRefresh={refreshCustomers}
          />
        );
      case "staff":
        return <StaffManagementTab />;
      case "bookings": return renderBookings();
      case "parts": return renderParts();
      case "finance": return renderFinance();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý hệ thống EV Service Center
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}

export default Admin;
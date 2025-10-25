import { useEffect, useMemo, useState } from "react";
import { getCurrentUserId, loadList } from "../lib/store";

import CustomerManagementTab from "./CustomerManagementTab"; // Component mới
import { getCustomers } from "./apiServices";

function Admin() {
  const userId = useMemo(() => getCurrentUserId(), []);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [records, setRecords] = useState([]);
  const [parts, setParts] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  useEffect(() => {
    if (!userId) return;
    // --- THÊM MỚI ---
    // Tải dữ liệu khách hàng từ API cho tab "Khách hàng & Xe"
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const data = await getCustomers(); // Gọi API
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
      setIsLoadingCustomers(false);
    };
    fetchCustomers();
    setUsers(JSON.parse(localStorage.getItem("users") || "[]"));
    setVehicles(loadList("vehicles", []));
    setBookings(loadList("bookings", []));
    setRecords(loadList("records", []));
    setParts(loadList("parts", []));
    setAssignments(loadList("assignments", []));
  }, [userId]);

  const refreshCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
    setIsLoadingCustomers(false);
  };

  // Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const totalCustomers = users.filter(
      (u) => u.role === "customer" || !u.role
    ).length;
    const totalStaff = users.filter((u) => u.role === "staff").length;
    const totalTechnicians = users.filter(
      (u) => u.role === "technican" || u.role === "technician"
    ).length;
    const totalVehicles = vehicles.length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "pending"
    ).length;
    const activeBookings = bookings.filter((b) =>
      ["received", "in_maintenance"].includes(b.status)
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === "done"
    ).length;

    // Financial stats
    const completedRecords = records.filter(
      (r) => r.status === "done" || r.status === "Hoàn tất"
    );
    const totalRevenue = completedRecords.reduce(
      (sum, r) => sum + (Number(r.cost) || 0),
      0
    );
    const pendingPayments = bookings
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + (Number(b.estimatedPrice) || 0), 0);

    // Parts inventory
    const lowStockParts = parts.filter(
      (p) => (Number(p.currentStock) || 0) <= (Number(p.minStock) || 0)
    );
    const totalPartsValue = parts.reduce(
      (sum, p) => sum + (Number(p.currentStock) || 0) * (Number(p.price) || 0),
      0
    );

    return {
      totalCustomers,
      totalStaff,
      totalTechnicians,
      totalVehicles,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      pendingPayments,
      lowStockParts: lowStockParts.length,
      totalPartsValue,
    };
  }, [users, vehicles, bookings, records, parts]);

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities = [];

    // Recent bookings
    bookings.slice(-5).forEach((booking) => {
      const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
      activities.push({
        id: `booking-${booking.id}`,
        type: "booking",
        title: `Đặt lịch mới: ${vehicle?.model || "N/A"}`,
        description: `${booking.serviceType} - ${booking.date} ${booking.time}`,
        status: booking.status,
        timestamp: new Date(booking.createdAt || Date.now()),
      });
    });

    // Recent completed services
    records
      .filter((r) => r.status === "done" || r.status === "Hoàn tất")
      .slice(-3)
      .forEach((record) => {
        activities.push({
          id: `record-${record.id}`,
          type: "completion",
          title: `Hoàn thành dịch vụ: ${record.vehicleModel || record.vehicle}`,
          description: `${record.serviceType || record.service} - ${Number(
            record.cost || 0
          ).toLocaleString()} VNĐ`,
          status: "completed",
          timestamp: new Date(record.date),
        });
      });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [bookings, vehicles, records]);

  const tabs = [
    { id: "dashboard", label: "Tổng quan", icon: "📊" },
    { id: "customers", label: "Khách hàng & Xe", icon: "👥" },
    { id: "staff", label: "Nhân sự", icon: "👨‍💼" },
    { id: "bookings", label: "Lịch hẹn & Dịch vụ", icon: "📅" },
    { id: "parts", label: "Phụ tùng", icon: "🔧" },
    { id: "finance", label: "Tài chính", icon: "💰" },
    { id: "reports", label: "Báo cáo", icon: "📈" },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Tổng khách hàng
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">🚗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng xe</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.totalVehicles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lịch đặt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.totalRevenue.toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trạng thái dịch vụ
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chờ tiếp nhận</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {dashboardStats.pendingBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đang bảo dưỡng</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {dashboardStats.activeBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoàn tất</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {dashboardStats.completedBookings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhân sự</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nhân viên</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {dashboardStats.totalStaff}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kỹ thuật viên</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {dashboardStats.totalTechnicians}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng nhân sự</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {dashboardStats.totalStaff + dashboardStats.totalTechnicians}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Chưa có hoạt động nào
            </p>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "booking"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        activity.type === "booking"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {activity.type === "booking" ? "📅" : "✅"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === "pending"
                        ? "bg-gray-100 text-gray-800"
                        : activity.status === "received"
                        ? "bg-blue-100 text-blue-800"
                        : activity.status === "in_maintenance"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {activity.status === "pending"
                      ? "Chờ"
                      : activity.status === "received"
                      ? "Tiếp nhận"
                      : activity.status === "in_maintenance"
                      ? "Đang làm"
                      : "Hoàn tất"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quản lý khách hàng & xe
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Chi phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter((u) => u.role === "customer" || !u.role)
                .map((user) => {
                  const userVehicles = vehicles.filter(
                    (v) => v.userId === user.id
                  );
                  const userBookings = bookings.filter((b) =>
                    userVehicles.some((v) => v.id === b.vehicleId)
                  );
                  const userRecords = records.filter((r) =>
                    userVehicles.some((v) => v.id === r.vehicleId)
                  );
                  const totalCost = userRecords
                    .filter(
                      (r) => r.status === "done" || r.status === "Hoàn tất"
                    )
                    .reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userVehicles.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userBookings.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {totalCost.toLocaleString()} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Xem
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Chat
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nhân viên
          </h3>
          <div className="space-y-3">
            {users
              .filter((u) => u.role === "staff")
              .map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {staff.fullName}
                    </p>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">
                      Chỉnh sửa
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Kỹ thuật viên
          </h3>
          <div className="space-y-3">
            {users
              .filter((u) => u.role === "technican" || u.role === "technician")
              .map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tech.fullName}</p>
                    <p className="text-sm text-gray-600">{tech.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">
                      Chỉnh sửa
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quản lý lịch hẹn & dịch vụ
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                const vehicle = vehicles.find(
                  (v) => v.id === booking.vehicleId
                );
                const user = users.find((u) => vehicle?.userId === u.id);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle?.model || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.date} {booking.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "pending"
                            ? "bg-gray-100 text-gray-800"
                            : booking.status === "received"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "in_maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {booking.status === "pending"
                          ? "Chờ tiếp nhận"
                          : booking.status === "received"
                          ? "Đã tiếp nhận"
                          : booking.status === "in_maintenance"
                          ? "Đang bảo dưỡng"
                          : "Hoàn tất"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Xem
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderParts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quản lý phụ tùng
        </h3>
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Phụ tùng sắp hết:{" "}
            <span className="font-semibold text-red-600">
              {dashboardStats.lowStockParts}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Tổng giá trị:{" "}
            <span className="font-semibold text-green-600">
              {dashboardStats.totalPartsValue.toLocaleString()} VNĐ
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên phụ tùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tối thiểu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parts.map((part) => {
                const isLowStock =
                  (Number(part.currentStock) || 0) <=
                  (Number(part.minStock) || 0);
                return (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {part.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part.currentStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {part.minStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(part.price || 0).toLocaleString()} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isLowStock
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isLowStock ? "Sắp hết" : "Đủ hàng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Sửa
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Nhập kho
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tài chính tổng quan
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doanh thu đã thu</span>
              <span className="text-lg font-semibold text-green-600">
                {dashboardStats.totalRevenue.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chờ thanh toán</span>
              <span className="text-lg font-semibold text-orange-600">
                {dashboardStats.pendingPayments.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Tổng giá trị phụ tùng
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {dashboardStats.totalPartsValue.toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê dịch vụ
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng dịch vụ</span>
              <span className="text-lg font-semibold text-gray-900">
                {dashboardStats.totalBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoàn tất</span>
              <span className="text-lg font-semibold text-green-600">
                {dashboardStats.completedBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đang xử lý</span>
              <span className="text-lg font-semibold text-yellow-600">
                {dashboardStats.activeBookings}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Báo cáo & Thống kê
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Báo cáo doanh thu</h4>
            <p className="text-sm text-gray-600 mt-1">
              Xuất báo cáo doanh thu theo tháng/quý
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Thống kê dịch vụ</h4>
            <p className="text-sm text-gray-600 mt-1">
              Phân tích loại dịch vụ phổ biến
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Báo cáo phụ tùng</h4>
            <p className="text-sm text-gray-600 mt-1">
              Thống kê tiêu hao và đề xuất nhập kho
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Hiệu suất nhân sự</h4>
            <p className="text-sm text-gray-600 mt-1">
              Đánh giá hiệu suất làm việc
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Khách hàng VIP</h4>
            <p className="text-sm text-gray-600 mt-1">
              Danh sách khách hàng có giá trị cao
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Xu hướng hỏng hóc</h4>
            <p className="text-sm text-gray-600 mt-1">
              Phân tích các lỗi thường gặp
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case 'customers': 
            return (
                <CustomerManagementTab 
                    customers={customers}
                    isLoading={isLoadingCustomers}
                    onRefresh={refreshCustomers}
                />
            )
      case "staff":
        return renderStaff();
      case "bookings":
        return renderBookings();
      case "parts":
        return renderParts();
      case "finance":
        return renderFinance();
      case "reports":
        return renderReports();
      default:
        return renderDashboard();
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

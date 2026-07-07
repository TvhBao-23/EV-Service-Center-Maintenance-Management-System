import { useState, useEffect } from 'react';
import { formatDate, toDateObject, isValidDate } from '../utils/dateUtils.js';

const MaintenanceTimeline = ({ appointments, vehicles, services, serviceCenters = [] }) => {
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    // Combine and sort appointments by date
    const sortedAppointments = [...appointments]
      .filter(apt => {
        // Validate date - support both appointmentDate and requestedDateTime
        const dateValue = apt.appointmentDate || apt.requestedDateTime;
        const isValid = isValidDate(dateValue);
        
        // Log invalid dates for debugging
        if (!isValid && dateValue) {
          console.warn('[MaintenanceTimeline] Invalid date detected:', {
            appointmentId: apt.appointmentId,
            dateValue,
            message: 'This appointment will be filtered out'
          });
        }
        
        return isValid;
      })
      .sort((a, b) => {
        const dateA = toDateObject(a.appointmentDate || a.requestedDateTime);
        const dateB = toDateObject(b.appointmentDate || b.requestedDateTime);
        return dateB - dateA;
      });

    // Group by month/year
    const grouped = sortedAppointments.reduce((acc, apt) => {
      const dateValue = apt.appointmentDate || apt.requestedDateTime;
      const date = toDateObject(dateValue);
      
      // Double-check if date is valid (should always be true due to filter above)
      if (!date) {
        console.warn('Invalid date for appointment:', apt);
        return acc;
      }
      
      // Safe date formatting with fallback
      const monthYear = formatDate(dateValue, { month: 'long', year: 'numeric' }) || 'Tháng không xác định';
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push({
        ...apt,
        vehicle: vehicles.find(v => v.vehicleId === apt.vehicleId),
        service: services.find(s => s.serviceId === apt.serviceId),
        center: serviceCenters.find(c => c.centerId === apt.centerId),
      });
      
      return acc;
    }, {});

    setTimelineData(Object.entries(grouped));
  }, [appointments, vehicles, services, serviceCenters]);

  const getStatusIcon = (status) => {
    const icons = {
      completed: (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ),
    };
    return icons[status] || icons.completed;
  };

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Chưa có lịch sử bảo dưỡng</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {timelineData.map(([monthYear, items], groupIndex) => (
        <div key={groupIndex}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
            {monthYear}
          </h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Icon */}
                  <div className="relative z-10">
                    {getStatusIcon(item.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.service?.name || 'Dịch vụ không xác định'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.vehicle?.brand || 'N/A'} {item.vehicle?.model || ''} - {item.vehicle?.licensePlate || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(item.appointmentDate || item.requestedDateTime) || 'Ngày không xác định'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(item.appointmentDate || item.requestedDateTime, { timeOnly: true }) || ''}
                        </div>
                      </div>
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: appointmentDate={JSON.stringify(item.appointmentDate)}, 
                          requestedDateTime={JSON.stringify(item.requestedDateTime)}
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Ghi chú:</span> {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {item.center?.name || item.centerName || 'Trung tâm không xác định'}
                        </span>
                      </div>
                      
                      {item.service?.price && (
                        <div className="text-sm font-semibold text-green-600">
                          {Number(item.service.price).toLocaleString('vi-VN')} VNĐ
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceTimeline;


/**
 * Utility functions cho Staff page
 */

/**
 * Get customer name by ID
 */
export const getCustomerName = (customerId, customers) => {
  const customer = customers.find(c => c.id === customerId)
  return customer ? customer.fullName || customer.email : 'N/A'
}

/**
 * Get vehicle info by ID
 */
export const getVehicleInfo = (vehicleId, vehicles) => {
  const vehicle = vehicles.find(v => v.id === vehicleId)
  return vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : 'N/A'
}

/**
 * Get technician name by ID
 */
export const getTechnicianName = (techId, technicians) => {
  const tech = technicians.find(t => t.id === techId)
  return tech ? tech.fullName || tech.email : 'N/A'
}

/**
 * Get service name by ID
 */
export const getServiceName = (serviceId, services) => {
  const service = services.find(s => s.id === serviceId)
  return service ? service.name : serviceId ? `Dịch vụ #${serviceId}` : 'N/A'
}

/**
 * Get user phone by customer ID (synchronous version)
 */
export const getUserPhoneSync = (customerId, customers, users) => {
  const customer = customers.find(c => c.id === customerId)
  if (!customer) return 'N/A'
  if (customer.phone) return customer.phone
  const user = users.find(u => u.id === customer.userId)
  return user?.phone || 'N/A'
}

/**
 * Check if appointment is assigned to a technician
 */
export const isAppointmentAssigned = (appointmentId, serviceOrders) => {
  const serviceOrder = serviceOrders.find(so => so.appointmentId === appointmentId)
  return serviceOrder && 
         serviceOrder.assignedTechnicianId && 
         serviceOrder.assignedTechnicianId !== null && 
         serviceOrder.assignedTechnicianId !== 0
}

/**
 * Filter appointments by status and search term
 */
export const filterAppointments = (appointments, statusFilter, searchTerm) => {
  let filtered = [...appointments]

  // Status filter
  if (statusFilter === 'needs_action') {
    filtered = filtered.filter(appt => appt.status === 'confirmed' || appt.status === 'received')
  } else if (statusFilter !== 'all') {
    filtered = filtered.filter(appt => appt.status === statusFilter)
  }

  // Search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    filtered = filtered.filter(appt => {
      const customerName = getCustomerName(appt.customerId, [])
      const vehicleInfo = getVehicleInfo(appt.vehicleId, [])
      return (
        appt.id.toString().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        vehicleInfo.toLowerCase().includes(searchLower)
      )
    })
  }

  return filtered
}


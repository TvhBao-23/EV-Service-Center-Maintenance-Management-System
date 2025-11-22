import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { customerAPI, maintenanceAPI } from '../lib/api.js'
import { loadList, loadGlobalList } from '../lib/store.js'
import MaintenanceTimeline from '../components/MaintenanceTimeline.jsx'
import { formatDate, toDateObject, isValidDate } from '../utils/dateUtils.js'

function Tracking() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'timeline'
  const [services, setServices] = useState([])
  const [serviceCenters, setServiceCenters] = useState([])
  const [selectedNote, setSelectedNote] = useState(null) // For note detail modal
  const [showNoteModal, setShowNoteModal] = useState(false) // For note detail modal
  const [serviceOrders, setServiceOrders] = useState([]) // Service orders to check completion status

  const params = new URLSearchParams(location.search)
  const success = params.get('success') === '1'

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()

    // Listen for real-time updates from Admin
    const handleGlobalBookingsUpdate = (event) => {
      console.log('[Tracking] Received bookings update event:', event.type, event.detail)
      setTimeout(() => {
        loadData()
      }, 100) // Small delay to ensure localStorage is updated
    }

    const handleStorageUpdate = (event) => {
      // Only reload if bookings key changed, don't reload vehicles
      if (event.key === 'bookings' || event.key === null) {
        console.log('[Tracking] Received storage update for bookings')
        setTimeout(() => {
          // Only reload appointments, not vehicles
          const localVehicles = loadList('vehicles', [])
          const globalBookings = loadGlobalList('bookings', [])
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          
          // Filter by userId first, then vehicleId
          const userBookings = globalBookings.filter(booking => {
            if (booking.userId) {
              return booking.userId === currentUser.id
            }
            const userVehicleIds = localVehicles.map(v => v.vehicleId || v.id)
            return userVehicleIds.includes(booking.vehicleId)
          })
          const mappedAppointments = userBookings.map(booking => {
            // Handle date conversion for localStorage bookings
            const dateValue = booking.appointmentDate || booking.requestedDateTime
            const parsedDate = toDateObject(dateValue)
            const finalDateValue = parsedDate ? parsedDate.toISOString() : null
            
            return {
              ...booking,
              appointmentId: booking.appointmentId,
              vehicleId: booking.vehicleId,
              appointmentDate: finalDateValue,
              requestedDateTime: finalDateValue,
              notes: booking.notes,
              status: mapAdminStatusToTracking(booking.status)
            }
          })
          setAppointments(mappedAppointments)
          console.log('[Tracking] Updated appointments only, vehicles unchanged')
        }, 100)
      }
    }

    window.addEventListener('local-bookings-updated', handleGlobalBookingsUpdate)
    window.addEventListener('storage', handleStorageUpdate)
    
    console.log('[Tracking] Event listeners registered')

    return () => {
      window.removeEventListener('local-bookings-updated', handleGlobalBookingsUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
      console.log('[Tracking] Event listeners removed')
    }
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      console.log('[Tracking] Loading data...')
      
      // Load vehicles - API only
      const localVehicles = await customerAPI.getVehicles()
      console.log('[Tracking] User vehicles from API:', localVehicles)
      setVehicles(localVehicles)

      // Load appointments - API only
      const userBookings = await customerAPI.getAppointments()
      console.log('[Tracking] Appointments from API:', userBookings)
      
      // Log first appointment in detail to see structure
      if (userBookings && userBookings.length > 0) {
        console.log('[Tracking] First appointment detail:', JSON.stringify(userBookings[0], null, 2))
      }
      
      // Load services for timeline
      const servicesData = await customerAPI.getServices()
      setServices(servicesData)

      // Load service centers
      const centersData = await customerAPI.getServiceCenters()
      console.log('[Tracking] Service centers from API:', centersData)
      setServiceCenters(centersData)

      // Load service orders to check completion status
      let serviceOrdersData = []
      try {
        serviceOrdersData = await maintenanceAPI.getServiceOrders().catch(() => [])
        console.log('[Tracking] Service orders from API:', serviceOrdersData)
      } catch (err) {
        console.warn('[Tracking] Failed to load service orders:', err)
      }
      setServiceOrders(serviceOrdersData || [])

      // Map status from Admin format to Tracking format
      const mappedAppointments = userBookings.map(booking => {
        // Handle date field - API might return appointmentDate, requestedDateTime, or requested_date_time
        const dateValue = booking.appointmentDate || booking.requestedDateTime || booking.requested_date_time
        
        // Debug logging
        console.log('[Tracking] Processing appointment:', {
          appointmentId: booking.appointmentId,
          dateValue,
          dateValueType: typeof dateValue,
          isArray: Array.isArray(dateValue)
        })
        
        // Parse the date to Date object for consistent handling
        const parsedDate = toDateObject(dateValue)
        
        // Log the result
        if (!parsedDate && dateValue) {
          console.warn('[Tracking] Invalid date detected for appointment:', {
            appointmentId: booking.appointmentId,
            dateValue,
            willUseNull: true
          })
        }
        
        // Convert to ISO string for consistent storage
        // This ensures all date operations work correctly
        const finalDateValue = parsedDate ? parsedDate.toISOString() : null
        
        // Map centerId to centerName
        const center = centersData.find(c => c.centerId === booking.centerId)
        const centerName = center ? center.name : 'Trung tâm không xác định'
        
        // Check if there's a service order for this appointment and use its status if completed
        const appointmentId = booking.appointmentId || booking.id
        const serviceOrder = serviceOrdersData.find(so => 
          so.appointmentId === appointmentId || 
          so.appointment_id === appointmentId
        )
        
        // If service order is completed, override appointment status to completed
        let finalStatus = mapAdminStatusToTracking(booking.status)
        if (serviceOrder) {
          const orderStatus = (serviceOrder.status || '').toLowerCase()
          if (orderStatus === 'completed' || orderStatus === 'done') {
            finalStatus = 'completed'
            console.log('[Tracking] Overriding appointment status to completed based on service order:', {
              appointmentId,
              orderId: serviceOrder.orderId || serviceOrder.id,
              orderStatus
            })
          }
        }
        
        return {
          ...booking,
          appointmentId: booking.appointmentId,
          vehicleId: booking.vehicleId,
          centerId: booking.centerId,
          centerName: centerName,
          // Store both appointmentDate and requestedDateTime for compatibility
          // Use ISO string format for consistent date handling
          appointmentDate: finalDateValue,
          requestedDateTime: finalDateValue,
          notes: booking.notes,
          status: finalStatus
        }
      })

      setAppointments(mappedAppointments)
      console.log('[Tracking] Mapped appointments set to state:', mappedAppointments)
      
      // Log first mapped appointment in detail
      if (mappedAppointments && mappedAppointments.length > 0) {
        console.log('[Tracking] First mapped appointment detail:', JSON.stringify(mappedAppointments[0], null, 2))
      }
    } catch (error) {
      console.error('[Tracking] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Map Admin status format to Tracking status format
  const mapAdminStatusToTracking = (adminStatus) => {
    if (!adminStatus) return 'pending'
    
    const status = String(adminStatus).toUpperCase()
    const statusMap = {
      'PENDING': 'pending',
      'RECEIVED': 'confirmed',  // received maps to confirmed for customer view
      'IN_MAINTENANCE': 'in_maintenance',
      'IN_PROGRESS': 'in_maintenance',  // in_progress maps to in_maintenance
      'DONE': 'completed',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    }
    
    // If it's already in the mapped format, return as is
    const lowerStatus = adminStatus.toLowerCase()
    if (['pending', 'received', 'confirmed', 'in_maintenance', 'in_progress', 'completed', 'done', 'cancelled'].includes(lowerStatus)) {
      // Map received to confirmed for consistency
      if (lowerStatus === 'received') return 'confirmed'
      if (lowerStatus === 'in_progress') return 'in_maintenance'
      if (lowerStatus === 'done') return 'completed'
      return lowerStatus
    }
    
    return statusMap[status] || 'pending'
  }

  const currentAppointment = useMemo(() => {
    if (!appointments.length) return null
    // Find pending or confirmed appointments
    const activeAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed')
    if (activeAppointments.length > 0) {
      return activeAppointments.sort((a,b)=> toDateObject(b.requestedDateTime) - toDateObject(a.requestedDateTime))[0]
    }
    return appointments.sort((a,b)=> toDateObject(b.requestedDateTime) - toDateObject(a.requestedDateTime))[0] || null
  }, [appointments])

  const currentVehicle = useMemo(() => {
    if (!currentAppointment) return null
    return vehicles.find(v => v.vehicleId === currentAppointment.vehicleId) || null
  }, [vehicles, currentAppointment])

  const activeAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  }, [appointments])

  // Filtered and sorted appointments for the table
  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    // Sort appointments
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return toDateObject(b.requestedDateTime) - toDateObject(a.requestedDateTime)
        case 'status':
          const statusOrder = { 'pending': 0, 'confirmed': 1, 'completed': 2, 'cancelled': 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    return filtered
  }, [appointments, filterStatus, sortBy])

  // Payment reminders for service plans
  const paymentReminders = useMemo(() => {
    const pendingAppointments = appointments.filter(a => a.status === 'pending')
    
    // Calculate total amount from actual service prices
    let totalAmount = 0
    pendingAppointments.forEach(appointment => {
      // Try to find the service for this appointment
      const serviceId = appointment.serviceId || appointment.service_id
      if (serviceId && services.length > 0) {
        const service = services.find(s => 
          (s.serviceId || s.service_id) === serviceId
        )
        if (service) {
          const price = service.basePrice || service.base_price || 0
          totalAmount += Number(price) || 0
        } else {
          // If service not found, use default amount
          totalAmount += 750000
        }
      } else {
        // If no serviceId or services not loaded, use default amount
        totalAmount += 750000
      }
    })
    
    return {
      count: pendingAppointments.length,
      totalAmount,
      hasReminders: pendingAppointments.length > 0
    }
  }, [appointments, services])

  // AI-powered Smart reminders: periodic maintenance by km or time
  // Improved algorithm with better KM calculation, EV support, and historical analysis
  const reminders = useMemo(() => {
    if (!vehicles.length) return []
    
    // Configuration constants
    const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6 // 6 months
    const DUE_SOON_MS = 1000 * 60 * 60 * 24 * 30 // 1 month warning
    const DUE_VERY_SOON_MS = 1000 * 60 * 60 * 24 * 7 // 1 week warning
    
    // KM intervals - EV typically needs less frequent maintenance
    const KM_INTERVAL_STANDARD = 10000 // Standard vehicle: 10,000 km
    const KM_INTERVAL_EV = 15000 // EV: 15,000 km (less maintenance needed)
    const KM_WARNING_THRESHOLD = 0.9 // Warn at 90% of interval
    const KM_OVERDUE_THRESHOLD = 1.0 // Overdue at 100% of interval

    const now = Date.now()

    // Get last maintenance information (date and km if available)
    const getLastMaintenanceInfo = (vehicleId) => {
      const completedAppointments = appointments.filter(a => 
        a.vehicleId === vehicleId && a.status === 'completed'
      ).sort((a, b) => {
        const dateA = toDateObject(a.requestedDateTime)
        const dateB = toDateObject(b.requestedDateTime)
        return (dateB || 0) - (dateA || 0) // Most recent first
      })
      
      if (completedAppointments.length > 0) {
        const lastAppointment = completedAppointments[0]
        const lastDate = toDateObject(lastAppointment.requestedDateTime)
        // Try to get km from appointment notes or metadata (if available)
        // For now, we'll use the date and calculate km from current odometer
        return {
          date: lastDate,
          km: lastAppointment.odometerKm || lastAppointment.kmAtService || null
        }
      }
      
      // Fallback: use vehicle year as first registration
      const v = vehicles.find(v => v.vehicleId === vehicleId)
      if (v?.year) {
        const d = new Date(v.year, 0, 1)
        return {
          date: isNaN(d.getTime()) ? null : d,
          km: null
        }
      }
      
      return { date: null, km: null }
    }

    // Check if vehicle has active appointments (pending, confirmed, in_maintenance)
    const hasActiveAppointment = (vehicleId) => {
      return appointments.some(a => 
        a.vehicleId === vehicleId && 
        ['pending', 'confirmed', 'in_maintenance'].includes(a.status)
      )
    }

    // Detect if vehicle is EV based on brand/model (heuristic)
    const isElectricVehicle = (vehicle) => {
      if (!vehicle) return false
      const model = (vehicle.model || '').toLowerCase()
      const brand = (vehicle.brand || '').toLowerCase()
      const type = (vehicle.type || vehicle.vehicleType || '').toLowerCase()
      
      // Common EV indicators
      const evKeywords = ['ev', 'electric', 'tesla', 'ioniq', 'leaf', 'id.', 'e-tron', 'eq', 'i3', 'i4', 'i8', 'zoe', 'bolt', 'volt']
      return evKeywords.some(keyword => 
        model.includes(keyword) || brand.includes(keyword) || type.includes(keyword)
      )
    }

    // AI Analysis: Calculate maintenance urgency based on multiple factors
    const calculateMaintenanceUrgency = (vehicle) => {
      const maintenanceInfo = getLastMaintenanceInfo(vehicle.vehicleId)
      const lastDate = maintenanceInfo.date
      const lastMaintenanceKm = maintenanceInfo.km
      // Handle both odometerKm and currentKm field names
      const currentKm = Number(vehicle.odometerKm || vehicle.currentKm || 0)
      const hasAppointment = hasActiveAppointment(vehicle.vehicleId)
      const isEV = isElectricVehicle(vehicle)
      
      // Debug: Log vehicle data for troubleshooting
      if (!vehicle.odometerKm && !vehicle.currentKm) {
        console.warn('[Tracking] Vehicle missing km data:', {
          vehicleId: vehicle.vehicleId,
          model: vehicle.model,
          hasOdometerKm: !!vehicle.odometerKm,
          hasCurrentKm: !!vehicle.currentKm
        })
      }
      
      // Determine KM interval based on vehicle type
      const KM_INTERVAL = isEV ? KM_INTERVAL_EV : KM_INTERVAL_STANDARD
      const KM_WARNING = KM_INTERVAL * KM_WARNING_THRESHOLD
      
      // Base urgency score (0-100)
      let urgencyScore = 0
      let reasons = []
      let kmSinceLastMaintenance = null

      // Calculate KM since last maintenance
      if (lastMaintenanceKm !== null && lastMaintenanceKm > 0) {
        kmSinceLastMaintenance = Math.max(0, currentKm - lastMaintenanceKm)
      } else if (lastDate && currentKm > 0) {
        // Estimate km based on time if we don't have exact km
        // Only calculate if lastDate is in the past
        if (lastDate.getTime() <= now) {
          // Assume average 1,500 km/month (18,000 km/year) - typical urban usage
          const monthsSinceLast = (now - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          const estimatedKm = Math.max(0, monthsSinceLast * 1500)
          kmSinceLastMaintenance = estimatedKm
        } else {
          // If lastDate is in the future (data inconsistency), ignore it
          // This can happen if appointment date is set incorrectly
          // Only log once per vehicle to reduce console noise
          if (!vehicle._futureDateLogged) {
            console.debug('[Tracking] Last maintenance date is in the future, ignoring:', {
              vehicleId: vehicle.vehicleId,
              lastDate: lastDate,
              now: new Date(now)
            })
            vehicle._futureDateLogged = true
          }
        }
      }

      // Time-based analysis (weight: 50 points max)
      // Only analyze if lastDate is valid and in the past
      if (lastDate && lastDate.getTime() <= now) {
        const nextDue = lastDate.getTime() + SIX_MONTHS_MS
        const diff = nextDue - now
        const daysDiff = diff / (1000 * 60 * 60 * 24) // Convert to days (can be negative)
        
        if (diff <= 0) {
          // Already overdue - calculate days overdue
          const daysOverdue = Math.abs(daysDiff)
          const timeScore = Math.min(50, 20 + (daysOverdue * 0.5)) // 20-50 points
          urgencyScore += timeScore
          reasons.push(`Quá hạn ${Math.ceil(daysOverdue)} ngày`)
        } else if (diff <= DUE_VERY_SOON_MS) {
          // Due very soon (within 1 week)
          const daysRemaining = daysDiff
          urgencyScore += Math.max(25, 35 - (daysRemaining * 1.5)) // 25-35 points
          reasons.push(`Còn ${Math.ceil(daysRemaining)} ngày`)
        } else if (diff <= DUE_SOON_MS) {
          // Due soon (within 1 month)
          const daysRemaining = daysDiff
          urgencyScore += Math.max(10, 20 - (daysRemaining * 0.3)) // 10-20 points
          reasons.push(`Còn ${Math.ceil(daysRemaining)} ngày`)
        }
      } else if (lastDate && lastDate.getTime() > now) {
        // Last maintenance date is in the future - data inconsistency
        // Don't penalize, but also don't give points
        // Only log once per vehicle to reduce console noise
        if (!vehicle._timeAnalysisSkippedLogged) {
          console.debug('[Tracking] Skipping time-based analysis - lastDate in future:', {
            vehicleId: vehicle.vehicleId,
            lastDate: lastDate
          })
          vehicle._timeAnalysisSkippedLogged = true
        }
      }

      // KM-based analysis (weight: 40 points max)
      if (kmSinceLastMaintenance !== null && kmSinceLastMaintenance > 0) {
        const kmRatio = kmSinceLastMaintenance / KM_INTERVAL
        
        if (kmRatio >= KM_OVERDUE_THRESHOLD) {
          // Overdue by km
          const kmOverdue = kmSinceLastMaintenance - KM_INTERVAL
          const kmScore = Math.min(40, 20 + (kmOverdue / 100)) // 20-40 points
          urgencyScore += kmScore
          reasons.push(`Vượt ${Math.ceil(kmOverdue).toLocaleString()} km (${(kmRatio * 100).toFixed(0)}% interval)`)
        } else if (kmRatio >= KM_WARNING_THRESHOLD) {
          // Approaching due by km
          const kmRemaining = KM_INTERVAL - kmSinceLastMaintenance
          const kmScore = Math.max(10, 25 - (kmRemaining / 200)) // 10-25 points
          urgencyScore += kmScore
          reasons.push(`Còn ${Math.ceil(kmRemaining).toLocaleString()} km (${(kmRatio * 100).toFixed(0)}% interval)`)
        }
      } else if (currentKm > 0 && !lastDate) {
        // Fallback: use total km modulo only if we don't have last maintenance date
        // This is for vehicles with no maintenance history
        const kmModulo = currentKm % KM_INTERVAL
        const kmRatio = kmModulo / KM_INTERVAL
        
        if (kmRatio >= KM_OVERDUE_THRESHOLD) {
          const kmOverdue = kmModulo - KM_INTERVAL
          urgencyScore += Math.min(30, 15 + (Math.abs(kmOverdue) / 100))
          reasons.push(`Ước tính vượt ${Math.ceil(Math.abs(kmOverdue)).toLocaleString()} km`)
        } else if (kmRatio >= KM_WARNING_THRESHOLD) {
          const kmRemaining = KM_INTERVAL - kmModulo
          urgencyScore += Math.max(5, 15 - (kmRemaining / 200))
          reasons.push(`Ước tính còn ${Math.ceil(kmRemaining).toLocaleString()} km`)
        }
      }

      // Vehicle age factor (older vehicles need more frequent maintenance)
      // Weight: 15 points max
      if (vehicle.year) {
        const age = new Date().getFullYear() - vehicle.year
        if (age > 10) {
          urgencyScore += 15
          reasons.push(`Xe trên 10 năm tuổi`)
        } else if (age > 5) {
          urgencyScore += 8
          reasons.push(`Xe trên 5 năm tuổi`)
        }
      }

      // Usage frequency analysis based on maintenance history
      // Weight: 10 points max
      const vehicleAppointments = appointments.filter(a => 
        a.vehicleId === vehicle.vehicleId && a.status === 'completed'
      )
      if (vehicleAppointments.length > 0 && currentKm > 0) {
        const avgInterval = currentKm / vehicleAppointments.length
        // If average interval is much higher than recommended, it's heavy usage
        if (avgInterval > KM_INTERVAL * 1.5) {
          urgencyScore += 10
          reasons.push(`Sử dụng nhiều (TB ${Math.ceil(avgInterval).toLocaleString()} km/lần)`)
        }
      }

      // First-time maintenance reminder (if no history or invalid history)
      const hasValidMaintenanceHistory = lastDate && lastDate.getTime() <= now && vehicleAppointments.length > 0
      
      if (!hasValidMaintenanceHistory && currentKm > 0) {
        if (currentKm >= KM_INTERVAL * 0.8) {
          // Vehicle has reached 80% of maintenance interval
          urgencyScore += 25
          reasons.push(`Lần bảo dưỡng đầu tiên - đã đi ${currentKm.toLocaleString()} km`)
        } else if (currentKm >= KM_INTERVAL * 0.5) {
          // Vehicle has reached 50% of maintenance interval
          urgencyScore += 20
          reasons.push(`Xe đã đi ${currentKm.toLocaleString()} km - nên bảo dưỡng sớm`)
        } else if (currentKm >= KM_INTERVAL * 0.3) {
          // Vehicle has reached 30% of maintenance interval
          urgencyScore += 15
          reasons.push(`Xe đã đi ${currentKm.toLocaleString()} km - nên bảo dưỡng định kỳ`)
        } else if (currentKm >= KM_INTERVAL * 0.1) {
          // Vehicle has reached 10% of maintenance interval (1000 km for standard, 1500 km for EV)
          urgencyScore += 12
          reasons.push(`Xe mới - đã đi ${currentKm.toLocaleString()} km`)
        } else if (currentKm >= 500) {
          // Vehicle has 500-999 km
          urgencyScore += 8
          reasons.push(`Xe mới - đã đi ${currentKm.toLocaleString()} km`)
        } else if (currentKm >= 200) {
          // Vehicle has 200-499 km
          urgencyScore += 6
          reasons.push(`Xe mới - đã đi ${currentKm.toLocaleString()} km`)
        } else if (currentKm >= 100) {
          // Vehicle has 100-199 km
          urgencyScore += 5
          reasons.push(`Xe mới - đã đi ${currentKm.toLocaleString()} km`)
        } else if (currentKm > 0) {
          // Very new vehicle with minimal km (1-99 km)
          urgencyScore += 4
          reasons.push(`Xe mới - đã đi ${currentKm.toLocaleString()} km`)
        }
      }
      
      // Additional boost for vehicles with significant km but no history
      if (!hasValidMaintenanceHistory && currentKm > 0 && currentKm < KM_INTERVAL * 0.5) {
        // Add proportional score based on km (0-3 points) for fine-tuning
        const kmRatio = currentKm / (KM_INTERVAL * 0.5)
        urgencyScore += Math.floor(kmRatio * 3)
      }
      
      // Special case: If lastDate is in future (data inconsistency), still show reminder based on km
      if (lastDate && lastDate.getTime() > now && currentKm > 0) {
        // Ignore invalid future date, use km-based analysis instead
        if (currentKm >= KM_INTERVAL * 0.8) {
          urgencyScore += 12
          if (!reasons.some(r => r.includes('km'))) {
            reasons.push(`Xe đã đi ${currentKm.toLocaleString()} km - cần bảo dưỡng`)
          }
        }
      }

      // EV adjustment: reduce urgency slightly (EVs need less maintenance)
      // But don't reduce if score is already very low (< 10)
      if (isEV && urgencyScore > 10) {
        urgencyScore = urgencyScore * 0.85 // Reduce by 15% for EVs
        reasons.push(`(Xe điện - ít bảo dưỡng hơn)`)
      }

      // Ensure minimum score for vehicles with km but no valid history
      // This helps show reminders even when data is incomplete
      // Note: hasValidMaintenanceHistory is already declared above (line 489)
      // Only apply minimum boost if score is still too low after all calculations
      if (!hasValidMaintenanceHistory && currentKm > 0 && urgencyScore < 10) {
        // Ensure minimum visibility, but score should already be calculated above
        urgencyScore = Math.max(10, urgencyScore)
      }

      return {
        score: Math.min(100, Math.round(urgencyScore)),
        reasons,
        hasAppointment,
        priority: urgencyScore >= 70 ? 'high' : urgencyScore >= 40 ? 'medium' : 'low',
        isEV,
        kmSinceLastMaintenance
      }
    }

    const items = []
    for (const v of vehicles) {
      const analysis = calculateMaintenanceUrgency(v)
      
      // Debug logging
      console.log('[Tracking] Vehicle analysis:', {
        vehicleId: v.vehicleId,
        model: v.model,
        odometerKm: v.odometerKm,
        currentKm: Number(v.odometerKm || 0),
        score: analysis.score,
        reasons: analysis.reasons,
        hasAppointment: analysis.hasAppointment,
        kmSinceLastMaintenance: analysis.kmSinceLastMaintenance
      })
      
      // Special case: If vehicle has no km data or no maintenance history, 
      // show a reminder to update data (even if score is low)
      const currentKm = Number(v.odometerKm || v.currentKm || 0)
      const vehicleAppointments = appointments.filter(a => 
        a.vehicleId === v.vehicleId && a.status === 'completed'
      )
      // Check if vehicle needs data update (no km or km is 0, and no maintenance history)
      const hasKmData = v.odometerKm !== null && v.odometerKm !== undefined && currentKm > 0
      const needsDataUpdate = !hasKmData && vehicleAppointments.length === 0
      
      // Check if vehicle has low km but no valid maintenance history
      // This happens when appointments have invalid dates (future dates) or no history
      const hasValidHistory = analysis.kmSinceLastMaintenance !== null || 
        (vehicleAppointments.length > 0 && vehicleAppointments.some(a => {
          const aptDate = toDateObject(a.requestedDateTime)
          return aptDate && aptDate.getTime() <= Date.now()
        }))
      const hasLowKmNoHistory = currentKm > 0 && currentKm < 5000 && !hasValidHistory
      
      // Skip if urgency is too low AND not needing data update AND not has active appointment AND not has low km without history
      if (analysis.score < 10 && !needsDataUpdate && !analysis.hasAppointment && !hasLowKmNoHistory) continue
      
      // If needs data update, create a special reminder
      if (needsDataUpdate && analysis.score < 10) {
        items.push({
          vehicleId: v.vehicleId,
          vehicleModel: v.model || v.brand || 'Xe',
          type: 'ai_analysis',
          label: 'Cần cập nhật thông tin',
          status: 'suggested',
          detail: 'Vui lòng cập nhật km hiện tại của xe trong tab "Xe của tôi" để AI có thể phân tích chính xác',
          urgencyScore: 5, // Low score but still show
          priority: 'low',
          hasAppointment: analysis.hasAppointment,
          isEV: analysis.isEV,
          kmSinceLastMaintenance: null,
          needsDataUpdate: true
        })
        continue
      }
      
      // If has low km but no valid history, ensure minimum score to show
      if (hasLowKmNoHistory && analysis.score < 10) {
        // Boost score to ensure it's shown
        analysis.score = Math.max(10, analysis.score + 5)
        if (analysis.reasons.length === 0) {
          analysis.reasons.push(`Xe có ${currentKm.toLocaleString()} km - nên bảo dưỡng định kỳ`)
        }
      }

      // Determine status based on analysis and existing appointments
      let status, label, detail
      
      if (analysis.hasAppointment) {
        status = 'booked'
        label = 'Đã đặt lịch bảo dưỡng'
        detail = 'Xe đã có lịch đặt trong hệ thống'
      } else if (analysis.score >= 70) {
        status = 'overdue'
        label = 'Cần bảo dưỡng khẩn cấp'
        detail = analysis.reasons.join(', ')
      } else if (analysis.score >= 40) {
        status = 'soon'
        label = 'Nên bảo dưỡng sớm'
        detail = analysis.reasons.join(', ')
      } else {
        status = 'suggested'
        label = 'Gợi ý bảo dưỡng'
        detail = analysis.reasons.join(', ')
      }

      items.push({
        vehicleId: v.vehicleId,
        vehicleModel: v.model,
        type: 'ai_analysis',
        label,
        status,
        detail,
        urgencyScore: analysis.score,
        priority: analysis.priority,
        hasAppointment: analysis.hasAppointment,
        isEV: analysis.isEV,
        kmSinceLastMaintenance: analysis.kmSinceLastMaintenance
      })
    }

    // Sort by urgency score (highest first)
    return items.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }, [vehicles, appointments])

  // Read-only for customer; statuses are shown but not editable here.

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Theo dõi & Nhắc nhở</h2>

        {success && currentVehicle && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">Đặt lịch thành công!</p>
            <p className="text-sm mt-1">Xe {currentVehicle.model} ({currentVehicle.vin}) đã được đặt lịch vào {formatDate(currentAppointment?.requestedDateTime) || 'ngày không xác định'}.</p>
          </div>
        )}

        {/* Payment Reminders */}
        {paymentReminders.hasReminders && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">Nhắc thanh toán gói bảo dưỡng định kỳ</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Bạn có {paymentReminders.count} lịch đặt chờ thanh toán với tổng số tiền {paymentReminders.totalAmount.toLocaleString()} VNĐ
                </p>
              </div>
              <Link
                to="/payment"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        )}

        {/* AI-Powered Smart Reminders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nhắc nhở thông minh (AI)</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Khẩn cấp</span>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Sớm</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Gợi ý</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Đã đặt lịch</span>
            </div>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Chưa có nhắc nhở nào. Hãy cập nhật km hiện tại của xe và thêm lịch sử sau bảo dưỡng để AI phân tích chính xác.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((it, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  it.priority === 'high' ? 'border-red-200 bg-red-50' :
                  it.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  it.status === 'booked' ? 'border-green-200 bg-green-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{it.vehicleModel}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          it.status === 'booked' ? 'bg-green-100 text-green-700' :
                          it.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          it.status === 'soon' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {it.label}
                        </span>
                        {it.urgencyScore > 0 && (
                          <span className="text-xs text-gray-500">
                            Độ ưu tiên: {it.urgencyScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{it.detail}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {it.status === 'booked' ? (
                        <span className="text-xs px-3 py-1 rounded-md bg-green-600 text-white">
                          ✓ Đã đặt lịch
                        </span>
                      ) : (
                        <Link
                          to={`/booking?vehicleId=${encodeURIComponent(it.vehicleId)}`}
                          className={`text-xs px-3 py-1 rounded-md text-white hover:opacity-90 ${
                            it.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                            it.priority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          Đặt lịch bảo dưỡng
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xe đang bảo dưỡng</h3>
          {activeAppointments.length === 0 ? (
            <p className="text-gray-600">Hiện chưa có xe nào đang trong quá trình bảo dưỡng.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAppointments.map((appointment) => {
                const v = vehicles.find(x => x.vehicleId === appointment.vehicleId)
                if (!v) return null
                const badge = appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                const label = appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'
                return (
                  <div key={appointment.appointmentId} className="border rounded-lg p-4">
                    <p className="text-gray-900 font-medium">{v.model}</p>
                    <p className="text-sm text-gray-600">VIN: {v.vin}</p>
                    <p className="text-sm text-gray-600 mt-1">Lịch đặt: #{appointment.appointmentId}</p>
                    <p className="text-sm text-gray-600">Thời gian: {formatDate(appointment.requestedDateTime) || 'Ngày không xác định'}</p>
                    <span className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full ${badge}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vehicle Information & Km Display (Read-only) - HIDDEN */}
        {false && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe & Cập nhật km</h3>
          {vehicles.length === 0 ? (
            <p className="text-gray-600">Chưa có xe nào được đăng ký.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.vehicleId} className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Xe</p>
                      <p className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Năm sản xuất</p>
                      <p className="text-gray-900">{vehicle.year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">VIN</p>
                      <p className="text-gray-900 font-mono text-sm">{vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Km hiện tại</p>
                      <p className="text-gray-900 font-semibold">{Number(vehicle.odometerKm || 0).toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Vehicle Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng số xe</h3>
            <p className="text-3xl font-bold text-green-600">{vehicles.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được quản lý</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chờ thanh toán</h3>
            <p className="text-3xl font-bold text-orange-600">{paymentReminders.count}</p>
            <p className="text-gray-600 text-sm">Lịch chờ thanh toán</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang bảo dưỡng</h3>
            <p className="text-3xl font-bold text-blue-600">{activeAppointments.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được bảo dưỡng</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhắc nhở</h3>
            <p className="text-3xl font-bold text-red-600">{reminders.length}</p>
            <p className="text-gray-600 text-sm">Cần bảo dưỡng</p>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'list' ? 'Danh sách lịch đặt' : 'Timeline Bảo Dưỡng'}
            </h3>
            
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Xem dạng timeline"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sắp xếp theo ngày</option>
                  <option value="status">Sắp xếp theo trạng thái</option>
                  <option value="service">Sắp xếp theo dịch vụ</option>
                </select>
              </div>
            </div>
          </div>

          {viewMode === 'timeline' ? (
            <MaintenanceTimeline 
              appointments={filteredAppointments.map(apt => ({
                ...apt,
                appointmentDate: apt.requestedDateTime
              }))}
              vehicles={vehicles}
              services={services}
              serviceCenters={serviceCenters}
            />
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {appointments.length === 0 
                  ? 'Chưa có lịch đặt nào.' 
                  : 'Không có lịch đặt nào phù hợp với bộ lọc đã chọn.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch đặt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => {
                    const v = vehicles.find(x => x.vehicleId === appointment.vehicleId)
                    const statusClass =
                      appointment.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    return (
                      <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{v ? v.model : 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{v ? v.vin : appointment.vehicleId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">#{appointment.appointmentId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(appointment.requestedDateTime) || 'Ngày không xác định'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className={appointment.notes ? '' : 'text-gray-400'}>
                              {appointment.notes ? (
                                appointment.notes.length > 50 
                                  ? `${appointment.notes.substring(0, 50)}...` 
                                  : appointment.notes
                              ) : '-'}
                            </span>
                            {appointment.notes && (
                              <button
                                onClick={() => {
                                  setSelectedNote(appointment.notes)
                                  setShowNoteModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                                title="Xem chi tiết ghi chú"
                              >
                                Xem chi tiết
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            let statusText = 'Chờ xác nhận'
                            let badgeClass = 'bg-yellow-100 text-yellow-800'
                            
                            if (appointment.status === 'pending') {
                              statusText = 'Chờ tiếp nhận'
                              badgeClass = 'bg-yellow-100 text-yellow-800'
                            } else if (appointment.status === 'confirmed' || appointment.status === 'in_maintenance') {
                              statusText = 'Đang bảo dưỡng'
                              badgeClass = 'bg-blue-100 text-blue-800'
                            } else if (appointment.status === 'completed') {
                              statusText = 'Hoàn tất'
                              badgeClass = 'bg-green-100 text-green-800'
                            } else if (appointment.status === 'cancelled') {
                              statusText = 'Đã hủy'
                              badgeClass = 'bg-red-100 text-red-800'
                            }
                            
                            return (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                                {statusText}
                          </span>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note Detail Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNoteModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Chi tiết ghi chú</h3>
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Đóng"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Nội dung ghi chú:</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap break-words">
                      {selectedNote || 'Không có ghi chú'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Tracking

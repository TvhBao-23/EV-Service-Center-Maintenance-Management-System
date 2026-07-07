/**
 * Safely format date with fallback for invalid dates
 * @param {string|Date|Array|null|undefined} dateValue - The date value to format (supports string, Date object, or array [year, month, day, hour, minute, second])
 * @param {Object} options - Formatting options
 * @param {boolean} options.timeOnly - If true, returns only time (HH:MM)
 * @param {string} options.month - Month format ('long', 'short', 'numeric', '2-digit')
 * @param {string} options.year - Year format ('numeric', '2-digit')
 * @param {string} options.day - Day format ('numeric', '2-digit')
 * @returns {string|null} Formatted date string or null if invalid
 */
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[formatDate] No dateValue provided');
    }
    return null;
  }
  
  let date;
  
  // Handle array format from API: [year, month, day, hour, minute, second]
  if (Array.isArray(dateValue)) {
    // Validate array format
    if (dateValue.length < 3) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[formatDate] Array too short:', dateValue);
      }
      return null;
    }
    
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    
    // Validate values are numbers
    if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[formatDate] Array contains non-numeric values:', dateValue);
      }
      return null;
    }
    
    // Month in JavaScript Date is 0-indexed, so subtract 1
    date = new Date(year, month - 1, day, hour, minute, second);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    // Handle ISO string or other date strings
    date = new Date(dateValue);
  } else {
    // Try to create Date from other types (number timestamp, etc.)
    date = new Date(dateValue);
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[formatDate] Invalid date created from:', dateValue, 'Type:', typeof dateValue);
    }
    return null;
  }
  
  try {
    const formatted = options.timeOnly 
      ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('vi-VN', options);
    
    // Additional check: if result is "Invalid Date", return null
    if (formatted === 'Invalid Date') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[formatDate] toLocaleDateString returned "Invalid Date" for:', dateValue, 'Parsed date:', date);
      }
      return null;
    }
    
    return formatted;
  } catch (error) {
    console.warn('[formatDate] Error formatting date:', error, 'Input:', dateValue);
    return null;
  }
};

/**
 * Format date with fallback text
 * @param {string|Date|Array|null|undefined} dateValue - The date value to format
 * @param {Object} options - Formatting options
 * @param {string} fallback - Fallback text if date is invalid (default: 'Ngày không xác định')
 * @returns {string} Formatted date string or fallback text
 */
export const formatDateWithFallback = (dateValue, options = {}, fallback = 'Ngày không xác định') => {
  return formatDate(dateValue, options) || fallback;
};

/**
 * Format date and time together
 * @param {string|Date|Array|null|undefined} dateValue - The date value to format
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} Formatted date and time string or fallback text
 */
export const formatDateTime = (dateValue, fallback = 'Ngày không xác định') => {
  if (!dateValue) return fallback;
  
  let date;
  
  // Handle array format from API
  if (Array.isArray(dateValue)) {
    date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], dateValue[3] || 0, dateValue[4] || 0, dateValue[5] || 0);
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) return fallback;
  
  try {
    const dateStr = date.toLocaleDateString('vi-VN');
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    if (dateStr === 'Invalid Date' || timeStr === 'Invalid Date') {
      return fallback;
    }
    
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.warn('Error formatting date time:', error);
    return fallback;
  }
};

/**
 * Check if a date value is valid
 * @param {string|Date|Array|null|undefined} dateValue - The date value to check
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  
  let date;
  
  // Handle array format from API
  if (Array.isArray(dateValue)) {
    // Validate array values before creating date
    const [year, month, day, hour, minute, second] = dateValue;
    
    // Check if values are reasonable
    if (!year || year < 1900 || year > 2100) return false;
    if (!month || month < 1 || month > 12) return false;
    if (!day || day < 1 || day > 31) return false;
    
    date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  } else {
    date = new Date(dateValue);
  }
  
  return !isNaN(date.getTime());
};

/**
 * Convert date value to Date object
 * @param {string|Date|Array|null|undefined} dateValue - The date value to convert
 * @returns {Date|null} Date object or null if invalid
 */
export const toDateObject = (dateValue) => {
  if (!dateValue) return null;
  
  // Handle null, undefined, empty string
  if (dateValue === null || dateValue === undefined || dateValue === '') {
    return null;
  }
  
  let date;
  
  // Handle array format from API: [year, month, day, hour, minute, second]
  if (Array.isArray(dateValue)) {
    // Validate array has minimum required elements
    if (dateValue.length < 3) {
      console.warn('[dateUtils] Array date format invalid - needs at least [year, month, day]', dateValue);
      return null;
    }
    
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    
    // Validate year, month, day are numbers
    if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
      console.warn('[dateUtils] Array date format contains non-numeric values', dateValue);
      return null;
    }
    
    // Validate reasonable ranges
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn('[dateUtils] Array date format out of valid range', dateValue);
      return null;
    }
    
    // Month in JavaScript Date is 0-indexed, so subtract 1
    date = new Date(year, month - 1, day, hour, minute, second);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    // Try parsing ISO string or other date string formats
    date = new Date(dateValue);
  } else {
    // For other types (number, object, etc.), try to create Date
    date = new Date(dateValue);
  }
  
  // Check if date is valid
  if (!date || isNaN(date.getTime())) {
    return null;
  }
  
  return date;
};

/**
 * Format date for API (ISO 8601)
 * @param {string|Date|Array|null|undefined} dateValue - The date value to format
 * @returns {string|null} ISO 8601 formatted date string or null if invalid
 */
export const formatDateForAPI = (dateValue) => {
  if (!dateValue) return null;
  
  const date = toDateObject(dateValue);
  
  if (!date) return null;
  
  try {
    return date.toISOString();
  } catch (error) {
    console.warn('Error formatting date for API:', error);
    return null;
  }
};


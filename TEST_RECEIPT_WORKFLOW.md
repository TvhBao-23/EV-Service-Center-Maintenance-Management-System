# 🧪 Test Guide - Receipt Workflow Center

## 🎯 Quick Test Instructions

### Prerequisites
✅ Docker containers are running  
✅ MySQL database has data  
✅ You have Staff account credentials

---

## 📝 Step-by-Step Test Plan

### STEP 1: Login as Staff
```
URL: http://localhost:3000/login
Email: staff@example.com
Password: staff123
```

### STEP 2: Navigate to Receipts Tab
```
Click: "📋 Phiếu tiếp nhận" tab
```

---

## 🔍 Test Scenario 1: Empty State

**When:** No receipts exist yet

**Expected:**
```
📝 (large icon)
"Chưa có phiếu tiếp nhận nào"
Message about creating receipts from appointments
[Xem lịch hẹn để tiếp nhận] button
```

**Actions:**
1. Click "Xem lịch hẹn để tiếp nhận"
2. Should navigate to "Lịch hẹn" tab

---

## 📋 Test Scenario 2: Create Receipt

### A. From Appointments Tab
```
1. Go to "📅 Lịch hẹn" tab
2. Find appointment with status "confirmed"
3. Click "Tiếp nhận" button
4. Fill in the form:
   ├─ Số km: 35000
   ├─ Mức nhiên liệu: 75%
   ├─ Tình trạng xe: good
   ├─ Ước tính chi phí: 5000000
   ├─ Ước tính thời gian: 4
   ├─ Yêu cầu khách hàng: "Kiểm tra pin và hệ thống sạc"
   └─ Ghi chú: "Khách VIP, ưu tiên xử lý"
5. Click "Tạo phiếu"
```

**Expected:**
- ✅ Success alert
- Page refreshes
- Receipt appears in "Phiếu tiếp nhận" tab
- Appointment status → "received"

---

## 🎨 Test Scenario 3: Receipt Card Display

### Navigate back to "Phiếu tiếp nhận" tab

**Should see card with:**

#### Header
```
📝 Phiếu #1
[⏳ Chờ phân công] badge (yellow)
Tạo lúc: [current datetime]
```

#### Customer & Vehicle
```
👤 Khách hàng
Name + Phone

🚗 Phương tiện  
Model + License Plate
```

#### Service Info
```
📍 Số km: 35,000 km
⛽ Mức nhiên liệu: 75%
🔧 Tình trạng: good
💰 Ước tính: 5,000,000 VNĐ
```

#### Notes (yellow highlight)
```
⚠️ Yêu cầu khách hàng:
"Kiểm tra pin và hệ thống sạc"
```

#### Notes (gray)
```
📌 Ghi chú:
"Khách VIP, ưu tiên xử lý"
```

#### Actions
```
[⚡ Phân công KTV]  [📅 Timeline]  [🖨️ In phiếu]
```

---

## 🔍 Test Scenario 4: Search & Filter

### Test Search
```
1. Type license plate in search box
   → Card should filter in real-time
2. Type customer name
   → Should find matching receipts
3. Type phone number
   → Should filter correctly
4. Clear search
   → All receipts appear again
```

### Test Status Filter
```
1. Select "⏳ Chờ phân công"
   → Only waiting receipts shown
2. Select "Tất cả trạng thái"
   → All receipts appear
```

### Test Date Filter
```
1. Select "Hôm nay"
   → Only today's receipts
2. Select "7 ngày qua"
   → Last week's receipts
3. Select "Tất cả thời gian"
   → All receipts
```

### Test Counter
```
Check: 📊 Tổng: X phiếu
- Should update with filters
- Should show correct count
```

---

## 📅 Test Scenario 5: Timeline Modal

### Steps
```
1. Click "📅 Timeline" button
2. Modal opens
```

**Should display:**

#### Header
```
📅 Timeline - Phiếu #1
"Theo dõi tiến trình xử lý phiếu tiếp nhận"
```

#### Timeline Events
```
📝 Phiếu tiếp nhận được tạo
   [Time] [Date]
   "Tiếp nhận xe từ khách hàng. Số km: 35,000 km"
   [✓ Đã hoàn thành]

⏱️ Dự kiến hoàn thành
   [Estimated time]
   "Ước tính xong lúc XX:XX"
   [○ Chờ xử lý]
```

#### Summary
```
⏱️ Thời gian đã trôi qua: Xh Xm
📊 Trạng thái hiện tại: ⏳ Chờ phân công
```

#### Actions
```
3. Click "Đóng"
   → Modal closes
```

---

## 👷 Test Scenario 6: Assign Technician

### Steps
```
1. Click "⚡ Phân công KTV" button
2. Assignment modal opens
3. Select a technician from dropdown
4. Click "Phân công"
```

**Expected:**
- ✅ Success alert
- Page refreshes
- Card updates:
  - Badge changes to "👷 Đã phân công" (blue)
  - Progress section appears:
    ```
    Tiến độ công việc        30%
    [━━━━━░░░░░░░░░░░]
    👷 KTV Name    ⏱️ Dự kiến: 4h
    ```
  - Action button changes to "📊 Xem tiến độ"

---

## 📊 Test Scenario 7: View Progress

### Steps
```
1. After assignment, click "📊 Xem tiến độ"
2. Should open appointment details modal
```

**Check:**
- Shows assignment info
- Shows technician name
- Shows current status
- Has option to view more details

---

## 🖨️ Test Scenario 8: Print Receipt

### Steps
```
1. Click "🖨️ In phiếu" button
2. New window opens
```

**Check Print Window:**

#### Header Section
```
⚡ EV SERVICE CENTER
Phiếu Tiếp Nhận Xe Điện
Số: 1
Ngày: [current date]
```

#### Content Sections
- ✅ Customer information (all fields)
- ✅ Vehicle information (all fields)
- ✅ Reception details (mileage, fuel, etc.)
- ✅ Customer complaints (highlighted)
- ✅ Notes (highlighted)
- ✅ Signature areas (2 boxes)
- ✅ Footer with contact info

#### Print Button
```
3. Click "🖨️ In phiếu" button (top right)
4. Print dialog opens
```

#### Test Print Options
```
5. Option 1: Print to physical printer
   → Check paper output

6. Option 2: Save as PDF
   - Select "Save as PDF" destination
   - Save file
   - Open PDF
   - Verify formatting
```

**Expected PDF Quality:**
- Clean, professional layout
- All text readable
- Proper spacing
- No cut-off content
- Ready for customer signature

---

## 🔄 Test Scenario 9: Status Progression

### Simulate Complete Workflow

#### Step 1: Create Receipt
```
Status: waiting_assignment
Badge: ⏳ Yellow
Progress: N/A
Action: [⚡ Phân công KTV]
```

#### Step 2: Assign Technician
```
Status: assigned
Badge: 👷 Blue
Progress: 30%
Action: [📊 Xem tiến độ]
```

#### Step 3: KTV Starts Work (via Technician dashboard)
```
Status: in_progress
Badge: 🔧 Purple
Progress: 60%
Action: [📊 Xem tiến độ]
```

#### Step 4: KTV Completes Work
```
Status: completed
Badge: ✅ Green
Progress: 100%
Action: [💵 Tạo hóa đơn]
```

#### Step 5: Ready for Payment
```
Status: ready_for_payment
Badge: 💰 Orange
Progress: 100%
Action: [💵 Tạo hóa đơn]
```

---

## ⚠️ Test Scenario 10: Overdue Detection

### Steps
```
1. Create receipt with estimated duration: 1 hour
2. Wait 1+ hours (or manually change receipt time in DB)
3. Refresh page
```

**Expected:**
```
[⏳ Chờ phân công] [⚠️ Quá giờ]
         ↑              ↑
    yellow badge    red badge
```

---

## 📱 Test Scenario 11: Responsive Design

### Desktop (>1024px)
```
✅ 4-column filter layout
✅ Full card display
✅ All info visible
```

### Tablet (768-1023px)
```
✅ 2-column filter layout
✅ Stacked cards
✅ Readable text
```

### Mobile (<768px)
```
✅ Single column
✅ Vertical layout
✅ Touch-friendly buttons
✅ Readable on small screen
```

---

## 🐛 Test Scenario 12: Error Handling

### Test Empty Data
```
1. Receipt with no customer
   → Should show "N/A"
2. Receipt with no vehicle
   → Should show "N/A"
3. Receipt with no notes
   → Section hidden
```

### Test Invalid Actions
```
1. Try to print when no data
   → Should handle gracefully
2. Close modal before loading
   → Should not crash
```

---

## ✅ Test Checklist Summary

### Visual Tests
- [ ] Cards display correctly
- [ ] Colors are appropriate
- [ ] Icons are visible
- [ ] Text is readable
- [ ] Spacing is consistent
- [ ] Borders are correct
- [ ] Progress bars animate

### Functional Tests
- [ ] Search works
- [ ] All filters work
- [ ] Counter updates
- [ ] Cards clickable
- [ ] Modals open/close
- [ ] Print opens window
- [ ] Timeline shows events
- [ ] Assignment works

### Data Tests
- [ ] Customer info correct
- [ ] Vehicle info correct
- [ ] Service info correct
- [ ] Notes display
- [ ] Timestamps correct
- [ ] Status calculation correct
- [ ] Progress calculation correct

### Edge Cases
- [ ] Empty state works
- [ ] No data shows N/A
- [ ] Overdue detection works
- [ ] Long text wraps
- [ ] Special characters handled

### Integration Tests
- [ ] API calls succeed
- [ ] State updates correctly
- [ ] Page refreshes work
- [ ] Navigation works
- [ ] Links are correct

### Print Tests
- [ ] Print window opens
- [ ] Content is complete
- [ ] Layout is professional
- [ ] Print button works
- [ ] PDF saves correctly
- [ ] Ready for signature

---

## 📊 Expected Test Results

### Success Criteria
```
✅ All search/filter functions work
✅ Cards display all information correctly
✅ Status badges show correct colors
✅ Progress bars show correct percentage
✅ Timeline displays chronologically
✅ Print generates professional receipt
✅ Responsive on all screen sizes
✅ No console errors
✅ All buttons clickable
✅ Modals open and close properly
```

---

## 🎯 Performance Benchmarks

### Load Times (Target)
- Initial page load: < 2 seconds
- Search filter: < 100ms
- Modal open: < 200ms
- Print window: < 500ms

### Data Limits (Tested)
- Up to 100 receipts: ✅ Smooth
- Up to 1000 receipts: ⚠️ Use pagination
- Search with 100+ results: ✅ Fast

---

## 🐛 Common Issues & Solutions

### Issue: Cards not showing
```
Solution:
1. Check browser console
2. Verify API endpoints
3. Check serviceReceipts state
4. Refresh page
```

### Issue: Print window blank
```
Solution:
1. Check popup blocker
2. Allow popups for localhost
3. Try different browser
```

### Issue: Timeline empty
```
Solution:
1. Verify receipt has data
2. Check assignment exists
3. Check date formatting
```

### Issue: Filters not working
```
Solution:
1. Check state updates
2. Verify filter logic
3. Check console for errors
```

---

## 📞 Need Help?

### Debug Steps
1. Open browser console (F12)
2. Check Network tab for API calls
3. Check Console for errors
4. Verify Docker containers running
5. Check database has data

### Verification Commands
```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs frontend
docker-compose logs staffservice

# Restart if needed
docker-compose restart frontend
```

---

## 🎉 Test Completion

When all tests pass:
```
✅ Feature is production-ready!
✅ All scenarios covered
✅ Edge cases handled
✅ Performance is good
✅ User experience is smooth
```

---

**Happy Testing! 🚀**

Date: November 4, 2025
Version: 2.0.0
Status: Ready for QA


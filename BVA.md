Bva kết hợp với lớp tương đương dùng Sonarqube
1 Thiết kế test case bằng BVA + EP
2 Viết Unit Test hoặc Integration Test
    Dùng JUnit hoặc framework kiểm thử khác để hiện thực các test case trên.
    Dùng JUnit để viết test.
    Dùng Mockito để mock Repository hoặc các service phụ thuộc.
3 Chạy SonarQube

SonarQube sẽ:
Kiểm tra chất lượng mã nguồn.
Đo Code Coverage nếu có tích hợp với công cụ như JaCoCo.
Báo các lỗi, code smell, security hotspot,...
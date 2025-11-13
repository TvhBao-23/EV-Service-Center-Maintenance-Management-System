-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: ev_service_center
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `center_id` bigint NOT NULL,
  `requested_date_time` datetime NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `idx_appointments_customer_id` (`customer_id`),
  KEY `idx_appointments_vehicle_id` (`vehicle_id`),
  KEY `idx_appointments_service_id` (`service_id`),
  KEY `idx_appointments_center_id` (`center_id`),
  KEY `idx_appointments_requested_date_time` (`requested_date_time`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`center_id`) REFERENCES `service_centers` (`center_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `technician_id` bigint NOT NULL,
  `assigned_by` bigint NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('assigned','accepted','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_assignments_appointment_id` (`appointment_id`),
  KEY `idx_assignments_technician_id` (`technician_id`),
  KEY `idx_assignments_status` (`status`),
  KEY `idx_assignments_assigned_at` (`assigned_at`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_conversations` (
  `conversation_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `staff_id` bigint NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','closed','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `idx_chat_conversations_customer_id` (`customer_id`),
  KEY `idx_chat_conversations_staff_id` (`staff_id`),
  KEY `idx_chat_conversations_status` (`status`),
  KEY `idx_chat_conversations_last_message_at` (`last_message_at`),
  CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chat_conversations_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checklists`
--

DROP TABLE IF EXISTS `checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checklists` (
  `checklist_id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `technician_id` bigint NOT NULL,
  `battery_health` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `battery_voltage` decimal(5,2) DEFAULT NULL,
  `battery_temperature` decimal(5,2) DEFAULT NULL,
  `brake_system` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tire_condition` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tire_pressure` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lights_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cooling_system` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motor_condition` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `charging_port` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `software_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overall_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `checked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`checklist_id`),
  KEY `idx_checklists_assignment_id` (`assignment_id`),
  KEY `idx_checklists_vehicle_id` (`vehicle_id`),
  KEY `idx_checklists_technician_id` (`technician_id`),
  CONSTRAINT `checklists_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `checklists_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE,
  CONSTRAINT `checklists_ibfk_3` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checklists`
--

LOCK TABLES `checklists` WRITE;
/*!40000 ALTER TABLE `checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  KEY `idx_customers_user_id` (`user_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_reports`
--

DROP TABLE IF EXISTS `maintenance_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_reports` (
  `report_id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `technician_id` bigint NOT NULL,
  `work_performed` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parts_used` text COLLATE utf8mb4_unicode_ci,
  `issues_found` text COLLATE utf8mb4_unicode_ci,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `labor_hours` decimal(5,2) DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_maintenance_reports_assignment_id` (`assignment_id`),
  KEY `idx_maintenance_reports_vehicle_id` (`vehicle_id`),
  KEY `idx_maintenance_reports_technician_id` (`technician_id`),
  KEY `idx_maintenance_reports_status` (`status`),
  CONSTRAINT `maintenance_reports_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_reports_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_reports_ibfk_3` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_reports_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_reports`
--

LOCK TABLES `maintenance_reports` WRITE;
/*!40000 ALTER TABLE `maintenance_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` bigint NOT NULL,
  `recipient_id` bigint NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `parent_message_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `idx_messages_sender_id` (`sender_id`),
  KEY `idx_messages_recipient_id` (`recipient_id`),
  KEY `idx_messages_is_read` (`is_read`),
  KEY `idx_messages_created_at` (`created_at`),
  KEY `idx_messages_parent_id` (`parent_message_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `part_inventory_logs`
--

DROP TABLE IF EXISTS `part_inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `part_inventory_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `part_id` bigint NOT NULL,
  `type` enum('in','out','adjustment','damaged','returned') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `performed_by` bigint NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `performed_by` (`performed_by`),
  KEY `idx_part_inventory_logs_part_id` (`part_id`),
  KEY `idx_part_inventory_logs_type` (`type`),
  KEY `idx_part_inventory_logs_created_at` (`created_at`),
  CONSTRAINT `part_inventory_logs_ibfk_1` FOREIGN KEY (`part_id`) REFERENCES `parts` (`part_id`) ON DELETE CASCADE,
  CONSTRAINT `part_inventory_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `part_inventory_logs`
--

LOCK TABLES `part_inventory_logs` WRITE;
/*!40000 ALTER TABLE `part_inventory_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `part_inventory_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `part_requests`
--

DROP TABLE IF EXISTS `part_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `part_requests` (
  `request_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `part_id` bigint NOT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `request_type` enum('purchase','quote','warranty') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'purchase',
  `status` enum('pending','approved','rejected','fulfilled','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `requested_price` decimal(10,2) DEFAULT NULL,
  `approved_price` decimal(10,2) DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `staff_notes` text COLLATE utf8mb4_unicode_ci,
  `delivery_method` enum('pickup','delivery') COLLATE utf8mb4_unicode_ci DEFAULT 'pickup',
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `estimated_delivery_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_part_requests_customer_id` (`customer_id`),
  KEY `idx_part_requests_part_id` (`part_id`),
  KEY `idx_part_requests_status` (`status`),
  KEY `idx_part_requests_created_at` (`created_at`),
  CONSTRAINT `part_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `part_requests_ibfk_2` FOREIGN KEY (`part_id`) REFERENCES `parts` (`part_id`) ON DELETE CASCADE,
  CONSTRAINT `part_requests_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL,
  CONSTRAINT `part_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `part_requests`
--

LOCK TABLES `part_requests` WRITE;
/*!40000 ALTER TABLE `part_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `part_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parts`
--

DROP TABLE IF EXISTS `parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parts` (
  `part_id` bigint NOT NULL AUTO_INCREMENT,
  `part_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compatible_models` text COLLATE utf8mb4_unicode_ci,
  `unit_price` decimal(10,2) NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `min_stock_level` int NOT NULL DEFAULT '5',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_months` int DEFAULT '12',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','low_stock','out_of_stock','discontinued') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`part_id`),
  UNIQUE KEY `part_code` (`part_code`),
  KEY `idx_parts_part_code` (`part_code`),
  KEY `idx_parts_category` (`category`),
  KEY `idx_parts_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parts`
--

LOCK TABLES `parts` WRITE;
/*!40000 ALTER TABLE `parts` DISABLE KEYS */;
INSERT INTO `parts` VALUES (1,'BAT-LI-001','Pin Lithium-Ion 60kWh','Pin lithium-ion dung lượng 60kWh cho xe điện','battery','LG Chem','[\"Tesla Model 3\", \"Nissan Leaf\", \"VinFast VF8\"]',15000000.00,5,2,'Kho A-01',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(2,'BAT-LI-002','Pin Lithium-Ion 75kWh','Pin lithium-ion dung lượng 75kWh cao cấp','battery','CATL','[\"Tesla Model Y\", \"VinFast VF9\", \"Hyundai Ioniq 5\"]',18000000.00,3,2,'Kho A-02',24,NULL,'low_stock','2025-11-05 16:20:28','2025-11-05 16:20:28'),(3,'BAT-CELL-001','Cell Pin Thay Thế','Cell pin lithium-ion thay thế cho module hỏng','battery','Samsung SDI','[\"All EV Models\"]',500000.00,50,10,'Kho A-03',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(4,'BMS-001','Hệ Thống Quản Lý Pin BMS','Battery Management System điều khiển pin','electronic','Bosch','[\"All EV Models\"]',8000000.00,8,3,'Kho B-01',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(5,'MOT-AC-001','Động Cơ Điện AC 150kW','Động cơ điện AC công suất 150kW','motor','Siemens','[\"Tesla Model 3\", \"VinFast VF8\"]',25000000.00,2,1,'Kho C-01',36,NULL,'low_stock','2025-11-05 16:20:28','2025-11-05 16:20:28'),(6,'MOT-DC-001','Động Cơ Điện DC 100kW','Động cơ điện DC công suất 100kW','motor','Nissan','[\"Nissan Leaf\"]',20000000.00,4,2,'Kho C-02',36,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(7,'INV-001','Bộ Nghịch Lưu Công Suất','Inverter chuyển đổi DC-AC cho động cơ','electronic','ABB','[\"All EV Models\"]',12000000.00,6,2,'Kho B-02',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(8,'BRK-PAD-001','Má Phanh Ceramic Trước','Má phanh ceramic cho bánh trước','brake','Brembo','[\"All EV Models\"]',1200000.00,40,15,'Kho D-01',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(9,'BRK-PAD-002','Má Phanh Ceramic Sau','Má phanh ceramic cho bánh sau','brake','Brembo','[\"All EV Models\"]',1000000.00,35,15,'Kho D-02',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(10,'BRK-DISC-001','Đĩa Phanh Thông Gió Trước','Đĩa phanh thông gió 350mm cho bánh trước','brake','StopTech','[\"Tesla Model 3\", \"VinFast VF8\", \"Hyundai Ioniq 5\"]',2500000.00,20,8,'Kho D-03',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(11,'BRK-DISC-002','Đĩa Phanh Sau','Đĩa phanh 320mm cho bánh sau','brake','StopTech','[\"All EV Models\"]',2000000.00,18,8,'Kho D-04',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(12,'TIRE-001','Lốp Michelin EV 235/45R18','Lốp chuyên dụng cho xe điện 235/45R18','tire','Michelin','[\"Tesla Model 3\", \"VinFast VF8\"]',3500000.00,32,12,'Kho E-01',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(13,'TIRE-002','Lốp Bridgestone Turanza EV 245/50R19','Lốp cao cấp cho xe điện SUV','tire','Bridgestone','[\"Tesla Model Y\", \"VinFast VF9\"]',4200000.00,24,12,'Kho E-02',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(14,'CHG-PORT-001','Cổng Sạc Type 2','Cổng sạc chuẩn Type 2 (IEC 62196)','charging','Phoenix Contact','[\"All EV Models\"]',5000000.00,10,3,'Kho F-01',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(15,'CHG-CABLE-001','Dây Sạc Type 2 - 5m','Dây sạc chuẩn Type 2 dài 5m','charging','Mennekes','[\"All EV Models\"]',2000000.00,15,5,'Kho F-02',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(16,'CHG-ONBOARD-001','Bộ Sạc Onboard 11kW','Bộ sạc tích hợp trên xe 11kW','charging','Delta Electronics','[\"All EV Models\"]',15000000.00,5,2,'Kho F-03',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(17,'ECU-001','Bộ Điều Khiển Trung Tâm ECU','Electronic Control Unit chính','electronic','Continental','[\"Tesla Model 3\", \"VinFast VF8\"]',10000000.00,4,2,'Kho B-03',24,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(18,'DISPLAY-001','Màn Hình Cảm Ứng 15.4 inch','Màn hình trung tâm cảm ứng','electronic','LG Display','[\"Tesla Model 3\", \"VinFast VF8\"]',8000000.00,6,2,'Kho B-04',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(19,'SENSOR-001','Cảm Biến Nhiệt Độ Pin','Cảm biến đo nhiệt độ module pin','electronic','Sensata','[\"All EV Models\"]',500000.00,60,20,'Kho B-05',12,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(20,'COOL-PUMP-001','Bơm Tuần Hoàn Nước Làm Mát','Bơm điện tuần hoàn dung dịch làm mát','cooling','Bosch','[\"All EV Models\"]',3000000.00,12,5,'Kho G-01',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(21,'COOL-RAD-001','Két Làm Mát Pin','Radiator làm mát hệ thống pin','cooling','Denso','[\"Tesla Model 3\", \"VinFast VF8\"]',4500000.00,8,3,'Kho G-02',18,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(22,'FILTER-001','Lọc Gió Cabin HEPA','Lọc không khí cabin chuẩn HEPA','filter','3M','[\"All EV Models\"]',800000.00,50,20,'Kho H-01',6,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(23,'WIPER-001','Cần Gạt Nước 26 inch','Cần gạt nước kính trước','accessory','Bosch','[\"All EV Models\"]',450000.00,40,15,'Kho H-02',6,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28'),(24,'FLUID-001','Dung Dịch Làm Mát EV 5L','Dung dịch làm mát chuyên dụng cho xe điện','fluid','Motul','[\"All EV Models\"]',600000.00,80,30,'Kho H-03',0,NULL,'available','2025-11-05 16:20:28','2025-11-05 16:20:28');
/*!40000 ALTER TABLE `parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_otp` (`otp_code`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_password_reset_tokens_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer','e_wallet') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','processing','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `verification_code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_expires_at` timestamp NULL DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_payments_appointment_id` (`appointment_id`),
  KEY `idx_payments_customer_id` (`customer_id`),
  KEY `idx_payments_transaction_id` (`transaction_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_centers`
--

DROP TABLE IF EXISTS `service_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_centers` (
  `center_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_centers`
--

LOCK TABLES `service_centers` WRITE;
/*!40000 ALTER TABLE `service_centers` DISABLE KEYS */;
INSERT INTO `service_centers` VALUES (1,'Trung tâm dịch vụ xe điện Hoài Bảo - Quận 1','123 Nguyễn Huệ, Quận 1, TP.HCM','0772051289','2025-11-05 16:20:27','2025-11-05 16:20:27'),(2,'Trung tâm dịch vụ xe điện Hoài Bảo - Quận 7','456 Nguyễn Thị Thập, Quận 7, TP.HCM','0772051290','2025-11-05 16:20:27','2025-11-05 16:20:27'),(3,'Trung tâm dịch vụ xe điện Hoài Bảo - Quận 12','789 Đường Tân Thới Hiệp, Quận 12, TP.HCM','0772051291','2025-11-05 16:20:27','2025-11-05 16:20:27');
/*!40000 ALTER TABLE `service_centers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_part_categories`
--

DROP TABLE IF EXISTS `service_part_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_part_categories` (
  `mapping_id` bigint NOT NULL AUTO_INCREMENT,
  `service_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Service category tá»« services.category',
  `part_category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Part category tá»« parts.category',
  `priority` int DEFAULT '1' COMMENT 'Äá»™ Æ°u tiÃªn hiá»ƒn thá»‹ (1=cao nháº¥t)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mapping_id`),
  UNIQUE KEY `unique_mapping` (`service_category`,`part_category`),
  KEY `idx_service_category` (`service_category`),
  KEY `idx_part_category` (`part_category`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_part_categories`
--

LOCK TABLES `service_part_categories` WRITE;
/*!40000 ALTER TABLE `service_part_categories` DISABLE KEYS */;
INSERT INTO `service_part_categories` VALUES (1,'maintenance','filter',1,'2025-11-05 16:20:29'),(2,'maintenance','accessory',2,'2025-11-05 16:20:29'),(3,'maintenance','fluid',3,'2025-11-05 16:20:29'),(4,'maintenance','brake',4,'2025-11-05 16:20:29'),(5,'maintenance','tire',5,'2025-11-05 16:20:29'),(6,'maintenance','electronic',6,'2025-11-05 16:20:29'),(7,'battery','battery',1,'2025-11-05 16:20:29'),(8,'charging','charging',1,'2025-11-05 16:20:29'),(9,'charging','electronic',2,'2025-11-05 16:20:29'),(10,'motor','motor',1,'2025-11-05 16:20:29'),(11,'motor','electronic',2,'2025-11-05 16:20:29'),(12,'electronic','electronic',1,'2025-11-05 16:20:29'),(13,'electronic','battery',2,'2025-11-05 16:20:29'),(14,'cooling','cooling',1,'2025-11-05 16:20:29'),(15,'cooling','fluid',2,'2025-11-05 16:20:29');
/*!40000 ALTER TABLE `service_part_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_receipts`
--

DROP TABLE IF EXISTS `service_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_receipts` (
  `receipt_id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `vehicle_id` bigint NOT NULL,
  `received_by` bigint NOT NULL,
  `odometer_reading` int NOT NULL,
  `fuel_level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exterior_condition` text COLLATE utf8mb4_unicode_ci,
  `interior_condition` text COLLATE utf8mb4_unicode_ci,
  `customer_complaints` text COLLATE utf8mb4_unicode_ci,
  `estimated_completion` datetime DEFAULT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`receipt_id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `received_by` (`received_by`),
  KEY `idx_service_receipts_appointment_id` (`appointment_id`),
  KEY `idx_service_receipts_vehicle_id` (`vehicle_id`),
  KEY `idx_service_receipts_receipt_number` (`receipt_number`),
  CONSTRAINT `service_receipts_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `service_receipts_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE,
  CONSTRAINT `service_receipts_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_receipts`
--

LOCK TABLES `service_receipts` WRITE;
/*!40000 ALTER TABLE `service_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `estimated_duration_minutes` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'maintenance',
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Báº£o dÆ°á»¡ng Ä‘á»‹nh ká»³','Kiá»ƒm tra tá»•ng thá»ƒ há»‡ thá»‘ng Ä‘iá»‡n, pin vÃ  cÃ¡c bá»™ pháº­n chÃ­nh',120,500000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','maintenance'),(2,'Thay pin lithium-ion','Thay tháº¿ pin lithium-ion cao cáº¥p cho xe Ä‘iá»‡n',480,15000000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','battery'),(3,'Sá»­a chá»¯a há»‡ thá»‘ng sáº¡c','Kiá»ƒm tra vÃ  sá»­a chá»¯a há»‡ thá»‘ng sáº¡c nhanh DC',180,2500000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','charging'),(4,'Thay motor Ä‘iá»‡n','Thay tháº¿ motor Ä‘iá»‡n cao cáº¥p cho xe Ä‘iá»‡n',360,8000000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','motor'),(5,'Kiá»ƒm tra BMS','Kiá»ƒm tra vÃ  cáº­p nháº­t há»‡ thá»‘ng quáº£n lÃ½ pin (Battery Management System)',90,1200000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','electronic'),(6,'Thay inverter','Thay tháº¿ bá»™ chuyá»ƒn Ä‘á»•i Ä‘iá»‡n DC/AC cao cáº¥p',240,3500000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','electronic'),(7,'Báº£o dÆ°á»¡ng há»‡ thá»‘ng lÃ m mÃ¡t','Kiá»ƒm tra vÃ  báº£o dÆ°á»¡ng há»‡ thá»‘ng lÃ m mÃ¡t pin vÃ  motor',150,800000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','cooling'),(8,'Cáº­p nháº­t pháº§n má»m','Cáº­p nháº­t pháº§n má»m há»‡ thá»‘ng vÃ  tá»‘i Æ°u hiá»‡u suáº¥t',60,300000.00,'2025-11-05 16:20:29','2025-11-05 16:20:29','electronic');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','staff','technician','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gmail.com','$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq','Admin Hoai Bao','0772051289','admin','2025-11-05 16:20:28','2025-11-05 16:20:28'),(2,'nhanvien@gmail.com','$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq','Nguyen Van Staff','0772051290','staff','2025-11-05 16:20:28','2025-11-05 16:20:28'),(3,'kythuatvien@gmail.com','$2b$10$pYvi5iguAjkpj7MXXnnSEeacT1Pi4LV/Sl.zAM9aXLidzHjkZUBBq','Le Van Tech','0772051292','technician','2025-11-05 16:20:28','2025-11-05 16:20:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `vin` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `battery_capacity_kwh` decimal(5,2) DEFAULT NULL,
  `odometer_km` int DEFAULT NULL,
  `last_service_date` date DEFAULT NULL,
  `last_service_km` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `vin` (`vin`),
  KEY `idx_vehicles_customer_id` (`customer_id`),
  KEY `idx_vehicles_vin` (`vin`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05 16:52:47

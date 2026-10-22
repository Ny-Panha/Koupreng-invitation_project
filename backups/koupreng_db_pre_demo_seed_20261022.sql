-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: koupreng_db
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Current Database: `koupreng_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `koupreng_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `koupreng_db`;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `target_entity` varchar(120) DEFAULT NULL,
  `target_id` bigint DEFAULT NULL,
  `old_values` text,
  `new_values` text,
  `ip_address` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_audit_logs_admin` (`admin_id`),
  CONSTRAINT `fk_audit_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_items`
--

DROP TABLE IF EXISTS `budget_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_items` (
  `budget_item_id` bigint NOT NULL AUTO_INCREMENT,
  `budget_id` bigint NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `actual_cost` decimal(12,2) DEFAULT NULL,
  `expense_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `notes` text,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`budget_item_id`),
  KEY `fk_budget_items_budget` (`budget_id`),
  CONSTRAINT `fk_budget_items_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`budget_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_items`
--

LOCK TABLES `budget_items` WRITE;
/*!40000 ALTER TABLE `budget_items` DISABLE KEYS */;
INSERT INTO `budget_items` VALUES (1,1,'Venue','Reception venue',3500.00,0.00,'2035-02-01','PLANNED','Phnom Penh Demo Venue','Fictional development estimate','USD'),(2,1,'Decoration','Wedding flowers',800.00,0.00,'2035-02-01','PLANNED','Demo Florist','Fictional development estimate','USD');
/*!40000 ALTER TABLE `budget_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `budget_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `total_budget` decimal(12,2) DEFAULT NULL,
  `notes` text,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`budget_id`),
  UNIQUE KEY `invitation_id` (`invitation_id`),
  CONSTRAINT `fk_budgets_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` VALUES (1,1,12000.00,'Fictional wedding budget in USD','2026-09-15 13:35:46.245997','2026-09-15 13:35:46.245997'),(2,61,0.00,NULL,'2026-10-20 10:21:38.688499','2026-10-20 10:21:38.688499');
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_tables`
--

DROP TABLE IF EXISTS `event_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_tables` (
  `table_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `table_name` varchar(120) NOT NULL,
  `table_label` varchar(255) DEFAULT NULL,
  `capacity` int NOT NULL DEFAULT '10',
  `sort_order` int NOT NULL DEFAULT '0',
  `notes` text,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`table_id`),
  UNIQUE KEY `uk_event_tables_invitation_name` (`invitation_id`,`table_name`),
  KEY `idx_event_tables_invitation_sort` (`invitation_id`,`sort_order`,`table_name`),
  CONSTRAINT `fk_event_tables_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_tables`
--

LOCK TABLES `event_tables` WRITE;
/*!40000 ALTER TABLE `event_tables` DISABLE KEYS */;
INSERT INTO `event_tables` VALUES (1,1,'Family Table A','A1',10,1,'Reserved for close family','2026-09-15 13:35:46.234469','2026-09-15 13:35:46.234469'),(2,61,'តុ ១',NULL,10,0,'{\"x\":10,\"y\":21}','2026-10-22 05:16:45.200722','2026-10-22 05:16:45.200722');
/*!40000 ALTER TABLE `event_tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `template_type` varchar(255) NOT NULL,
  `groom` varchar(255) DEFAULT NULL,
  `bride` varchar(255) DEFAULT NULL,
  `event_date` date NOT NULL,
  `eating_time` time DEFAULT NULL,
  `location` text,
  `description` text,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'DRAFT',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_events_status_deleted_date` (`status`,`deleted`,`event_date`),
  KEY `idx_events_deleted` (`deleted`),
  KEY `idx_events_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','create auth schema','SQL','V1__create_auth_schema.sql',-527773867,'root','2026-09-15 12:30:56',25,1),(2,'3','create event and payment tables','SQL','V3__create_event_and_payment_tables.sql',-1500634725,'root','2026-09-15 12:30:56',308,1),(3,'4','complete invitation guest rsvp module','SQL','V4__complete_invitation_guest_rsvp_module.sql',1050154067,'root','2026-09-15 12:30:56',199,1),(4,'5','complete media file module','SQL','V5__complete_media_file_module.sql',1038126060,'root','2026-09-15 12:30:56',74,1),(5,'6','create template payment orders','SQL','V6__create_template_payment_orders.sql',-1958991093,'root','2026-09-15 12:30:56',53,1),(6,'7','create payway template payment orders','SQL','V7__create_payway_template_payment_orders.sql',-714697743,'root','2026-09-15 12:30:56',178,1),(7,'8','add payway dynamic qr fields','SQL','V8__add_payway_dynamic_qr_fields.sql',1857677014,'root','2026-09-15 12:30:57',47,1),(8,'9','add static telegram payment fields','SQL','V9__add_static_telegram_payment_fields.sql',-1052994122,'root','2026-09-15 12:30:57',164,1),(9,'10','add invitation delivery','SQL','V10__add_invitation_delivery.sql',518346182,'root','2026-09-15 12:30:57',36,1),(10,'11','add planning gifts and budget item fields','SQL','V11__add_planning_gifts_and_budget_item_fields.sql',37921707,'root','2026-09-15 12:30:57',28,1),(11,'12','add profile image to users','SQL','V12__add_profile_image_to_users.sql',-1339087107,'root','2026-09-15 12:30:57',18,1),(12,'13','add account planning and notification schema','SQL','V13__add_account_planning_and_notification_schema.sql',-1358903235,'root','2026-09-15 12:30:57',422,1),(13,'14','seed royal khmer wedding template','SQL','V14__seed_royal_khmer_wedding_template.sql',1847837799,'root','2026-09-15 12:30:57',2,1),(14,'15','seed garden royal khmer wedding template','SQL','V15__seed_garden_royal_khmer_wedding_template.sql',-1853994316,'root','2026-09-15 12:30:57',1,1),(15,'16','keep single invitation template','SQL','V16__keep_single_invitation_template.sql',1431590498,'root','2026-09-15 12:30:57',7,1),(16,'17','enforce guest contact uniqueness','SQL','V17__enforce_guest_contact_uniqueness.sql',-1885629312,'root','2026-09-15 12:30:57',53,1),(17,'18','complete subscription payment fulfillment','SQL','V18__complete_subscription_payment_fulfillment.sql',2095967862,'root','2026-09-15 13:35:41',129,1),(18,'19','add static subscription payment reconciliation','SQL','V19__add_static_subscription_payment_reconciliation.sql',1436389723,'root','2026-09-17 01:45:23',376,1),(19,'20','align audit logs schema','SQL','V20__align_audit_logs_schema.sql',-825251169,'root','2026-09-21 09:18:22',87,1),(20,'21','add jpa auditing fields to users','SQL','V21__add_jpa_auditing_fields_to_users.sql',-1014940375,'root','2026-09-21 09:18:22',90,1),(21,'22','seed khmer celestial template','SQL','V22__seed_khmer_celestial_template.sql',-963910574,'root','2026-09-21 09:18:22',15,1),(22,'23','enable khmer celestial opening video','SQL','V23__enable_khmer_celestial_opening_video.sql',-1917272846,'root','2026-09-21 12:10:18',27,1),(23,'26','add currency to wedding finances','SQL','V26__add_currency_to_wedding_finances.sql',2101184357,'root','2026-10-02 02:24:17',87,1),(24,'27','add template colors','SQL','V27__add_template_colors.sql',773180543,'root','2026-10-02 02:24:17',34,1),(25,'28','persist verified provider identities','SQL','V28__persist_verified_provider_identities.sql',196157390,'root','2026-10-03 04:27:32',111,1),(26,'29','preserve staff role','SQL','V29__preserve_staff_role.sql',-1874260590,'root','2026-10-03 04:27:32',102,1),(27,'30','preserve check in undo history','SQL','V30__preserve_check_in_undo_history.sql',-53038951,'root','2026-10-03 04:27:33',75,1),(28,'31','add guest companion name','SQL','V31__add_guest_companion_name.sql',384654105,'root','2026-10-13 08:11:39',313,1),(29,'32','link wedding gifts to guests','SQL','V32__link_wedding_gifts_to_guests.sql',1219078746,'root','2026-10-13 08:11:39',83,1),(30,'33','payment evidence and notification delivery','SQL','V33__payment_evidence_and_notification_delivery.sql',1422459132,'root','2026-10-13 08:11:39',186,1),(31,'34','add payment evidence transaction date','SQL','V34__add_payment_evidence_transaction_date.sql',-1875407034,'root','2026-10-13 09:00:19',52,1),(32,'35','register silk heritage template','SQL','V35__register_silk_heritage_template.sql',-1183098048,'root','2026-10-13 14:59:11',32,1),(33,'36','add public visible to packages','SQL','V36__add_public_visible_to_packages.sql',-1137495791,'root','2026-10-15 18:29:49',269,1),(34,'37','template compatibility and draft identity','SQL','V37__template_compatibility_and_draft_identity.sql',627066683,'root','2026-10-20 09:16:10',299,1),(35,'38','invitation ticket designs','SQL','V38__invitation_ticket_designs.sql',1486202348,'root','2026-10-20 14:26:57',57,1),(36,'39','cascade invitation ticket design cleanup','SQL','V39__cascade_invitation_ticket_design_cleanup.sql',1935851697,'root','2026-10-20 15:35:46',34,1),(37,'40','seed khmer royal lotus template','SQL','V40__seed_khmer_royal_lotus_template.sql',-2139408080,'root','2026-10-22 12:08:48',62,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_check_in_events`
--

DROP TABLE IF EXISTS `guest_check_in_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_check_in_events` (
  `event_id` bigint NOT NULL AUTO_INCREMENT,
  `check_in_id` bigint NOT NULL,
  `action` varchar(20) NOT NULL,
  `actor_user_id` bigint DEFAULT NULL,
  `occurred_at` datetime(6) NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`event_id`),
  KEY `fk_check_in_event_actor` (`actor_user_id`),
  KEY `idx_check_in_events_history` (`check_in_id`,`occurred_at`,`event_id`),
  CONSTRAINT `fk_check_in_event_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_check_in_event_state` FOREIGN KEY (`check_in_id`) REFERENCES `guest_check_ins` (`check_in_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_check_in_events`
--

LOCK TABLES `guest_check_in_events` WRITE;
/*!40000 ALTER TABLE `guest_check_in_events` DISABLE KEYS */;
INSERT INTO `guest_check_in_events` VALUES (1,1,'CHECKED_IN',2,'2026-09-15 13:35:46.241995','MANUAL','Development fixture check-in');
/*!40000 ALTER TABLE `guest_check_in_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_check_ins`
--

DROP TABLE IF EXISTS `guest_check_ins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_check_ins` (
  `check_in_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_id` bigint NOT NULL,
  `checked_in_by` bigint DEFAULT NULL,
  `checked_in_at` datetime(6) NOT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'MANUAL',
  `note` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `undone_at` datetime(6) DEFAULT NULL,
  `undone_by` bigint DEFAULT NULL,
  PRIMARY KEY (`check_in_id`),
  UNIQUE KEY `uk_guest_check_ins_guest` (`guest_id`),
  KEY `idx_guest_check_ins_invitation` (`invitation_id`,`checked_in_at`),
  KEY `idx_guest_check_ins_checked_by` (`checked_in_by`),
  KEY `fk_check_in_undone_by` (`undone_by`),
  CONSTRAINT `fk_check_in_undone_by` FOREIGN KEY (`undone_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_guest_check_ins_checked_by` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_guest_check_ins_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_guest_check_ins_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_check_ins`
--

LOCK TABLES `guest_check_ins` WRITE;
/*!40000 ALTER TABLE `guest_check_ins` DISABLE KEYS */;
INSERT INTO `guest_check_ins` VALUES (1,1,1,2,'2026-09-15 13:35:46.241995','MANUAL','Development fixture check-in',1,NULL,NULL),(2,11,13,NULL,'2026-10-15 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(3,11,14,NULL,'2026-10-15 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-15 20:00:00.000000',NULL),(4,12,18,NULL,'2026-10-14 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(5,12,19,NULL,'2026-10-14 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-14 20:00:00.000000',NULL),(6,13,23,NULL,'2026-10-13 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(7,13,24,NULL,'2026-10-13 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(8,14,28,NULL,'2026-10-12 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(9,14,29,NULL,'2026-10-12 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-12 20:00:00.000000',NULL),(10,15,33,NULL,'2026-10-11 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(11,15,34,NULL,'2026-10-11 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-11 20:00:00.000000',NULL),(12,16,38,NULL,'2026-10-10 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(13,16,39,NULL,'2026-10-10 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(14,17,43,NULL,'2026-10-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(15,17,44,NULL,'2026-10-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-09 20:00:00.000000',NULL),(16,18,48,NULL,'2026-10-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(17,18,49,NULL,'2026-10-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-08 20:00:00.000000',NULL),(18,19,53,NULL,'2026-10-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(19,19,54,NULL,'2026-10-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(20,20,58,NULL,'2026-09-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(21,20,59,NULL,'2026-09-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-07 20:00:00.000000',NULL),(22,21,63,NULL,'2026-10-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(23,21,64,NULL,'2026-10-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-05 20:00:00.000000',NULL),(24,22,68,NULL,'2026-10-04 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(25,22,69,NULL,'2026-10-04 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(26,23,73,NULL,'2026-10-03 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(27,23,74,NULL,'2026-10-03 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-03 20:00:00.000000',NULL),(28,24,78,NULL,'2026-10-02 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(29,24,79,NULL,'2026-10-02 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-02 20:00:00.000000',NULL),(30,25,83,NULL,'2026-10-01 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(31,25,84,NULL,'2026-10-01 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(32,26,88,NULL,'2026-09-30 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(33,26,89,NULL,'2026-09-30 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-30 20:00:00.000000',NULL),(34,27,93,NULL,'2026-09-29 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(35,27,94,NULL,'2026-09-29 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-29 20:00:00.000000',NULL),(36,28,98,NULL,'2026-09-28 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(37,28,99,NULL,'2026-09-28 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(38,29,103,NULL,'2026-09-27 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(39,29,104,NULL,'2026-09-27 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-27 20:00:00.000000',NULL),(40,30,108,NULL,'2026-09-04 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(41,30,109,NULL,'2026-09-04 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-04 20:00:00.000000',NULL),(42,31,113,NULL,'2026-09-25 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(43,31,114,NULL,'2026-09-25 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(44,32,118,NULL,'2026-09-24 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(45,32,119,NULL,'2026-09-24 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-24 20:00:00.000000',NULL),(46,33,123,NULL,'2026-09-23 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(47,33,124,NULL,'2026-09-23 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-23 20:00:00.000000',NULL),(48,34,128,NULL,'2026-09-22 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(49,34,129,NULL,'2026-09-22 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(50,35,133,NULL,'2026-09-21 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(51,35,134,NULL,'2026-09-21 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-21 20:00:00.000000',NULL),(52,36,138,NULL,'2026-09-20 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(53,36,139,NULL,'2026-09-20 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-20 20:00:00.000000',NULL),(54,37,143,NULL,'2026-09-19 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(55,37,144,NULL,'2026-09-19 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(56,38,148,NULL,'2026-09-18 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(57,38,149,NULL,'2026-09-18 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-18 20:00:00.000000',NULL),(58,39,153,NULL,'2026-10-15 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(59,39,154,NULL,'2026-10-15 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-15 20:00:00.000000',NULL),(60,40,158,NULL,'2026-09-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(61,40,159,NULL,'2026-09-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(62,41,163,NULL,'2026-10-13 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(63,41,164,NULL,'2026-10-13 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-13 20:00:00.000000',NULL),(64,42,168,NULL,'2026-10-12 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(65,42,169,NULL,'2026-10-12 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-12 20:00:00.000000',NULL),(66,43,173,NULL,'2026-10-11 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(67,43,174,NULL,'2026-10-11 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(68,44,178,NULL,'2026-10-10 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(69,44,179,NULL,'2026-10-10 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-10 20:00:00.000000',NULL),(70,45,183,NULL,'2026-10-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(71,45,184,NULL,'2026-10-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-09 20:00:00.000000',NULL),(72,46,188,NULL,'2026-10-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(73,46,189,NULL,'2026-10-08 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(74,47,193,NULL,'2026-10-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(75,47,194,NULL,'2026-10-07 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-07 20:00:00.000000',NULL),(76,48,198,NULL,'2026-10-06 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(77,48,199,NULL,'2026-10-06 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-06 20:00:00.000000',NULL),(78,49,203,NULL,'2026-10-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(79,49,204,NULL,'2026-10-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(80,50,208,NULL,'2026-09-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(81,50,209,NULL,'2026-09-05 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-05 20:00:00.000000',NULL),(82,51,213,NULL,'2026-10-03 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(83,51,214,NULL,'2026-10-03 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-03 20:00:00.000000',NULL),(84,52,218,NULL,'2026-10-02 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(85,52,219,NULL,'2026-10-02 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(86,53,223,NULL,'2026-10-01 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(87,53,224,NULL,'2026-10-01 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-10-01 20:00:00.000000',NULL),(88,54,228,NULL,'2026-09-30 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(89,54,229,NULL,'2026-09-30 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-30 20:00:00.000000',NULL),(90,55,233,NULL,'2026-09-29 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(91,55,234,NULL,'2026-09-29 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(92,56,238,NULL,'2026-09-28 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(93,56,239,NULL,'2026-09-28 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-28 20:00:00.000000',NULL),(94,57,243,NULL,'2026-09-27 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(95,57,244,NULL,'2026-09-27 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-27 20:00:00.000000',NULL),(96,58,248,NULL,'2026-09-26 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(97,58,249,NULL,'2026-09-26 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(98,59,253,NULL,'2026-09-25 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(99,59,254,NULL,'2026-09-25 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-25 20:00:00.000000',NULL),(100,60,258,NULL,'2026-09-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',1,NULL,NULL),(101,60,259,NULL,'2026-09-09 19:00:00.000000','MANUAL','QA_ADMIN_REPORTS_50',0,'2026-09-09 20:00:00.000000',NULL);
/*!40000 ALTER TABLE `guest_check_ins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_seat_assignments`
--

DROP TABLE IF EXISTS `guest_seat_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_seat_assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `table_id` bigint NOT NULL,
  `guest_id` bigint NOT NULL,
  `seat_label` varchar(80) DEFAULT NULL,
  `seat_count` int NOT NULL DEFAULT '1',
  `notes` text,
  `assigned_at` datetime(6) NOT NULL,
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `uk_guest_seat_assignments_guest` (`guest_id`),
  KEY `idx_guest_seat_assignments_invitation` (`invitation_id`,`table_id`),
  KEY `idx_guest_seat_assignments_table` (`table_id`),
  CONSTRAINT `fk_guest_seat_assignments_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_guest_seat_assignments_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_guest_seat_assignments_table` FOREIGN KEY (`table_id`) REFERENCES `event_tables` (`table_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_seat_assignments`
--

LOCK TABLES `guest_seat_assignments` WRITE;
/*!40000 ALTER TABLE `guest_seat_assignments` DISABLE KEYS */;
INSERT INTO `guest_seat_assignments` VALUES (1,1,1,1,'A1-01',2,'Fictional fixture seating assignment','2026-09-15 13:35:46.238996');
/*!40000 ALTER TABLE `guest_seat_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guests`
--

DROP TABLE IF EXISTS `guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests` (
  `guest_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `guest_group` varchar(255) DEFAULT NULL,
  `side_type` varchar(255) DEFAULT NULL,
  `table_number` varchar(255) DEFAULT NULL,
  `invite_token` varchar(255) DEFAULT NULL,
  `qr_code_url` varchar(1000) DEFAULT NULL,
  `send_status` varchar(50) DEFAULT NULL,
  `invitation_viewed_at` datetime(6) DEFAULT NULL,
  `contribution_status` varchar(50) DEFAULT NULL,
  `total_contributed` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `seat_count` int DEFAULT NULL,
  `note` text,
  `last_sent_at` datetime(6) DEFAULT NULL,
  `last_reminder_at` datetime(6) DEFAULT NULL,
  `reminder_count` int DEFAULT '0',
  `last_send_channel` varchar(50) DEFAULT NULL,
  `last_send_error` varchar(1000) DEFAULT NULL,
  `email_normalized` varchar(255) GENERATED ALWAYS AS (nullif(lower(trim(`email`)),_utf8mb4'')) STORED,
  `phone_normalized` varchar(255) GENERATED ALWAYS AS (nullif(trim(`phone`),_utf8mb4'')) STORED,
  `companion_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`guest_id`),
  UNIQUE KEY `invite_token` (`invite_token`),
  UNIQUE KEY `uk_guests_invitation_email_normalized` (`invitation_id`,`email_normalized`),
  UNIQUE KEY `uk_guests_invitation_phone_normalized` (`invitation_id`,`phone_normalized`),
  KEY `idx_guests_invitation_id` (`invitation_id`),
  CONSTRAINT `fk_guests_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
INSERT INTO `guests` (`guest_id`, `invitation_id`, `guest_name`, `phone`, `email`, `guest_group`, `side_type`, `table_number`, `invite_token`, `qr_code_url`, `send_status`, `invitation_viewed_at`, `contribution_status`, `total_contributed`, `created_at`, `seat_count`, `note`, `last_sent_at`, `last_reminder_at`, `reminder_count`, `last_send_channel`, `last_send_error`, `companion_name`) VALUES (1,1,'Dara Sok','012345679','dara.sok@example.com','Friends','GROOM','A1','demo-guest-attending-token','/i/demo-wedding?token=demo-guest-attending-token','SENT','2026-09-22 01:20:26.396178','PENDING',0.00,'2026-09-15 13:35:46.217911',2,'Fictional development guest',NULL,NULL,0,NULL,NULL,NULL),(2,1,'Sophea Lim','012345682','sophea.lim@example.com','Friends','BRIDE','A1','demo-guest-declined-token','/i/demo-wedding?token=demo-guest-declined-token','SENT',NULL,'PENDING',0.00,'2026-09-15 13:35:46.220916',1,'Fictional development guest',NULL,NULL,0,NULL,NULL,NULL),(3,1,'Chan Family','012345680','chan.family@example.com','Family','BRIDE','A1','demo-guest-pending-token','/i/demo-wedding?token=demo-guest-pending-token','SENT',NULL,'PENDING',0.00,'2026-09-15 13:35:46.223917',4,'Fictional development guest',NULL,NULL,0,NULL,NULL,NULL),(4,2,'Nha',NULL,NULL,NULL,NULL,NULL,'c707fc318a974be38f87a353f12b484c','/i/wedding?token=c707fc318a974be38f87a353f12b484c','RESPONDED','2026-09-17 02:09:13.155251',NULL,NULL,'2026-09-17 02:09:13.141602',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL),(13,11,'QA Reports 50 Guest 001-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-001-guest-1',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(14,11,'QA Reports 50 Guest 001-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-001-guest-2',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(15,11,'QA Reports 50 Guest 001-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-001-guest-3',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(16,11,'QA Reports 50 Guest 001-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-001-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-15 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(17,11,'QA Reports 50 Guest 001-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-001-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(18,12,'QA Reports 50 Guest 002-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-002-guest-1',NULL,'SENT','2026-10-14 17:00:00.000000',NULL,NULL,'2026-10-14 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-14 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(19,12,'QA Reports 50 Guest 002-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-002-guest-2',NULL,'SENT','2026-10-14 17:00:00.000000',NULL,NULL,'2026-10-14 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-14 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(20,12,'QA Reports 50 Guest 002-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-002-guest-3',NULL,'SENT','2026-10-14 17:00:00.000000',NULL,NULL,'2026-10-14 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-14 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(21,12,'QA Reports 50 Guest 002-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-002-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-14 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-14 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(22,12,'QA Reports 50 Guest 002-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-002-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-14 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(23,13,'QA Reports 50 Guest 003-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-003-guest-1',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(24,13,'QA Reports 50 Guest 003-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-003-guest-2',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(25,13,'QA Reports 50 Guest 003-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-003-guest-3',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(26,13,'QA Reports 50 Guest 003-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-003-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-13 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(27,13,'QA Reports 50 Guest 003-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-003-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(28,14,'QA Reports 50 Guest 004-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-004-guest-1',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(29,14,'QA Reports 50 Guest 004-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-004-guest-2',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(30,14,'QA Reports 50 Guest 004-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-004-guest-3',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(31,14,'QA Reports 50 Guest 004-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-004-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-12 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(32,14,'QA Reports 50 Guest 004-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-004-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(33,15,'QA Reports 50 Guest 005-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-005-guest-1',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(34,15,'QA Reports 50 Guest 005-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-005-guest-2',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(35,15,'QA Reports 50 Guest 005-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-005-guest-3',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(36,15,'QA Reports 50 Guest 005-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-005-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-11 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(37,15,'QA Reports 50 Guest 005-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-005-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(38,16,'QA Reports 50 Guest 006-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-006-guest-1',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(39,16,'QA Reports 50 Guest 006-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-006-guest-2',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(40,16,'QA Reports 50 Guest 006-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-006-guest-3',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(41,16,'QA Reports 50 Guest 006-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-006-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-10 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(42,16,'QA Reports 50 Guest 006-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-006-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(43,17,'QA Reports 50 Guest 007-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-007-guest-1',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(44,17,'QA Reports 50 Guest 007-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-007-guest-2',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(45,17,'QA Reports 50 Guest 007-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-007-guest-3',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(46,17,'QA Reports 50 Guest 007-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-007-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(47,17,'QA Reports 50 Guest 007-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-007-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(48,18,'QA Reports 50 Guest 008-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-008-guest-1',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(49,18,'QA Reports 50 Guest 008-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-008-guest-2',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(50,18,'QA Reports 50 Guest 008-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-008-guest-3',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(51,18,'QA Reports 50 Guest 008-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-008-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(52,18,'QA Reports 50 Guest 008-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-008-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(53,19,'QA Reports 50 Guest 009-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-009-guest-1',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(54,19,'QA Reports 50 Guest 009-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-009-guest-2',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(55,19,'QA Reports 50 Guest 009-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-009-guest-3',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(56,19,'QA Reports 50 Guest 009-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-009-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(57,19,'QA Reports 50 Guest 009-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-009-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(58,20,'QA Reports 50 Guest 010-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-010-guest-1',NULL,'SENT','2026-09-07 17:00:00.000000',NULL,NULL,'2026-09-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(59,20,'QA Reports 50 Guest 010-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-010-guest-2',NULL,'SENT','2026-09-07 17:00:00.000000',NULL,NULL,'2026-09-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(60,20,'QA Reports 50 Guest 010-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-010-guest-3',NULL,'SENT','2026-09-07 17:00:00.000000',NULL,NULL,'2026-09-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(61,20,'QA Reports 50 Guest 010-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-010-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(62,20,'QA Reports 50 Guest 010-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-010-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(63,21,'QA Reports 50 Guest 011-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-011-guest-1',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(64,21,'QA Reports 50 Guest 011-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-011-guest-2',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(65,21,'QA Reports 50 Guest 011-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-011-guest-3',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(66,21,'QA Reports 50 Guest 011-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-011-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(67,21,'QA Reports 50 Guest 011-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-011-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(68,22,'QA Reports 50 Guest 012-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-012-guest-1',NULL,'SENT','2026-10-04 17:00:00.000000',NULL,NULL,'2026-10-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(69,22,'QA Reports 50 Guest 012-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-012-guest-2',NULL,'SENT','2026-10-04 17:00:00.000000',NULL,NULL,'2026-10-04 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(70,22,'QA Reports 50 Guest 012-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-012-guest-3',NULL,'SENT','2026-10-04 17:00:00.000000',NULL,NULL,'2026-10-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(71,22,'QA Reports 50 Guest 012-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-012-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-04 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(72,22,'QA Reports 50 Guest 012-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-012-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(73,23,'QA Reports 50 Guest 013-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-013-guest-1',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(74,23,'QA Reports 50 Guest 013-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-013-guest-2',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(75,23,'QA Reports 50 Guest 013-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-013-guest-3',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(76,23,'QA Reports 50 Guest 013-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-013-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-03 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(77,23,'QA Reports 50 Guest 013-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-013-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(78,24,'QA Reports 50 Guest 014-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-014-guest-1',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(79,24,'QA Reports 50 Guest 014-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-014-guest-2',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(80,24,'QA Reports 50 Guest 014-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-014-guest-3',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(81,24,'QA Reports 50 Guest 014-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-014-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-02 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(82,24,'QA Reports 50 Guest 014-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-014-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(83,25,'QA Reports 50 Guest 015-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-015-guest-1',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(84,25,'QA Reports 50 Guest 015-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-015-guest-2',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(85,25,'QA Reports 50 Guest 015-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-015-guest-3',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(86,25,'QA Reports 50 Guest 015-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-015-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-01 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(87,25,'QA Reports 50 Guest 015-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-015-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(88,26,'QA Reports 50 Guest 016-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-016-guest-1',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(89,26,'QA Reports 50 Guest 016-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-016-guest-2',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(90,26,'QA Reports 50 Guest 016-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-016-guest-3',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(91,26,'QA Reports 50 Guest 016-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-016-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-30 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(92,26,'QA Reports 50 Guest 016-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-016-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(93,27,'QA Reports 50 Guest 017-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-017-guest-1',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(94,27,'QA Reports 50 Guest 017-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-017-guest-2',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(95,27,'QA Reports 50 Guest 017-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-017-guest-3',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(96,27,'QA Reports 50 Guest 017-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-017-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-29 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(97,27,'QA Reports 50 Guest 017-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-017-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(98,28,'QA Reports 50 Guest 018-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-018-guest-1',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(99,28,'QA Reports 50 Guest 018-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-018-guest-2',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(100,28,'QA Reports 50 Guest 018-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-018-guest-3',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(101,28,'QA Reports 50 Guest 018-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-018-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-28 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(102,28,'QA Reports 50 Guest 018-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-018-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(103,29,'QA Reports 50 Guest 019-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-019-guest-1',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(104,29,'QA Reports 50 Guest 019-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-019-guest-2',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(105,29,'QA Reports 50 Guest 019-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-019-guest-3',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(106,29,'QA Reports 50 Guest 019-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-019-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-27 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(107,29,'QA Reports 50 Guest 019-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-019-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(108,30,'QA Reports 50 Guest 020-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-020-guest-1',NULL,'SENT','2026-09-04 17:00:00.000000',NULL,NULL,'2026-09-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(109,30,'QA Reports 50 Guest 020-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-020-guest-2',NULL,'SENT','2026-09-04 17:00:00.000000',NULL,NULL,'2026-09-04 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(110,30,'QA Reports 50 Guest 020-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-020-guest-3',NULL,'SENT','2026-09-04 17:00:00.000000',NULL,NULL,'2026-09-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(111,30,'QA Reports 50 Guest 020-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-020-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-04 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-04 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(112,30,'QA Reports 50 Guest 020-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-020-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-04 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(113,31,'QA Reports 50 Guest 021-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-021-guest-1',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(114,31,'QA Reports 50 Guest 021-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-021-guest-2',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(115,31,'QA Reports 50 Guest 021-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-021-guest-3',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(116,31,'QA Reports 50 Guest 021-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-021-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-25 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(117,31,'QA Reports 50 Guest 021-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-021-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(118,32,'QA Reports 50 Guest 022-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-022-guest-1',NULL,'SENT','2026-09-24 17:00:00.000000',NULL,NULL,'2026-09-24 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-24 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(119,32,'QA Reports 50 Guest 022-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-022-guest-2',NULL,'SENT','2026-09-24 17:00:00.000000',NULL,NULL,'2026-09-24 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-24 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(120,32,'QA Reports 50 Guest 022-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-022-guest-3',NULL,'SENT','2026-09-24 17:00:00.000000',NULL,NULL,'2026-09-24 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-24 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(121,32,'QA Reports 50 Guest 022-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-022-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-24 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-24 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(122,32,'QA Reports 50 Guest 022-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-022-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-24 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(123,33,'QA Reports 50 Guest 023-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-023-guest-1',NULL,'SENT','2026-09-23 17:00:00.000000',NULL,NULL,'2026-09-23 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-23 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(124,33,'QA Reports 50 Guest 023-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-023-guest-2',NULL,'SENT','2026-09-23 17:00:00.000000',NULL,NULL,'2026-09-23 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-23 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(125,33,'QA Reports 50 Guest 023-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-023-guest-3',NULL,'SENT','2026-09-23 17:00:00.000000',NULL,NULL,'2026-09-23 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-23 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(126,33,'QA Reports 50 Guest 023-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-023-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-23 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-23 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(127,33,'QA Reports 50 Guest 023-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-023-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-23 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(128,34,'QA Reports 50 Guest 024-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-024-guest-1',NULL,'SENT','2026-09-22 17:00:00.000000',NULL,NULL,'2026-09-22 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-22 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(129,34,'QA Reports 50 Guest 024-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-024-guest-2',NULL,'SENT','2026-09-22 17:00:00.000000',NULL,NULL,'2026-09-22 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-22 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(130,34,'QA Reports 50 Guest 024-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-024-guest-3',NULL,'SENT','2026-09-22 17:00:00.000000',NULL,NULL,'2026-09-22 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-22 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(131,34,'QA Reports 50 Guest 024-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-024-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-22 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-22 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(132,34,'QA Reports 50 Guest 024-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-024-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-22 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(133,35,'QA Reports 50 Guest 025-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-025-guest-1',NULL,'SENT','2026-09-21 17:00:00.000000',NULL,NULL,'2026-09-21 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-21 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(134,35,'QA Reports 50 Guest 025-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-025-guest-2',NULL,'SENT','2026-09-21 17:00:00.000000',NULL,NULL,'2026-09-21 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-21 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(135,35,'QA Reports 50 Guest 025-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-025-guest-3',NULL,'SENT','2026-09-21 17:00:00.000000',NULL,NULL,'2026-09-21 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-21 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(136,35,'QA Reports 50 Guest 025-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-025-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-21 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-21 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(137,35,'QA Reports 50 Guest 025-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-025-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-21 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(138,36,'QA Reports 50 Guest 026-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-026-guest-1',NULL,'SENT','2026-09-20 17:00:00.000000',NULL,NULL,'2026-09-20 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-20 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(139,36,'QA Reports 50 Guest 026-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-026-guest-2',NULL,'SENT','2026-09-20 17:00:00.000000',NULL,NULL,'2026-09-20 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-20 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(140,36,'QA Reports 50 Guest 026-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-026-guest-3',NULL,'SENT','2026-09-20 17:00:00.000000',NULL,NULL,'2026-09-20 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-20 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(141,36,'QA Reports 50 Guest 026-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-026-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-20 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-20 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(142,36,'QA Reports 50 Guest 026-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-026-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-20 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(143,37,'QA Reports 50 Guest 027-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-027-guest-1',NULL,'SENT','2026-09-19 17:00:00.000000',NULL,NULL,'2026-09-19 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-19 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(144,37,'QA Reports 50 Guest 027-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-027-guest-2',NULL,'SENT','2026-09-19 17:00:00.000000',NULL,NULL,'2026-09-19 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-19 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(145,37,'QA Reports 50 Guest 027-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-027-guest-3',NULL,'SENT','2026-09-19 17:00:00.000000',NULL,NULL,'2026-09-19 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-19 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(146,37,'QA Reports 50 Guest 027-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-027-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-19 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-19 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(147,37,'QA Reports 50 Guest 027-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-027-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-19 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(148,38,'QA Reports 50 Guest 028-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-028-guest-1',NULL,'SENT','2026-09-18 17:00:00.000000',NULL,NULL,'2026-09-18 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-18 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(149,38,'QA Reports 50 Guest 028-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-028-guest-2',NULL,'SENT','2026-09-18 17:00:00.000000',NULL,NULL,'2026-09-18 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-18 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(150,38,'QA Reports 50 Guest 028-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-028-guest-3',NULL,'SENT','2026-09-18 17:00:00.000000',NULL,NULL,'2026-09-18 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-18 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(151,38,'QA Reports 50 Guest 028-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-028-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-18 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-18 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(152,38,'QA Reports 50 Guest 028-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-028-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-18 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(153,39,'QA Reports 50 Guest 029-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-029-guest-1',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(154,39,'QA Reports 50 Guest 029-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-029-guest-2',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(155,39,'QA Reports 50 Guest 029-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-029-guest-3',NULL,'SENT','2026-10-15 17:00:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(156,39,'QA Reports 50 Guest 029-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-029-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-15 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-15 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(157,39,'QA Reports 50 Guest 029-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-029-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-15 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(158,40,'QA Reports 50 Guest 030-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-030-guest-1',NULL,'SENT','2026-09-08 17:00:00.000000',NULL,NULL,'2026-09-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(159,40,'QA Reports 50 Guest 030-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-030-guest-2',NULL,'SENT','2026-09-08 17:00:00.000000',NULL,NULL,'2026-09-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(160,40,'QA Reports 50 Guest 030-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-030-guest-3',NULL,'SENT','2026-09-08 17:00:00.000000',NULL,NULL,'2026-09-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(161,40,'QA Reports 50 Guest 030-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-030-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(162,40,'QA Reports 50 Guest 030-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-030-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(163,41,'QA Reports 50 Guest 031-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-031-guest-1',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(164,41,'QA Reports 50 Guest 031-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-031-guest-2',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(165,41,'QA Reports 50 Guest 031-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-031-guest-3',NULL,'SENT','2026-10-13 17:00:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(166,41,'QA Reports 50 Guest 031-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-031-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-13 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-13 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(167,41,'QA Reports 50 Guest 031-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-031-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-13 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(168,42,'QA Reports 50 Guest 032-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-032-guest-1',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(169,42,'QA Reports 50 Guest 032-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-032-guest-2',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(170,42,'QA Reports 50 Guest 032-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-032-guest-3',NULL,'SENT','2026-10-12 17:00:00.000000',NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(171,42,'QA Reports 50 Guest 032-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-032-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-12 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-12 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(172,42,'QA Reports 50 Guest 032-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-032-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-12 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(173,43,'QA Reports 50 Guest 033-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-033-guest-1',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(174,43,'QA Reports 50 Guest 033-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-033-guest-2',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(175,43,'QA Reports 50 Guest 033-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-033-guest-3',NULL,'SENT','2026-10-11 17:00:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(176,43,'QA Reports 50 Guest 033-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-033-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-11 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-11 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(177,43,'QA Reports 50 Guest 033-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-033-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-11 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(178,44,'QA Reports 50 Guest 034-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-034-guest-1',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(179,44,'QA Reports 50 Guest 034-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-034-guest-2',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(180,44,'QA Reports 50 Guest 034-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-034-guest-3',NULL,'SENT','2026-10-10 17:00:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(181,44,'QA Reports 50 Guest 034-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-034-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-10 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-10 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(182,44,'QA Reports 50 Guest 034-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-034-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-10 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(183,45,'QA Reports 50 Guest 035-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-035-guest-1',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(184,45,'QA Reports 50 Guest 035-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-035-guest-2',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(185,45,'QA Reports 50 Guest 035-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-035-guest-3',NULL,'SENT','2026-10-09 17:00:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(186,45,'QA Reports 50 Guest 035-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-035-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(187,45,'QA Reports 50 Guest 035-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-035-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(188,46,'QA Reports 50 Guest 036-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-036-guest-1',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(189,46,'QA Reports 50 Guest 036-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-036-guest-2',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(190,46,'QA Reports 50 Guest 036-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-036-guest-3',NULL,'SENT','2026-10-08 17:00:00.000000',NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(191,46,'QA Reports 50 Guest 036-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-036-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-08 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-08 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(192,46,'QA Reports 50 Guest 036-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-036-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-08 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(193,47,'QA Reports 50 Guest 037-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-037-guest-1',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(194,47,'QA Reports 50 Guest 037-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-037-guest-2',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(195,47,'QA Reports 50 Guest 037-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-037-guest-3',NULL,'SENT','2026-10-07 17:00:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(196,47,'QA Reports 50 Guest 037-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-037-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-07 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-07 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(197,47,'QA Reports 50 Guest 037-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-037-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-07 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(198,48,'QA Reports 50 Guest 038-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-038-guest-1',NULL,'SENT','2026-10-06 17:00:00.000000',NULL,NULL,'2026-10-06 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-06 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(199,48,'QA Reports 50 Guest 038-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-038-guest-2',NULL,'SENT','2026-10-06 17:00:00.000000',NULL,NULL,'2026-10-06 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-06 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(200,48,'QA Reports 50 Guest 038-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-038-guest-3',NULL,'SENT','2026-10-06 17:00:00.000000',NULL,NULL,'2026-10-06 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-06 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(201,48,'QA Reports 50 Guest 038-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-038-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-06 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-06 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(202,48,'QA Reports 50 Guest 038-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-038-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-06 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(203,49,'QA Reports 50 Guest 039-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-039-guest-1',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(204,49,'QA Reports 50 Guest 039-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-039-guest-2',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(205,49,'QA Reports 50 Guest 039-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-039-guest-3',NULL,'SENT','2026-10-05 17:00:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(206,49,'QA Reports 50 Guest 039-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-039-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(207,49,'QA Reports 50 Guest 039-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-039-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(208,50,'QA Reports 50 Guest 040-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-040-guest-1',NULL,'SENT','2026-09-05 17:00:00.000000',NULL,NULL,'2026-09-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(209,50,'QA Reports 50 Guest 040-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-040-guest-2',NULL,'SENT','2026-09-05 17:00:00.000000',NULL,NULL,'2026-09-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(210,50,'QA Reports 50 Guest 040-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-040-guest-3',NULL,'SENT','2026-09-05 17:00:00.000000',NULL,NULL,'2026-09-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(211,50,'QA Reports 50 Guest 040-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-040-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-05 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-05 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(212,50,'QA Reports 50 Guest 040-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-040-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-05 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(213,51,'QA Reports 50 Guest 041-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-041-guest-1',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(214,51,'QA Reports 50 Guest 041-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-041-guest-2',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(215,51,'QA Reports 50 Guest 041-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-041-guest-3',NULL,'SENT','2026-10-03 17:00:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(216,51,'QA Reports 50 Guest 041-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-041-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-03 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-03 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(217,51,'QA Reports 50 Guest 041-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-041-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-03 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(218,52,'QA Reports 50 Guest 042-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-042-guest-1',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(219,52,'QA Reports 50 Guest 042-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-042-guest-2',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(220,52,'QA Reports 50 Guest 042-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-042-guest-3',NULL,'SENT','2026-10-02 17:00:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(221,52,'QA Reports 50 Guest 042-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-042-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-02 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-02 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(222,52,'QA Reports 50 Guest 042-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-042-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-02 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(223,53,'QA Reports 50 Guest 043-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-043-guest-1',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(224,53,'QA Reports 50 Guest 043-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-043-guest-2',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(225,53,'QA Reports 50 Guest 043-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-043-guest-3',NULL,'SENT','2026-10-01 17:00:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(226,53,'QA Reports 50 Guest 043-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-043-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-10-01 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-10-01 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(227,53,'QA Reports 50 Guest 043-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-043-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-10-01 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(228,54,'QA Reports 50 Guest 044-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-044-guest-1',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(229,54,'QA Reports 50 Guest 044-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-044-guest-2',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(230,54,'QA Reports 50 Guest 044-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-044-guest-3',NULL,'SENT','2026-09-30 17:00:00.000000',NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(231,54,'QA Reports 50 Guest 044-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-044-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-30 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-30 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(232,54,'QA Reports 50 Guest 044-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-044-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-30 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(233,55,'QA Reports 50 Guest 045-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-045-guest-1',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(234,55,'QA Reports 50 Guest 045-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-045-guest-2',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(235,55,'QA Reports 50 Guest 045-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-045-guest-3',NULL,'SENT','2026-09-29 17:00:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(236,55,'QA Reports 50 Guest 045-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-045-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-29 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-29 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(237,55,'QA Reports 50 Guest 045-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-045-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-29 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(238,56,'QA Reports 50 Guest 046-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-046-guest-1',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(239,56,'QA Reports 50 Guest 046-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-046-guest-2',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(240,56,'QA Reports 50 Guest 046-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-046-guest-3',NULL,'SENT','2026-09-28 17:00:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(241,56,'QA Reports 50 Guest 046-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-046-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-28 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-28 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(242,56,'QA Reports 50 Guest 046-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-046-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-28 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(243,57,'QA Reports 50 Guest 047-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-047-guest-1',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(244,57,'QA Reports 50 Guest 047-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-047-guest-2',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(245,57,'QA Reports 50 Guest 047-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-047-guest-3',NULL,'SENT','2026-09-27 17:00:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(246,57,'QA Reports 50 Guest 047-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-047-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-27 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-27 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(247,57,'QA Reports 50 Guest 047-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-047-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-27 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(248,58,'QA Reports 50 Guest 048-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-048-guest-1',NULL,'SENT','2026-09-26 17:00:00.000000',NULL,NULL,'2026-09-26 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-26 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(249,58,'QA Reports 50 Guest 048-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-048-guest-2',NULL,'SENT','2026-09-26 17:00:00.000000',NULL,NULL,'2026-09-26 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-26 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(250,58,'QA Reports 50 Guest 048-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-048-guest-3',NULL,'SENT','2026-09-26 17:00:00.000000',NULL,NULL,'2026-09-26 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-26 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(251,58,'QA Reports 50 Guest 048-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-048-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-26 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-26 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(252,58,'QA Reports 50 Guest 048-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-048-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-26 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(253,59,'QA Reports 50 Guest 049-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-049-guest-1',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(254,59,'QA Reports 50 Guest 049-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-049-guest-2',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(255,59,'QA Reports 50 Guest 049-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-049-guest-3',NULL,'SENT','2026-09-25 17:00:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(256,59,'QA Reports 50 Guest 049-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-049-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-25 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-25 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(257,59,'QA Reports 50 Guest 049-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-049-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-25 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(258,60,'QA Reports 50 Guest 050-1',NULL,NULL,'Family','BRIDE',NULL,'qa-admin-reports-50-050-guest-1',NULL,'SENT','2026-09-09 17:00:00.000000',NULL,NULL,'2026-09-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(259,60,'QA Reports 50 Guest 050-2',NULL,NULL,'Family','GROOM',NULL,'qa-admin-reports-50-050-guest-2',NULL,'SENT','2026-09-09 17:00:00.000000',NULL,NULL,'2026-09-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(260,60,'QA Reports 50 Guest 050-3',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-050-guest-3',NULL,'SENT','2026-09-09 17:00:00.000000',NULL,NULL,'2026-09-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50','2026-09-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(261,60,'QA Reports 50 Guest 050-4',NULL,NULL,'Friends','GROOM',NULL,'qa-admin-reports-50-050-guest-4',NULL,'SENT',NULL,NULL,NULL,'2026-09-09 15:00:00.000000',1,'QA_ADMIN_REPORTS_50','2026-09-09 16:00:00.000000',NULL,0,'SYSTEM',NULL,NULL),(262,60,'QA Reports 50 Guest 050-5',NULL,NULL,'Friends','BRIDE',NULL,'qa-admin-reports-50-050-guest-5',NULL,'NOT_SENT',NULL,NULL,NULL,'2026-09-09 15:00:00.000000',2,'QA_ADMIN_REPORTS_50',NULL,NULL,0,NULL,NULL,NULL),(263,61,'លោក​ រ៉ាន់​ ណារ៉ាត់','060400658',NULL,'Groom Side','College Friend','A-01','9fee0b2f5faa4a549fab2ffe2c59e7de','http://localhost:5173/i/wedding-1?token=9fee0b2f5faa4a549fab2ffe2c59e7de','LINK_GENERATED',NULL,NULL,NULL,'2026-10-20 14:25:15.246862',2,NULL,NULL,NULL,0,NULL,NULL,'និង ភរិយា');
/*!40000 ALTER TABLE `guests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_delivery_events`
--

DROP TABLE IF EXISTS `invitation_delivery_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_delivery_events` (
  `delivery_event_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_id` bigint DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `channel` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `message` text,
  `error_message` varchar(1000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`delivery_event_id`),
  KEY `idx_delivery_events_invitation_id` (`invitation_id`),
  KEY `idx_delivery_events_guest_id` (`guest_id`),
  CONSTRAINT `fk_delivery_events_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`),
  CONSTRAINT `fk_delivery_events_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_delivery_events`
--

LOCK TABLES `invitation_delivery_events` WRITE;
/*!40000 ALTER TABLE `invitation_delivery_events` DISABLE KEYS */;
INSERT INTO `invitation_delivery_events` VALUES (1,61,263,'LINK_GENERATED','LINK','LINK_GENERATED','Dear លោក​ រ៉ាន់​ ណារ៉ាត់, you are invited to សិរីមង្គលអាពាហ៍ពិពាហ៍. Open your invitation: http://localhost:5173/i/wedding-1?token=9fee0b2f5faa4a549fab2ffe2c59e7de',NULL,'2026-10-22 12:07:59.695297');
/*!40000 ALTER TABLE `invitation_delivery_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_sections`
--

DROP TABLE IF EXISTS `invitation_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_sections` (
  `section_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `section_key` varchar(50) NOT NULL,
  `section_title` varchar(255) DEFAULT NULL,
  `content_json` json DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`section_id`),
  KEY `fk_sections_invitation` (`invitation_id`),
  CONSTRAINT `fk_sections_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_sections`
--

LOCK TABLES `invitation_sections` WRITE;
/*!40000 ALTER TABLE `invitation_sections` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitation_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_ticket_designs`
--

DROP TABLE IF EXISTS `invitation_ticket_designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_ticket_designs` (
  `invitation_id` bigint NOT NULL,
  `design_json` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`invitation_id`),
  CONSTRAINT `fk_ticket_designs_invitation_cascade` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_ticket_designs`
--

LOCK TABLES `invitation_ticket_designs` WRITE;
/*!40000 ALTER TABLE `invitation_ticket_designs` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitation_ticket_designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitations`
--

DROP TABLE IF EXISTS `invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitations` (
  `invitation_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `template_id` bigint DEFAULT NULL,
  `organization_id` bigint DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_time` time DEFAULT NULL,
  `venue_name` varchar(255) DEFAULT NULL,
  `venue_address` varchar(1000) DEFAULT NULL,
  `google_map_url` varchar(1000) DEFAULT NULL,
  `host_name` varchar(255) DEFAULT NULL,
  `partner_name` varchar(255) DEFAULT NULL,
  `groom_name` varchar(255) DEFAULT NULL,
  `bride_name` varchar(255) DEFAULT NULL,
  `story_text` text,
  `language_mode` varchar(20) DEFAULT NULL,
  `design_json` text,
  `content_json` text,
  `custom_colors` text,
  `custom_fonts` text,
  `enabled_sections` text,
  `layout_settings` text,
  `visibility` varchar(30) DEFAULT NULL,
  `access_password` varchar(255) DEFAULT NULL,
  `access_token` varchar(80) DEFAULT NULL,
  `rsvp_deadline` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `moderation_status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `published_at` datetime(6) DEFAULT NULL,
  `client_request_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`invitation_id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `uk_invitations_access_token` (`access_token`),
  UNIQUE KEY `uk_invitations_owner_request` (`user_id`,`client_request_id`),
  KEY `idx_invitations_user_id` (`user_id`),
  KEY `idx_invitations_status` (`status`),
  KEY `idx_invitations_slug` (`slug`),
  KEY `idx_invitations_event_date` (`event_date`),
  KEY `idx_invitations_organization` (`organization_id`),
  KEY `idx_invitations_user_deleted_created` (`user_id`,`deleted`,`created_at`),
  KEY `idx_invitations_template_deleted` (`template_id`,`deleted`),
  KEY `idx_invitations_status_deleted` (`status`,`deleted`),
  KEY `idx_invitations_deleted_created` (`deleted`,`created_at`),
  CONSTRAINT `fk_invitations_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invitations_template` FOREIGN KEY (`template_id`) REFERENCES `templates` (`template_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invitations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitations`
--

LOCK TABLES `invitations` WRITE;
/*!40000 ALTER TABLE `invitations` DISABLE KEYS */;
INSERT INTO `invitations` VALUES (1,1,3,1,'Sokha & Pisey Wedding','demo-wedding','WEDDING','2035-02-17','18:00:00','Phnom Penh Demo Ballroom','Russian Federation Boulevard, Phnom Penh','https://maps.google.com/?q=Phnom+Penh','The Sok and Lim families','Pisey Lim','Sokha Sok','Pisey Lim','A fictional celebration of two families joining together.','BILINGUAL','{\"theme\":\"traditional-khmer\",\"heroStyle\":\"floral\"}','{\"welcome\":{\"km\":\"សូមគោរពអញ្ជើញ\",\"en\":\"You are warmly invited\"}}','{\"primary\":\"#7A294A\",\"accent\":\"#D6B36A\"}','{\"heading\":\"Noto Serif Khmer\",\"body\":\"Noto Sans Khmer\"}','{\"story\":true,\"gallery\":true,\"rsvp\":true,\"gifts\":true}','{\"hero\":\"full\",\"spacing\":\"comfortable\"}','PUBLIC',NULL,'demo-invitation-access-token','2035-02-10','PUBLISHED','ACTIVE','2026-09-15 13:35:46.211667','2026-09-15 13:35:46.211667',0,'2026-09-15 13:35:46.211667',NULL),(2,4,NULL,NULL,'ហាក់​ ម៉េង ​និង ​ស្រស់ ទេវី','wedding','WEDDING','2026-09-19','17:00:00','សាលមោស្រប','សាលមោស្រប',NULL,NULL,NULL,'ហាក់​ ម៉េង','ស្រស់ ទេវី',NULL,NULL,'{\"coverImage\":\"\",\"frontColor\":\"#f9af59\",\"bottomColor\":\"#B08E4F\",\"hideNamesOnCover\":false,\"templateId\":\"garden-royal-khmer-wedding\"}','{\"title\":\"ហាក់​ ម៉េង ​និង ​ស្រស់ ទេវី\",\"subtitle\":\"សូមគោរពអញ្ជើញ\",\"groomName\":\"ហាក់​ ម៉េង\",\"brideName\":\"ស្រស់ ទេវី\",\"eventDateText\":\"2026-09-19\",\"schedule\":[{\"dayTitle\":\"ថ្ងៃទី 1\",\"title\":\"កម្មវិធី\",\"time\":\"07:00\"}],\"agendaDays\":[{\"id\":\"1789608332783-uiid\",\"title\":\"\",\"items\":[{\"id\":\"1789608332783-1\",\"name\":\"\",\"time\":\"07:00\"}]}],\"venueName\":\"សាលមោស្រប\",\"storyText\":\"\"}',NULL,NULL,NULL,NULL,'PUBLIC',NULL,'9821ddb9e4394048a2b4b5274463b6ed113a094bf04e43d3911e7a1ad46a4c4f',NULL,'DRAFT','ACTIVE','2026-09-17 01:25:44.675584','2026-09-17 01:25:44.675584',0,NULL,NULL),(11,9,6,NULL,'QA Reports 50 | Dara Sok 001','qa-admin-reports-50-001','WEDDING','2026-09-22','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 001',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'fc5f46763fdbddee4f975886785e3ae4acc2d6d37552ea40aacb8b7a26c26865',NULL,'PUBLISHED','ACTIVE','2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000',0,'2026-10-15 15:10:00.000000',NULL),(12,10,6,NULL,'QA Reports 50 | Sophea Lim 002','qa-admin-reports-50-002','ENGAGEMENT','2026-09-23','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 002',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'eeaa57de70281158f2c27c5fa2643bed4bfc94fb85ed166449b5579acd0a9314',NULL,'DRAFT','ACTIVE','2026-10-14 15:00:00.000000','2026-10-14 15:00:00.000000',0,NULL,NULL),(13,11,7,NULL,'QA Reports 50 | Chan Vann 003','qa-admin-reports-50-003','BIRTHDAY','2026-09-24','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 003',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'7a94598b790d88aa93ab68f3b9c9a932843927c45b2a162079833c8b8eedf8fa',NULL,'UNPUBLISHED','HIDDEN','2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000',0,NULL,NULL),(14,12,7,NULL,'QA Reports 50 | Pisey Heng 004','qa-admin-reports-50-004','ANNIVERSARY','2026-09-25','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 004',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'4458bea39821b8fa59de52bad5ad914060ae461cc8ec06a0921f4cbb9891086c',NULL,'ARCHIVED','REPORTED','2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000',0,NULL,NULL),(15,13,8,NULL,'QA Reports 50 | Sokha Chea 005','qa-admin-reports-50-005','CORPORATE','2026-09-26','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 005',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'e4971f65eeca8273c812f2b2fcc7d7f72832713993fbf76b34e999e4b6aff0be',NULL,'PUBLISHED','SUSPENDED','2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000',0,'2026-10-11 15:10:00.000000',NULL),(16,14,8,NULL,'QA Reports 50 | Dara Sok 006','qa-admin-reports-50-006','OTHER','2026-09-27','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 006',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'2bc3cc1f2460784ffc00224fe28c7f3fd9bc6a946c8398e0669f325a32e29973',NULL,'PUBLISHED','ACTIVE','2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000',0,'2026-10-10 15:10:00.000000',NULL),(17,15,9,NULL,'QA Reports 50 | Sophea Lim 007','qa-admin-reports-50-007','WEDDING','2026-09-28','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 007',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'6802e93920daa891448eedbb1ffb51deaf2741f95a30e19f1181f9acb3879a82',NULL,'DRAFT','ACTIVE','2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000',0,NULL,NULL),(18,16,9,NULL,'QA Reports 50 | Chan Vann 008','qa-admin-reports-50-008','ENGAGEMENT','2026-09-29','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 008',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'d55659ef2281ffe2e974813a5d4735ad2cb417bc1e4db02e7b8d3d7f93ffb3d2',NULL,'UNPUBLISHED','ACTIVE','2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000',0,NULL,NULL),(19,17,10,NULL,'QA Reports 50 | Pisey Heng 009','qa-admin-reports-50-009','BIRTHDAY','2026-09-30','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 009',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'76c3fcb4e71096b649d34758faf256f95b97662a128eba81b24828c933f9ad57',NULL,'ARCHIVED','HIDDEN','2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000',0,NULL,NULL),(20,18,10,NULL,'QA Reports 50 | Sokha Chea 010','qa-admin-reports-50-010','ANNIVERSARY','2026-10-01','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 010',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'6245c0e9c6adb9d4fde47257979d41053f78368e58c183aedc070ada25c32823',NULL,'PUBLISHED','REPORTED','2026-09-07 15:00:00.000000','2026-09-07 15:00:00.000000',0,'2026-09-07 15:10:00.000000',NULL),(21,19,11,NULL,'QA Reports 50 | Dara Sok 011','qa-admin-reports-50-011','CORPORATE','2026-10-02','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 011',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'12ac6b697452c47d2335564bc845bf5bf3b770bbc62413e92b8b84129615ee0a',NULL,'PUBLISHED','SUSPENDED','2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000',0,'2026-10-05 15:10:00.000000',NULL),(22,20,11,NULL,'QA Reports 50 | Sophea Lim 012','qa-admin-reports-50-012','OTHER','2026-10-03','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 012',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'597991e8ff617c89c884b7fbf5dd5f2a35b993aea2c8f55671f7720e01ad843e',NULL,'DRAFT','ACTIVE','2026-10-04 15:00:00.000000','2026-10-04 15:00:00.000000',0,NULL,NULL),(23,21,6,NULL,'QA Reports 50 | Chan Vann 013','qa-admin-reports-50-013','WEDDING','2026-10-04','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 013',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'61d148906dc44507e464e475e19addc38c54bcbb309941d1974df744aa3094f8',NULL,'UNPUBLISHED','ACTIVE','2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000',0,NULL,NULL),(24,22,6,NULL,'QA Reports 50 | Pisey Heng 014','qa-admin-reports-50-014','ENGAGEMENT','2026-10-05','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 014',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'fccccd1451f63d1fd563f3bf2de42fc94bf58817f05ae2a4a1b2c44977cc529f',NULL,'ARCHIVED','ACTIVE','2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000',0,NULL,NULL),(25,23,7,NULL,'QA Reports 50 | Sokha Chea 015','qa-admin-reports-50-015','BIRTHDAY','2026-10-06','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 015',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'c7a50fc250b3ee209dcfe5df197de8383b5048470f50c59c48a4b73beb7b4689',NULL,'PUBLISHED','HIDDEN','2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000',0,'2026-10-01 15:10:00.000000',NULL),(26,24,7,NULL,'QA Reports 50 | Dara Sok 016','qa-admin-reports-50-016','ANNIVERSARY','2026-10-07','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 016',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'3269cd3fc786309beeef1ad4ebc1837d5ba5be04ba1ff5db50fa9cf0333c4d6b',NULL,'PUBLISHED','REPORTED','2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000',0,'2026-09-30 15:10:00.000000',NULL),(27,25,8,NULL,'QA Reports 50 | Sophea Lim 017','qa-admin-reports-50-017','CORPORATE','2026-10-08','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 017',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'37d6fdf20f6324d549790281b0827e273079f41a5ef203dbda27cd42671f98c8',NULL,'DRAFT','SUSPENDED','2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000',0,NULL,NULL),(28,26,8,NULL,'QA Reports 50 | Chan Vann 018','qa-admin-reports-50-018','OTHER','2026-10-09','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 018',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'9f923dc2f61353d0e9aab713629924298035fbf3f63f2197c84b2c4c36cd41f4',NULL,'UNPUBLISHED','ACTIVE','2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000',0,NULL,NULL),(29,27,9,NULL,'QA Reports 50 | Pisey Heng 019','qa-admin-reports-50-019','WEDDING','2026-10-10','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 019',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'275e40000c0cc0a90f98ff4a6913db3ac22a5a90af4a0a6dcf4bc823963ebeeb',NULL,'ARCHIVED','ACTIVE','2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000',0,NULL,NULL),(30,28,9,NULL,'QA Reports 50 | Sokha Chea 020','qa-admin-reports-50-020','ENGAGEMENT','2026-10-11','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 020',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'97a6c330159b57b0a9a6831d37533fd742938e93f0f18d6ed53d41ea4757c5db',NULL,'PUBLISHED','ACTIVE','2026-09-04 15:00:00.000000','2026-09-04 15:00:00.000000',0,'2026-09-04 15:10:00.000000',NULL),(31,29,10,NULL,'QA Reports 50 | Dara Sok 021','qa-admin-reports-50-021','BIRTHDAY','2026-10-12','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 021',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'7e6dcd080e37f5a204a0f3bebd6f36d40914546292e067a0fa0001f6915c78ed',NULL,'PUBLISHED','HIDDEN','2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000',0,'2026-09-25 15:10:00.000000',NULL),(32,30,10,NULL,'QA Reports 50 | Sophea Lim 022','qa-admin-reports-50-022','ANNIVERSARY','2026-10-13','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 022',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'b608313ce2f7d278e011efdb6ebef883cf1d049b6313645d04b6d8e87abfbacd',NULL,'DRAFT','REPORTED','2026-09-24 15:00:00.000000','2026-09-24 15:00:00.000000',0,NULL,NULL),(33,31,11,NULL,'QA Reports 50 | Chan Vann 023','qa-admin-reports-50-023','CORPORATE','2026-10-14','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 023',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'26bfadaca1d9c8becccca42bb279474b8b49f274c5dff21d2444731eb086c448',NULL,'UNPUBLISHED','SUSPENDED','2026-09-23 15:00:00.000000','2026-09-23 15:00:00.000000',0,NULL,NULL),(34,32,11,NULL,'QA Reports 50 | Pisey Heng 024','qa-admin-reports-50-024','OTHER','2026-10-15','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 024',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'5a6c0a647cb2492d41d0071aa47990d791567a21e51754b7eeba15842d33be95',NULL,'ARCHIVED','ACTIVE','2026-09-22 15:00:00.000000','2026-09-22 15:00:00.000000',0,NULL,NULL),(35,33,6,NULL,'QA Reports 50 | Sokha Chea 025','qa-admin-reports-50-025','WEDDING','2026-10-16','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 025',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'866305c3779f776ba04c0da3ac01b6b6798e36a77344610cb3766b6fa47d0fac',NULL,'PUBLISHED','ACTIVE','2026-09-21 15:00:00.000000','2026-09-21 15:00:00.000000',0,'2026-09-21 15:10:00.000000',NULL),(36,34,6,NULL,'QA Reports 50 | Dara Sok 026','qa-admin-reports-50-026','ENGAGEMENT','2026-10-17','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 026',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'4bdedef7bb5baadf1809ec6ebc906a02352066fd8fa4d3cf9932a55a0557ea3b',NULL,'PUBLISHED','ACTIVE','2026-09-20 15:00:00.000000','2026-09-20 15:00:00.000000',0,'2026-09-20 15:10:00.000000',NULL),(37,35,7,NULL,'QA Reports 50 | Sophea Lim 027','qa-admin-reports-50-027','BIRTHDAY','2026-10-18','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 027',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'0aa7dbd3840d47684cc06add4995ef95c87eb11a3ce91b7b1a3da685d970c952',NULL,'DRAFT','HIDDEN','2026-09-19 15:00:00.000000','2026-09-19 15:00:00.000000',0,NULL,NULL),(38,36,7,NULL,'QA Reports 50 | Chan Vann 028','qa-admin-reports-50-028','ANNIVERSARY','2026-10-19','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 028',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'e22a7866e45112f9362a4d2649cf661569cb00bbf6bb23ccf1b4cb6c3bed0850',NULL,'UNPUBLISHED','REPORTED','2026-09-18 15:00:00.000000','2026-09-18 15:00:00.000000',0,NULL,NULL),(39,37,8,NULL,'QA Reports 50 | Pisey Heng 029','qa-admin-reports-50-029','CORPORATE','2026-10-20','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 029',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'7f665f3c93e0b7ad96ae5709c6293241d19239e4c8633563c63c638191e7caa3',NULL,'ARCHIVED','SUSPENDED','2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000',0,NULL,NULL),(40,38,8,NULL,'QA Reports 50 | Sokha Chea 030','qa-admin-reports-50-030','OTHER','2026-10-21','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 030',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'448210b318638339cad16a611cf08b7d79f495761915dcaae02ec001ce11cc09',NULL,'PUBLISHED','ACTIVE','2026-09-08 15:00:00.000000','2026-09-08 15:00:00.000000',0,'2026-09-08 15:10:00.000000',NULL),(41,39,9,NULL,'QA Reports 50 | Dara Sok 031','qa-admin-reports-50-031','WEDDING','2026-10-22','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 031',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'69da60fba10526f7057688875f73c16806337e854e0ede9e3d2ab63c62ae5342',NULL,'PUBLISHED','ACTIVE','2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000',0,'2026-10-13 15:10:00.000000',NULL),(42,40,9,NULL,'QA Reports 50 | Sophea Lim 032','qa-admin-reports-50-032','ENGAGEMENT','2026-10-23','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 032',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'48d60eb3920e17bc4e07c449e25a51d0907afbeb1803181580eef9d5c38fd880',NULL,'DRAFT','ACTIVE','2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000',0,NULL,NULL),(43,41,10,NULL,'QA Reports 50 | Chan Vann 033','qa-admin-reports-50-033','BIRTHDAY','2026-10-24','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 033',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'b182add03edbb6b54a1ec3f1558495bada80711c89c670340e5e7d63a6b83667',NULL,'UNPUBLISHED','HIDDEN','2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000',0,NULL,NULL),(44,42,10,NULL,'QA Reports 50 | Pisey Heng 034','qa-admin-reports-50-034','ANNIVERSARY','2026-10-25','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 034',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'ff7077d9dce8f08fa8c22c82ca43b331e2878c5522e90214fabd3b14d5acf31f',NULL,'ARCHIVED','REPORTED','2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000',0,NULL,NULL),(45,43,11,NULL,'QA Reports 50 | Sokha Chea 035','qa-admin-reports-50-035','CORPORATE','2026-10-26','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 035',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'93f81408a7586f9b9bc99316cbcfa4cf105fefe0e6d029986deabbfb7e91afa8',NULL,'PUBLISHED','SUSPENDED','2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000',0,'2026-10-09 15:10:00.000000',NULL),(46,44,11,NULL,'QA Reports 50 | Dara Sok 036','qa-admin-reports-50-036','OTHER','2026-10-27','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 036',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'4c23db0263fbdca534caaba16a058fcd88a63af3b048d689124434940e15545c',NULL,'PUBLISHED','ACTIVE','2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000',0,'2026-10-08 15:10:00.000000',NULL),(47,45,6,NULL,'QA Reports 50 | Sophea Lim 037','qa-admin-reports-50-037','WEDDING','2026-10-28','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 037',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'faf09f35640682aadd89cf4c3ab9503f7d03df18ac67e3c38f4ccee39cfd4d82',NULL,'DRAFT','ACTIVE','2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000',0,NULL,NULL),(48,46,6,NULL,'QA Reports 50 | Chan Vann 038','qa-admin-reports-50-038','ENGAGEMENT','2026-10-29','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 038',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'46d0f42ce65120bb97ff1745cd441134d17818ec48c65dd09b86cabec20ff5f6',NULL,'UNPUBLISHED','ACTIVE','2026-10-06 15:00:00.000000','2026-10-06 15:00:00.000000',0,NULL,NULL),(49,47,7,NULL,'QA Reports 50 | Pisey Heng 039','qa-admin-reports-50-039','BIRTHDAY','2026-10-30','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 039',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'448900ea421074e4f065d623ae7a9f8da5e50cd11f3c622307c71050e2aeff7a',NULL,'ARCHIVED','HIDDEN','2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000',0,NULL,NULL),(50,48,7,NULL,'QA Reports 50 | Sokha Chea 040','qa-admin-reports-50-040','ANNIVERSARY','2026-10-31','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 040',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'69f4c40e675cea66bbbefb074e1622a5f8a13947b1e9c8a0fbfa8983f222b4c4',NULL,'PUBLISHED','REPORTED','2026-09-05 15:00:00.000000','2026-09-05 15:00:00.000000',0,'2026-09-05 15:10:00.000000',NULL),(51,49,8,NULL,'QA Reports 50 | Dara Sok 041','qa-admin-reports-50-041','CORPORATE','2026-11-01','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 041',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'bf1550cd97e81ae02b90f9d2d70fdbf3f4f0e631c21c36075e13577139a4365e',NULL,'PUBLISHED','SUSPENDED','2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000',0,'2026-10-03 15:10:00.000000',NULL),(52,50,8,NULL,'QA Reports 50 | Sophea Lim 042','qa-admin-reports-50-042','OTHER','2026-11-02','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 042',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'22ed425ba3e157cf86619aa885a24786861355dd41a710a57e63d49dad42d3a8',NULL,'DRAFT','ACTIVE','2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000',0,NULL,NULL),(53,51,9,NULL,'QA Reports 50 | Chan Vann 043','qa-admin-reports-50-043','WEDDING','2026-11-03','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 043',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'40d873777648cc47883ceaad438661e2c43214a2ae7ac240c37379c3804efef4',NULL,'UNPUBLISHED','ACTIVE','2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000',0,NULL,NULL),(54,52,9,NULL,'QA Reports 50 | Pisey Heng 044','qa-admin-reports-50-044','ENGAGEMENT','2026-11-04','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 044',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'98a67be81dcc883d36e489771d33e7233c3836ba493e884a854b282e19778624',NULL,'ARCHIVED','ACTIVE','2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000',0,NULL,NULL),(55,53,10,NULL,'QA Reports 50 | Sokha Chea 045','qa-admin-reports-50-045','BIRTHDAY','2026-11-05','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 045',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'7e4630928c459b69f8c5227ff2cb25dc7aa411fd4b2c0a7a23fee323abe719a1',NULL,'PUBLISHED','HIDDEN','2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000',0,'2026-09-29 15:10:00.000000',NULL),(56,54,10,NULL,'QA Reports 50 | Dara Sok 046','qa-admin-reports-50-046','ANNIVERSARY','2026-11-06','18:00:00','Siem Reap QA Venue',NULL,NULL,'QA Reports 50 | Dara Sok 046',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'ff4f025607843f0b0501b6bdcb27d8d5e29848eb2de27eada72b3fceb0d77b3f',NULL,'PUBLISHED','REPORTED','2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000',0,'2026-09-28 15:10:00.000000',NULL),(57,55,11,NULL,'QA Reports 50 | Sophea Lim 047','qa-admin-reports-50-047','CORPORATE','2026-11-07','18:00:00','Battambang QA Venue',NULL,NULL,'QA Reports 50 | Sophea Lim 047',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'a651d271567164974944202ccd0e92ba2cf4d338242933ad9dde962e90b7ca29',NULL,'DRAFT','SUSPENDED','2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000',0,NULL,NULL),(58,56,11,NULL,'QA Reports 50 | Chan Vann 048','qa-admin-reports-50-048','OTHER','2026-11-08','18:00:00','Kampot QA Venue',NULL,NULL,'QA Reports 50 | Chan Vann 048',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'69a74d65e409ec3c0771f5d4ea6363f70ffd757d0656d27885677e1c59571f36',NULL,'UNPUBLISHED','ACTIVE','2026-09-26 15:00:00.000000','2026-09-26 15:00:00.000000',0,NULL,NULL),(59,57,6,NULL,'QA Reports 50 | Pisey Heng 049','qa-admin-reports-50-049','WEDDING','2026-11-09','18:00:00','Sihanoukville QA Venue',NULL,NULL,'QA Reports 50 | Pisey Heng 049',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'00c3c3d996a0bae831f9bf748fffc86aa9690f48f6e650f2214f669a7d91472c',NULL,'ARCHIVED','ACTIVE','2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000',0,NULL,NULL),(60,58,6,NULL,'QA Reports 50 | Sokha Chea 050','qa-admin-reports-50-050','ENGAGEMENT','2026-11-10','18:00:00','Phnom Penh QA Venue',NULL,NULL,'QA Reports 50 | Sokha Chea 050',NULL,NULL,NULL,NULL,'BILINGUAL',NULL,NULL,NULL,NULL,NULL,NULL,'PRIVATE',NULL,'a640ac71520860bea384d2f9d1e0c54d1f97eae5584eee403b136b5895197e4b',NULL,'PUBLISHED','ACTIVE','2026-09-09 15:00:00.000000','2026-09-09 15:00:00.000000',0,'2026-09-09 15:10:00.000000',NULL),(61,6,4,NULL,'សិរីមង្គលអាពាហ៍ពិពាហ៍','wedding-1','WEDDING','2026-12-31','00:00:00','បាត់ដំបងស៊ីធីហល','https://www.google.com/maps?q=13.106376,103.210661','https://www.google.com/maps?q=13.106376,103.210661','គីមឡុង','យ៉ុងស៊ី','គីមឡុង','យ៉ុងស៊ី','ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។','BILINGUAL','{\"studioStyle\":{\"portraitY\":53},\"backgroundColor\":\"#F7F0E4\",\"templateId\":\"khmer-celestial\",\"presetId\":\"KHMER_CELESTIAL\",\"theme\":\"KHMER_CELESTIAL\",\"fontFamily\":\"\",\"layoutStyles\":{},\"openingStyle\":\"celestial-cover\",\"frontColor\":\"#541722\",\"bottomColor\":\"#B88A3A\",\"coverImage\":\"/images/wedding/couple-hero-meadow.webp\",\"coverBackgroundImage\":null,\"invitationImage\":null,\"invitationImage2\":null,\"backgroundImage\":\"/invitations/khmer-celestial/botanical-frame.jpg\",\"sketchMapImage\":\"http://localhost:8080/uploads/invitations/61/gallery_image/364fb7bb-f6c6-453d-b16b-ee331f62454f.jpg\",\"photos\":[{\"id\":\"p1\",\"url\":\"/images/wedding/couple-hero-meadow.webp\"},{\"id\":\"p2\",\"url\":\"/facebook/all/06-card/06-01.jpg\"},{\"id\":\"p3\",\"url\":\"/facebook/all/06-card/06-02.jpg\"},{\"id\":\"p4\",\"url\":\"/facebook/all/06-card/06-03.jpg\"},{\"id\":\"p5\",\"url\":\"\"}],\"groomFather\":\"លោក ឃុន ស៊ីវខេង\",\"groomMother\":\"លោកស្រី គុយ ដាលី\",\"brideFather\":\"លោក ឡាំ គីមឡុង\",\"brideMother\":\"លោកស្រី ឡេង​ យ៉ុងស៊ី\",\"showCountdown\":true,\"showStory\":true,\"storyChapters\":[{\"id\":\"story-1\",\"kicker\":\"រឿងរ៉ាវស្នេហា\",\"title\":\"ដំណើររបស់យើង\",\"date\":\"ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦\",\"text\":\"ពីការជួបគ្នាដំបូង រហូតដល់ពេលដែលយើងសម្រេចចិត្តរួមដំណើរជីវិត សេចក្តីស្រឡាញ់របស់យើងបានរីកចម្រើនតាមរយៈការគោរព ការយល់ចិត្ត និងភាពកក់ក្តៅពីក្រុមគ្រួសារ។\",\"image\":\"/facebook/all/06-card/cover-card.jpg\"}],\"showDressCode\":true,\"dressCode\":{\"name\":\"ខ្មែរប្រណិត / Formal Khmer\",\"style\":\"Botanical ceremonial elegance\",\"description\":\"សូមជ្រើសរើសពណ៌បៃតងចាស់ បៃតងស្រាល សាំប៉ាញ ភ្លុក ឬមាសស្រាល ដើម្បីសមនឹងបរិយាកាសពិធី។\",\"colors\":[{\"hex\":\"#214F3B\",\"name\":\"បៃតងចាស់\"},{\"hex\":\"#8EA787\",\"name\":\"បៃតងស្លឹក\"},{\"hex\":\"#B88A3A\",\"name\":\"មាស\"},{\"hex\":\"#FFFAF2\",\"name\":\"ភ្លុក\"}]},\"dressColors\":[{\"hex\":\"#214F3B\",\"name\":\"បៃតងចាស់\"},{\"hex\":\"#8EA787\",\"name\":\"បៃតងស្លឹក\"},{\"hex\":\"#B88A3A\",\"name\":\"មាស\"},{\"hex\":\"#FFFAF2\",\"name\":\"ភ្លុក\"}],\"showParty\":false,\"party\":[],\"showFaq\":false,\"faq\":[],\"khqrDollar\":{\"qrUrl\":null,\"bankName\":\"KHQR Dollar ($)\",\"accountNumber\":\"\"},\"khqrRiel\":{\"qrUrl\":null,\"bankName\":\"KHQR Riel (៛)\",\"accountNumber\":\"\"},\"musicTrackId\":\"\",\"musicUrl\":\"\",\"showBrandMark\":true,\"brandMarkUrl\":\"\"}','{\"studioStyle\":{\"portraitY\":53},\"backgroundColor\":\"#F7F0E4\",\"templateId\":\"khmer-celestial\",\"presetId\":\"KHMER_CELESTIAL\",\"theme\":\"KHMER_CELESTIAL\",\"fontFamily\":\"\",\"layoutStyles\":{},\"title\":\"សិរីមង្គលអាពាហ៍ពិពាហ៍\",\"subtitle\":\"សូមគោរពអញ្ជើញ\",\"coverImage\":\"/images/wedding/couple-hero-meadow.webp\",\"coverBackgroundImage\":null,\"backgroundImage\":\"/invitations/khmer-celestial/botanical-frame.jpg\",\"invitationImage\":null,\"invitationImage2\":null,\"hideCoupleNameOnCover\":false,\"showBrandMark\":true,\"brandMarkUrl\":\"\",\"eventDateText\":\"ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦\",\"guestName\":\"\",\"groomName\":\"គីមឡុង\",\"brideName\":\"យ៉ុងស៊ី\",\"groomFather\":\"លោក ឃុន ស៊ីវខេង\",\"groomMother\":\"លោកស្រី គុយ ដាលី\",\"brideFather\":\"លោក ឡាំ គីមឡុង\",\"brideMother\":\"លោកស្រី ឡេង​ យ៉ុងស៊ី\",\"venueName\":\"បាត់ដំបងស៊ីធីហល\",\"venueAddress\":\"https://www.google.com/maps?q=13.106376,103.210661\",\"messageTitle\":\"\",\"messageText\":\"ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។\",\"schedule\":[{\"id\":\"krong-peali\",\"time\":\"៥:០០ ព្រឹក\",\"title\":\"ពិធីក្រុងពាលី\"},{\"id\":\"guest-gathering\",\"time\":\"៦:៣០ ព្រឹក\",\"title\":\"ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែជំនូន\"},{\"id\":\"procession\",\"time\":\"៧:០០ ព្រឹក\",\"title\":\"ហែជំនូនចូលរោងជ័យ និងនិយាយជើងការ និងរៀបរាប់ផ្លែឈើ ៣៦ មុខ\"},{\"id\":\"rings\",\"time\":\"៨:០០ ព្រឹក\",\"title\":\"ពិធីបំពាក់ចិញ្ចៀន\"},{\"id\":\"blessing\",\"time\":\"៩:០០ ព្រឹក\",\"title\":\"ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត\"},{\"id\":\"hair\",\"time\":\"៩:៣០ - ១០:៣០ ព្រឹក\",\"title\":\"ពិធីកាត់សក់បង្កក់សិរី ចម្រើនកេសា\"},{\"id\":\"sompeas-ptem\",\"time\":\"១១:០០ ព្រឹក\",\"title\":\"ពិធីសំពះផ្ទឹម បង្វិលពពិល … និងចងដៃ\"},{\"id\":\"lunch\",\"time\":\"១១:៣០ ថ្ងៃត្រង់\",\"title\":\"អញ្ជើញភ្ញៀវពិសាអាហារថ្ងៃត្រង់\"},{\"id\":\"dinner\",\"time\":\"៥:០០ ល្ងាច\",\"title\":\"អញ្ជើញភ្ញៀវពិសាភោជនាហារពេលល្ងាច\"}],\"showCountdown\":true,\"showStory\":true,\"storyChapters\":[{\"id\":\"story-1\",\"kicker\":\"រឿងរ៉ាវស្នេហា\",\"title\":\"ដំណើររបស់យើង\",\"date\":\"ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦\",\"text\":\"ពីការជួបគ្នាដំបូង រហូតដល់ពេលដែលយើងសម្រេចចិត្តរួមដំណើរជីវិត សេចក្តីស្រឡាញ់របស់យើងបានរីកចម្រើនតាមរយៈការគោរព ការយល់ចិត្ត និងភាពកក់ក្តៅពីក្រុមគ្រួសារ។\",\"image\":\"/facebook/all/06-card/cover-card.jpg\"}],\"showDressCode\":true,\"dressCode\":{\"name\":\"ខ្មែរប្រណិត / Formal Khmer\",\"style\":\"Botanical ceremonial elegance\",\"description\":\"សូមជ្រើសរើសពណ៌បៃតងចាស់ បៃតងស្រាល សាំប៉ាញ ភ្លុក ឬមាសស្រាល ដើម្បីសមនឹងបរិយាកាសពិធី។\",\"colors\":[{\"hex\":\"#214F3B\",\"name\":\"បៃតងចាស់\"},{\"hex\":\"#8EA787\",\"name\":\"បៃតងស្លឹក\"},{\"hex\":\"#B88A3A\",\"name\":\"មាស\"},{\"hex\":\"#FFFAF2\",\"name\":\"ភ្លុក\"}]},\"dressColors\":[{\"hex\":\"#214F3B\",\"name\":\"បៃតងចាស់\"},{\"hex\":\"#8EA787\",\"name\":\"បៃតងស្លឹក\"},{\"hex\":\"#B88A3A\",\"name\":\"មាស\"},{\"hex\":\"#FFFAF2\",\"name\":\"ភ្លុក\"}],\"showParty\":false,\"party\":[],\"showFaq\":false,\"faq\":[],\"gallery\":[{\"id\":\"p1\",\"preview\":\"/images/wedding/couple-hero-meadow.webp\",\"type\":\"image\"},{\"id\":\"p2\",\"preview\":\"/facebook/all/06-card/06-01.jpg\",\"type\":\"image\"},{\"id\":\"p3\",\"preview\":\"/facebook/all/06-card/06-02.jpg\",\"type\":\"image\"},{\"id\":\"p4\",\"preview\":\"/facebook/all/06-card/06-03.jpg\",\"type\":\"image\"}],\"khqrDollar\":{\"qrUrl\":null,\"bankName\":\"KHQR Dollar ($)\",\"accountNumber\":\"\"},\"khqrRiel\":{\"qrUrl\":null,\"bankName\":\"KHQR Riel (៛)\",\"accountNumber\":\"\"},\"thankYouTitle\":\"\",\"thankYouText\":\"\",\"apologyTitle\":\"\",\"apologyText\":\"\"}','{\"front\":\"#541722\",\"bottom\":\"#B88A3A\"}',NULL,'{\"countdown\":true,\"story\":true,\"party\":false,\"dressCode\":true,\"faq\":false,\"schedule\":true,\"map\":true,\"gallery\":true,\"gift\":false,\"rsvp\":true,\"music\":false}',NULL,'PUBLIC',NULL,'ce9349282f984c6bbe7401763c1478928f966b21e2ce43309626566f1516d1dd',NULL,'PUBLISHED','ACTIVE','2026-10-20 10:21:09.861132','2026-10-22 12:07:30.193215',0,'2026-10-22 12:07:29.945723','04d3207e-2b46-43f3-8160-5cb9bee77b36');
/*!40000 ALTER TABLE `invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_files`
--

DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `media_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `media_type` varchar(50) DEFAULT NULL,
  `file_url` varchar(1000) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `is_cover` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `storage_provider` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`media_id`),
  KEY `idx_media_invitation_id` (`invitation_id`),
  KEY `idx_media_type` (`media_type`),
  KEY `idx_media_cover` (`is_cover`),
  CONSTRAINT `fk_media_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_files`
--

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
INSERT INTO `media_files` VALUES (1,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/08d85b4a-7fe5-49fa-a69e-9e298652b129.jpg','invitations/61/gallery_image/08d85b4a-7fe5-49fa-a69e-9e298652b129.jpg',0,0,'2026-10-20 14:57:46.276179',371391,'image/jpeg','IMG_9848.JPG','local','2026-10-20 14:57:46.276179'),(2,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/e97fb148-9e32-4672-9e11-bf3ffb47077c.jpg','invitations/61/gallery_image/e97fb148-9e32-4672-9e11-bf3ffb47077c.jpg',1,0,'2026-10-22 05:17:29.519626',371391,'image/jpeg','IMG_9848.JPG','local','2026-10-22 05:17:29.519626'),(3,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/ee7f93bf-54ca-4fe3-ae3b-5d105370b3b4.jpg','invitations/61/gallery_image/ee7f93bf-54ca-4fe3-ae3b-5d105370b3b4.jpg',2,0,'2026-10-22 05:17:37.935295',371391,'image/jpeg','IMG_9848.JPG','local','2026-10-22 05:17:37.935295'),(4,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/7edca08a-29ea-484d-806b-796845f40c3c.jpg','invitations/61/gallery_image/7edca08a-29ea-484d-806b-796845f40c3c.jpg',3,0,'2026-10-22 11:41:30.312530',371391,'image/jpeg','IMG_9848.JPG','local','2026-10-22 11:41:30.312530'),(5,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/6e6fe77d-7ec9-425c-b903-e81c74fef25f.jpg','invitations/61/gallery_image/6e6fe77d-7ec9-425c-b903-e81c74fef25f.jpg',4,0,'2026-10-22 11:41:32.907408',371391,'image/jpeg','IMG_9848.JPG','local','2026-10-22 11:41:32.907408'),(6,61,'GALLERY_IMAGE','http://localhost:8080/uploads/invitations/61/gallery_image/364fb7bb-f6c6-453d-b16b-ee331f62454f.jpg','invitations/61/gallery_image/364fb7bb-f6c6-453d-b16b-ee331f62454f.jpg',5,0,'2026-10-22 11:59:11.747090',213340,'image/jpeg','studio-image.jpg','local','2026-10-22 11:59:11.747090');
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `invitation_id` bigint DEFAULT NULL,
  `guest_id` bigint DEFAULT NULL,
  `rsvp_id` bigint DEFAULT NULL,
  `payment_order_id` bigint DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'SYSTEM_ALERT',
  `channel` varchar(50) NOT NULL DEFAULT 'SYSTEM',
  `subject` varchar(255) DEFAULT NULL,
  `message_body` text,
  `scheduled_at` datetime(6) DEFAULT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `title` varchar(255) NOT NULL,
  `message` text,
  `recipient_name` varchar(255) DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `recipient_phone` varchar(50) DEFAULT NULL,
  `recipient_telegram_id` varchar(100) DEFAULT NULL,
  `provider_message_id` varchar(255) DEFAULT NULL,
  `error_message` text,
  `payment_delivery_key` varchar(100) DEFAULT NULL,
  `delivery_attempts` int NOT NULL DEFAULT '0',
  `next_delivery_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  UNIQUE KEY `payment_delivery_key` (`payment_delivery_key`),
  KEY `fk_notifications_rsvp` (`rsvp_id`),
  KEY `idx_notifications_user_created` (`user_id`,`created_at`),
  KEY `idx_notifications_user_status` (`user_id`,`status`),
  KEY `idx_notifications_user_unread` (`user_id`,`read_at`),
  KEY `idx_notifications_invitation_created` (`invitation_id`,`created_at`),
  KEY `idx_notifications_invitation_status` (`invitation_id`,`status`),
  KEY `idx_notifications_guest_type_created` (`guest_id`,`type`,`created_at`),
  KEY `idx_notifications_payment_order` (`payment_order_id`),
  KEY `idx_notifications_status` (`status`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_created_at` (`created_at`),
  KEY `idx_notifications_payment_delivery` (`status`,`next_delivery_at`),
  CONSTRAINT `fk_notifications_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_payment_order` FOREIGN KEY (`payment_order_id`) REFERENCES `template_payment_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_rsvp` FOREIGN KEY (`rsvp_id`) REFERENCES `rsvps` (`rsvp_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,1,NULL,NULL,NULL,'ADMIN_NOTICE','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-15 13:35:46.261050','2026-09-15 13:35:46.261050','PENDING','Welcome to the Koupreng development API','Use Scalar at /docs to explore the fictional development dataset.','Koupreng Demo User','demo@koupreng.local',NULL,NULL,NULL,NULL,NULL,0,NULL),(2,4,2,4,3,NULL,'RSVP_CONFIRMATION','SYSTEM',NULL,NULL,NULL,'2026-09-17 02:09:13.155251',NULL,NULL,'2026-09-17 02:09:13.155251','2026-09-17 02:09:13.155251','SENT','RSVP confirmation','RSVP response recorded for Nha','Nha',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(3,4,2,4,3,NULL,'RSVP_RECEIVED','SYSTEM',NULL,NULL,NULL,'2026-09-17 02:09:13.171438',NULL,NULL,'2026-09-17 02:09:13.171438','2026-09-17 02:09:13.171438','SENT','New RSVP received','Nha responded ATTENDING','Nha',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(4,NULL,NULL,NULL,NULL,NULL,'SYSTEM_ALERT','TELEGRAM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-13 09:01:15.662603','2026-10-13 09:03:27.067818','FAILED','NEW SUBSCRIPTION PAYMENT','Order: SUB2610138332\nUser: 6\nPackage: BASIC\nExpected: USD 0.01\nPayer: KOEURNG VIREAK\nABA Account: ***247\nMethod: ABA PayWay Static Link\nOrder Status: PENDING_PAYMENT\nPayment Status: PENDING\nCreated: 2026-10-13T09:01:15.622502600Z\nExpires: 2026-10-13T09:31:15.609638600Z\nAwaiting genuine ABA merchant payment notification.',NULL,NULL,NULL,'-1004254354469',NULL,'Telegram delivery unavailable; operator retry required after three attempts','subscription-pending:SUB2610138332',3,'2026-10-13 09:04:27.047819'),(5,9,11,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-15 15:05:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000','SENT','QA Reports 50 | Scenario 001','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(6,10,12,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-14 15:05:00.000000',NULL,NULL,'2026-10-14 15:00:00.000000','2026-10-14 15:00:00.000000','SENT','QA Reports 50 | Scenario 002','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(7,11,13,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-13 15:05:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000','SENT','QA Reports 50 | Scenario 003','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(8,12,14,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000','FAILED','QA Reports 50 | Scenario 004','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(9,13,15,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-11 15:05:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000','SENT','QA Reports 50 | Scenario 005','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(10,14,16,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-10 15:05:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000','SENT','QA Reports 50 | Scenario 006','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(11,15,17,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-09 15:05:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000','SENT','QA Reports 50 | Scenario 007','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(12,16,18,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000','FAILED','QA Reports 50 | Scenario 008','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(13,17,19,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-07 15:05:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000','SENT','QA Reports 50 | Scenario 009','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(14,18,20,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-07 15:05:00.000000',NULL,NULL,'2026-09-07 15:00:00.000000','2026-09-07 15:00:00.000000','SENT','QA Reports 50 | Scenario 010','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(15,19,21,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-05 15:05:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000','SENT','QA Reports 50 | Scenario 011','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(16,20,22,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 15:00:00.000000','2026-10-04 15:00:00.000000','FAILED','QA Reports 50 | Scenario 012','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(17,21,23,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-03 15:05:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000','SENT','QA Reports 50 | Scenario 013','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(18,22,24,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-02 15:05:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000','SENT','QA Reports 50 | Scenario 014','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(19,23,25,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-01 15:05:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000','SENT','QA Reports 50 | Scenario 015','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(20,24,26,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000','FAILED','QA Reports 50 | Scenario 016','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(21,25,27,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-29 15:05:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000','SENT','QA Reports 50 | Scenario 017','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(22,26,28,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-28 15:05:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000','SENT','QA Reports 50 | Scenario 018','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(23,27,29,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-27 15:05:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000','SENT','QA Reports 50 | Scenario 019','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(24,28,30,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-04 15:00:00.000000','2026-09-04 15:00:00.000000','FAILED','QA Reports 50 | Scenario 020','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(25,29,31,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-25 15:05:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000','SENT','QA Reports 50 | Scenario 021','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(26,30,32,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-24 15:05:00.000000',NULL,NULL,'2026-09-24 15:00:00.000000','2026-09-24 15:00:00.000000','SENT','QA Reports 50 | Scenario 022','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(27,31,33,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-23 15:05:00.000000',NULL,NULL,'2026-09-23 15:00:00.000000','2026-09-23 15:00:00.000000','SENT','QA Reports 50 | Scenario 023','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(28,32,34,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-22 15:00:00.000000','2026-09-22 15:00:00.000000','FAILED','QA Reports 50 | Scenario 024','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(29,33,35,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-21 15:05:00.000000',NULL,NULL,'2026-09-21 15:00:00.000000','2026-09-21 15:00:00.000000','SENT','QA Reports 50 | Scenario 025','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(30,34,36,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-20 15:05:00.000000',NULL,NULL,'2026-09-20 15:00:00.000000','2026-09-20 15:00:00.000000','SENT','QA Reports 50 | Scenario 026','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(31,35,37,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-19 15:05:00.000000',NULL,NULL,'2026-09-19 15:00:00.000000','2026-09-19 15:00:00.000000','SENT','QA Reports 50 | Scenario 027','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(32,36,38,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-18 15:00:00.000000','2026-09-18 15:00:00.000000','FAILED','QA Reports 50 | Scenario 028','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(33,37,39,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-15 15:05:00.000000',NULL,NULL,'2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000','SENT','QA Reports 50 | Scenario 029','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(34,38,40,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-08 15:05:00.000000',NULL,NULL,'2026-09-08 15:00:00.000000','2026-09-08 15:00:00.000000','SENT','QA Reports 50 | Scenario 030','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(35,39,41,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-13 15:05:00.000000',NULL,NULL,'2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000','SENT','QA Reports 50 | Scenario 031','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(36,40,42,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000','FAILED','QA Reports 50 | Scenario 032','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(37,41,43,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-11 15:05:00.000000',NULL,NULL,'2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000','SENT','QA Reports 50 | Scenario 033','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(38,42,44,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-10 15:05:00.000000',NULL,NULL,'2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000','SENT','QA Reports 50 | Scenario 034','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(39,43,45,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-09 15:05:00.000000',NULL,NULL,'2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000','SENT','QA Reports 50 | Scenario 035','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(40,44,46,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000','FAILED','QA Reports 50 | Scenario 036','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(41,45,47,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-07 15:05:00.000000',NULL,NULL,'2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000','SENT','QA Reports 50 | Scenario 037','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(42,46,48,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-06 15:05:00.000000',NULL,NULL,'2026-10-06 15:00:00.000000','2026-10-06 15:00:00.000000','SENT','QA Reports 50 | Scenario 038','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(43,47,49,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-05 15:05:00.000000',NULL,NULL,'2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000','SENT','QA Reports 50 | Scenario 039','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(44,48,50,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-05 15:00:00.000000','2026-09-05 15:00:00.000000','FAILED','QA Reports 50 | Scenario 040','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(45,49,51,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-03 15:05:00.000000',NULL,NULL,'2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000','SENT','QA Reports 50 | Scenario 041','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(46,50,52,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-02 15:05:00.000000',NULL,NULL,'2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000','SENT','QA Reports 50 | Scenario 042','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(47,51,53,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-10-01 15:05:00.000000',NULL,NULL,'2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000','SENT','QA Reports 50 | Scenario 043','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(48,52,54,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000','FAILED','QA Reports 50 | Scenario 044','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(49,53,55,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-29 15:05:00.000000',NULL,NULL,'2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000','SENT','QA Reports 50 | Scenario 045','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(50,54,56,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-28 15:05:00.000000',NULL,NULL,'2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000','SENT','QA Reports 50 | Scenario 046','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(51,55,57,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-27 15:05:00.000000',NULL,NULL,'2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000','SENT','QA Reports 50 | Scenario 047','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(52,56,58,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-26 15:00:00.000000','2026-09-26 15:00:00.000000','FAILED','QA Reports 50 | Scenario 048','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,'Synthetic delivery failure for admin report QA',NULL,0,NULL),(53,57,59,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-25 15:05:00.000000',NULL,NULL,'2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000','SENT','QA Reports 50 | Scenario 049','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(54,58,60,NULL,NULL,NULL,'SYSTEM_ALERT','SYSTEM',NULL,NULL,NULL,'2026-09-09 15:05:00.000000',NULL,NULL,'2026-09-09 15:00:00.000000','2026-09-09 15:00:00.000000','SENT','QA Reports 50 | Scenario 050','Fictional local testing event; no delivery requested.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL),(55,NULL,NULL,NULL,NULL,NULL,'SYSTEM_ALERT','TELEGRAM',NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-16 03:04:44.990115','2026-10-16 03:06:49.832884','FAILED','NEW SUBSCRIPTION PAYMENT','Order: SUB2610161040\nUser: 6\nPackage: BASIC\nExpected: USD 0.01\nPayer: Koeurng vireak\nABA Account: ***247\nMethod: ABA PayWay Static Link\nOrder Status: PENDING_PAYMENT\nPayment Status: PENDING\nCreated: 2026-10-16T03:04:44.942126900Z\nExpires: 2026-10-16T03:34:44.932112200Z\nAwaiting genuine ABA merchant payment notification.',NULL,NULL,NULL,'-1004254354469',NULL,'Telegram delivery unavailable; operator retry required after three attempts','subscription-pending:SUB2610161040',3,'2026-10-16 03:07:49.824834');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_members`
--

DROP TABLE IF EXISTS `organization_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_members` (
  `member_id` bigint NOT NULL AUTO_INCREMENT,
  `organization_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'MEMBER',
  `status` varchar(50) NOT NULL DEFAULT 'INVITED',
  `invited_at` datetime(6) DEFAULT NULL,
  `joined_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `uk_organization_members_email` (`organization_id`,`email`),
  KEY `idx_organization_members_user` (`user_id`,`status`),
  CONSTRAINT `fk_organization_members_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`organization_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_organization_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_members`
--

LOCK TABLES `organization_members` WRITE;
/*!40000 ALTER TABLE `organization_members` DISABLE KEYS */;
INSERT INTO `organization_members` VALUES (1,1,1,'demo@koupreng.local','OWNER','ACTIVE',NULL,'2026-09-15 13:35:46.202824','2026-09-15 13:35:46.202824','2026-09-15 13:35:46.202824'),(2,1,2,'admin.demo@koupreng.local','ADMIN','ACTIVE',NULL,'2026-09-15 13:35:46.207387','2026-09-15 13:35:46.207387','2026-09-15 13:35:46.207387');
/*!40000 ALTER TABLE `organization_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `organization_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `owner_user_id` bigint NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`organization_id`),
  UNIQUE KEY `uk_organizations_slug` (`slug`),
  KEY `idx_organizations_owner` (`owner_user_id`,`status`),
  CONSTRAINT `fk_organizations_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Koupreng Demo Events','koupreng-demo-events',1,'ACTIVE','2026-09-15 13:35:46.191796','2026-09-15 13:35:46.191796');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizer_payout_accounts`
--

DROP TABLE IF EXISTS `organizer_payout_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizer_payout_accounts` (
  `payout_account_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `merchant_id` varchar(255) DEFAULT NULL,
  `merchant_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`payout_account_id`),
  KEY `fk_payout_user` (`user_id`),
  CONSTRAINT `fk_payout_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizer_payout_accounts`
--

LOCK TABLES `organizer_payout_accounts` WRITE;
/*!40000 ALTER TABLE `organizer_payout_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `organizer_payout_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `package_id` bigint NOT NULL AUTO_INCREMENT,
  `package_name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `billing_interval` varchar(30) NOT NULL DEFAULT 'ONCE',
  `duration_days` int DEFAULT NULL,
  `max_invitations` int DEFAULT NULL,
  `max_guests` int DEFAULT NULL,
  `max_guests_per_invitation` int DEFAULT NULL,
  `max_team_members` int DEFAULT NULL,
  `features_json` json DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `premium_templates_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `qr_invitations_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `qr_check_in_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `seating_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `advanced_analytics_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `custom_branding_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `team_members_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `ai_assistant_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `public_visible` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`package_id`),
  UNIQUE KEY `uk_packages_code` (`code`),
  KEY `idx_packages_active_sort_price` (`active`,`sort_order`,`price`),
  KEY `idx_packages_status` (`status`),
  KEY `idx_packages_public_visible` (`public_visible`,`active`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Basic','BASIC','Starter plan for small invitations.',0.01,'USD','YEARLY',365,1,40,40,1,'{\"guestImport\": true, \"qrInvitations\": true}','ACTIVE',0,1,0,0,0,0,0,0,1,1,10,'2026-09-15 19:30:57.728456','2026-09-17 08:45:23.550192'),(2,'Pro','PRO','Premium invitation operations for hosts.',199.00,'USD','YEARLY',365,20,2000,500,5,'{\"seating\": true, \"analytics\": true, \"qrCheckIn\": true, \"premiumTemplates\": true}','ACTIVE',1,1,1,1,1,1,1,1,1,1,20,'2026-09-15 19:30:57.730127','2026-09-17 08:45:23.547824'),(3,'Premium','PREMIUM','Team foundation for planners and venues.',499.00,'USD','CUSTOM',365,999,99999,5000,25,'{\"teamMembers\": true, \"customBranding\": true, \"advancedAnalytics\": true}','ACTIVE',1,1,1,1,1,1,1,1,1,1,30,'2026-09-15 19:30:57.730585','2026-09-17 08:45:23.550874'),(4,'Developer Starter','DEV_STARTER','Free fictional package for local API exploration; no subscription is granted by seeding.',0.00,'USD','ONCE',30,3,200,100,3,'{\"developerFixture\": true}','ACTIVE',0,1,1,1,0,0,1,1,1,0,100,'2026-09-15 13:35:46.266097','2026-10-22 12:09:02.578417');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `token_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `uk_password_reset_tokens_hash` (`token_hash`),
  KEY `idx_password_reset_tokens_user` (`user_id`),
  KEY `idx_password_reset_tokens_expires_at` (`expires_at`),
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_configs`
--

DROP TABLE IF EXISTS `payment_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_configs` (
  `payment_config_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `is_fixed_amount` tinyint(1) NOT NULL DEFAULT '0',
  `fixed_amount` decimal(12,2) DEFAULT NULL,
  `min_amount` decimal(12,2) DEFAULT NULL,
  `max_amount` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `allow_anonymous` tinyint(1) NOT NULL DEFAULT '1',
  `organizer_label` varchar(255) DEFAULT NULL,
  `success_message` text,
  `telegram_notify_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `telegram_chat_id` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`payment_config_id`),
  UNIQUE KEY `invitation_id` (`invitation_id`),
  CONSTRAINT `fk_payment_configs_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_configs`
--

LOCK TABLES `payment_configs` WRITE;
/*!40000 ALTER TABLE `payment_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_evidence`
--

DROP TABLE IF EXISTS `payment_evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_evidence` (
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `payer_name` varchar(120) DEFAULT NULL,
  `payer_last3` varchar(3) DEFAULT NULL,
  `approval_code` varchar(100) DEFAULT NULL,
  `remark` varchar(120) DEFAULT NULL,
  `chat_id` varchar(100) DEFAULT NULL,
  `message_id` varchar(100) DEFAULT NULL,
  `sender_id` varchar(100) DEFAULT NULL,
  `merchant_message_at` datetime(6) DEFAULT NULL,
  `transaction_date_text` varchar(120) DEFAULT NULL,
  `received_at` datetime(6) NOT NULL,
  `trusted` tinyint(1) NOT NULL DEFAULT '0',
  `order_code` varchar(50) DEFAULT NULL,
  `outcome` varchar(30) NOT NULL DEFAULT 'RECEIVED',
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `uk_payment_evidence_message` (`chat_id`,`message_id`),
  KEY `idx_payment_evidence_order` (`order_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_evidence`
--

LOCK TABLES `payment_evidence` WRITE;
/*!40000 ALTER TABLE `payment_evidence` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_evidence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_id` bigint DEFAULT NULL,
  `payment_config_id` bigint NOT NULL,
  `payer_name` varchar(255) DEFAULT NULL,
  `payer_message` text,
  `merchant_ref_no` varchar(255) DEFAULT NULL,
  `payway_transaction_id` varchar(255) DEFAULT NULL,
  `channel` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `qr_payload` text,
  `payment_link` varchar(1000) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `requested_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `callback_received` tinyint(1) NOT NULL DEFAULT '0',
  `raw_callback_json` json DEFAULT NULL,
  `verification_response_json` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `merchant_ref_no` (`merchant_ref_no`),
  KEY `fk_payment_tx_invitation` (`invitation_id`),
  KEY `fk_payment_tx_guest` (`guest_id`),
  KEY `fk_payment_tx_config` (`payment_config_id`),
  CONSTRAINT `fk_payment_tx_config` FOREIGN KEY (`payment_config_id`) REFERENCES `payment_configs` (`payment_config_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_tx_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payment_tx_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_webhook_logs`
--

DROP TABLE IF EXISTS `payment_webhook_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_webhook_logs` (
  `webhook_log_id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint DEFAULT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `request_headers` text,
  `request_body` text,
  `received_at` datetime(6) DEFAULT NULL,
  `processed_status` varchar(50) DEFAULT NULL,
  `processing_note` text,
  PRIMARY KEY (`webhook_log_id`),
  KEY `fk_webhook_payment` (`payment_id`),
  CONSTRAINT `fk_webhook_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment_transactions` (`payment_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_webhook_logs`
--

LOCK TABLES `payment_webhook_logs` WRITE;
/*!40000 ALTER TABLE `payment_webhook_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_webhook_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rsvps`
--

DROP TABLE IF EXISTS `rsvps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rsvps` (
  `rsvp_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_id` bigint DEFAULT NULL,
  `response_status` varchar(50) DEFAULT NULL,
  `attendee_count` int DEFAULT NULL,
  `message` text,
  `responded_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`rsvp_id`),
  UNIQUE KEY `uk_rsvps_guest_id` (`guest_id`),
  KEY `idx_rsvps_invitation_id` (`invitation_id`),
  CONSTRAINT `fk_rsvps_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rsvps_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rsvps`
--

LOCK TABLES `rsvps` WRITE;
/*!40000 ALTER TABLE `rsvps` DISABLE KEYS */;
INSERT INTO `rsvps` VALUES (1,1,1,'ATTENDING',2,'We are delighted to celebrate with you.','2026-09-15 13:35:46.227916'),(2,1,2,'NOT_ATTENDING',0,'Thank you for the invitation; we send our best wishes.','2026-09-15 13:35:46.229956'),(3,2,4,'ATTENDING',1,NULL,'2026-09-17 02:09:13.155251'),(4,11,13,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(5,11,14,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(6,11,15,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(7,11,16,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(8,12,18,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-14 18:00:00.000000'),(9,12,19,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-14 18:00:00.000000'),(10,12,20,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-14 18:00:00.000000'),(11,12,21,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-14 18:00:00.000000'),(12,13,23,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(13,13,24,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(14,13,25,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(15,13,26,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(16,14,28,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(17,14,29,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(18,14,30,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(19,14,31,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(20,15,33,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(21,15,34,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(22,15,35,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(23,15,36,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(24,16,38,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(25,16,39,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(26,16,40,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(27,16,41,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(28,17,43,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(29,17,44,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(30,17,45,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(31,17,46,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(32,18,48,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(33,18,49,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(34,18,50,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(35,18,51,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(36,19,53,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(37,19,54,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(38,19,55,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(39,19,56,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(40,20,58,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-07 18:00:00.000000'),(41,20,59,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-07 18:00:00.000000'),(42,20,60,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-07 18:00:00.000000'),(43,20,61,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-07 18:00:00.000000'),(44,21,63,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(45,21,64,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(46,21,65,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(47,21,66,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(48,22,68,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-04 18:00:00.000000'),(49,22,69,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-04 18:00:00.000000'),(50,22,70,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-04 18:00:00.000000'),(51,22,71,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-04 18:00:00.000000'),(52,23,73,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(53,23,74,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(54,23,75,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(55,23,76,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(56,24,78,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(57,24,79,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(58,24,80,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(59,24,81,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(60,25,83,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(61,25,84,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(62,25,85,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(63,25,86,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(64,26,88,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(65,26,89,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(66,26,90,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(67,26,91,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(68,27,93,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(69,27,94,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(70,27,95,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(71,27,96,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(72,28,98,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(73,28,99,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(74,28,100,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(75,28,101,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(76,29,103,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(77,29,104,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(78,29,105,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(79,29,106,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(80,30,108,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-04 18:00:00.000000'),(81,30,109,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-04 18:00:00.000000'),(82,30,110,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-04 18:00:00.000000'),(83,30,111,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-04 18:00:00.000000'),(84,31,113,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(85,31,114,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(86,31,115,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(87,31,116,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(88,32,118,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-24 18:00:00.000000'),(89,32,119,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-24 18:00:00.000000'),(90,32,120,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-24 18:00:00.000000'),(91,32,121,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-24 18:00:00.000000'),(92,33,123,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-23 18:00:00.000000'),(93,33,124,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-23 18:00:00.000000'),(94,33,125,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-23 18:00:00.000000'),(95,33,126,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-23 18:00:00.000000'),(96,34,128,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-22 18:00:00.000000'),(97,34,129,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-22 18:00:00.000000'),(98,34,130,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-22 18:00:00.000000'),(99,34,131,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-22 18:00:00.000000'),(100,35,133,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-21 18:00:00.000000'),(101,35,134,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-21 18:00:00.000000'),(102,35,135,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-21 18:00:00.000000'),(103,35,136,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-21 18:00:00.000000'),(104,36,138,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-20 18:00:00.000000'),(105,36,139,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-20 18:00:00.000000'),(106,36,140,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-20 18:00:00.000000'),(107,36,141,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-20 18:00:00.000000'),(108,37,143,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-19 18:00:00.000000'),(109,37,144,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-19 18:00:00.000000'),(110,37,145,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-19 18:00:00.000000'),(111,37,146,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-19 18:00:00.000000'),(112,38,148,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-18 18:00:00.000000'),(113,38,149,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-18 18:00:00.000000'),(114,38,150,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-18 18:00:00.000000'),(115,38,151,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-18 18:00:00.000000'),(116,39,153,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(117,39,154,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(118,39,155,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(119,39,156,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-15 18:00:00.000000'),(120,40,158,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-08 18:00:00.000000'),(121,40,159,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-08 18:00:00.000000'),(122,40,160,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-08 18:00:00.000000'),(123,40,161,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-08 18:00:00.000000'),(124,41,163,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(125,41,164,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(126,41,165,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(127,41,166,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-13 18:00:00.000000'),(128,42,168,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(129,42,169,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(130,42,170,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(131,42,171,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-12 18:00:00.000000'),(132,43,173,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(133,43,174,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(134,43,175,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(135,43,176,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-11 18:00:00.000000'),(136,44,178,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(137,44,179,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(138,44,180,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(139,44,181,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-10 18:00:00.000000'),(140,45,183,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(141,45,184,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(142,45,185,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(143,45,186,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-09 18:00:00.000000'),(144,46,188,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(145,46,189,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(146,46,190,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(147,46,191,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-08 18:00:00.000000'),(148,47,193,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(149,47,194,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(150,47,195,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(151,47,196,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-07 18:00:00.000000'),(152,48,198,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-06 18:00:00.000000'),(153,48,199,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-06 18:00:00.000000'),(154,48,200,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-06 18:00:00.000000'),(155,48,201,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-06 18:00:00.000000'),(156,49,203,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(157,49,204,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(158,49,205,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(159,49,206,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-05 18:00:00.000000'),(160,50,208,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-05 18:00:00.000000'),(161,50,209,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-05 18:00:00.000000'),(162,50,210,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-05 18:00:00.000000'),(163,50,211,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-05 18:00:00.000000'),(164,51,213,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(165,51,214,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(166,51,215,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(167,51,216,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-03 18:00:00.000000'),(168,52,218,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(169,52,219,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(170,52,220,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(171,52,221,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-02 18:00:00.000000'),(172,53,223,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(173,53,224,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(174,53,225,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(175,53,226,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-10-01 18:00:00.000000'),(176,54,228,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(177,54,229,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(178,54,230,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(179,54,231,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-30 18:00:00.000000'),(180,55,233,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(181,55,234,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(182,55,235,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(183,55,236,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-29 18:00:00.000000'),(184,56,238,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(185,56,239,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(186,56,240,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(187,56,241,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-28 18:00:00.000000'),(188,57,243,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(189,57,244,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(190,57,245,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(191,57,246,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-27 18:00:00.000000'),(192,58,248,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-26 18:00:00.000000'),(193,58,249,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-26 18:00:00.000000'),(194,58,250,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-26 18:00:00.000000'),(195,58,251,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-26 18:00:00.000000'),(196,59,253,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(197,59,254,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(198,59,255,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(199,59,256,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-25 18:00:00.000000'),(200,60,258,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-09 18:00:00.000000'),(201,60,259,'ATTENDING',2,'QA_ADMIN_REPORTS_50','2026-09-09 18:00:00.000000'),(202,60,260,'NOT_ATTENDING',0,'QA_ADMIN_REPORTS_50','2026-09-09 18:00:00.000000'),(203,60,261,'MAYBE',0,'QA_ADMIN_REPORTS_50','2026-09-09 18:00:00.000000');
/*!40000 ALTER TABLE `rsvps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `subscription_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `package_id` bigint NOT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `order_code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `provider` varchar(80) DEFAULT NULL,
  `payment_link` text,
  `payment_note` varchar(120) DEFAULT NULL,
  `payer_name` varchar(120) DEFAULT NULL,
  `payer_account_last3` char(3) DEFAULT NULL,
  `payment_expires_at` datetime(6) DEFAULT NULL,
  `payway_transaction_id` varchar(100) DEFAULT NULL,
  `payway_approval_code` varchar(100) DEFAULT NULL,
  `payway_payer_name` varchar(120) DEFAULT NULL,
  `payment_detected_at` datetime(6) DEFAULT NULL,
  `payment_raw_source` text,
  `payment_evidence_reference` varchar(255) DEFAULT NULL,
  `payment_remark` varchar(120) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `confirm_source` varchar(50) DEFAULT NULL,
  `confirmed_by` varchar(120) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `active_slot` tinyint GENERATED ALWAYS AS (if(`is_active`,1,NULL)) STORED,
  PRIMARY KEY (`subscription_id`),
  UNIQUE KEY `uk_subscriptions_order_code` (`order_code`),
  UNIQUE KEY `uk_subscriptions_one_active_per_user` (`user_id`,`active_slot`),
  UNIQUE KEY `uk_subscriptions_payway_transaction_id` (`payway_transaction_id`),
  KEY `idx_subscriptions_user_active` (`user_id`,`is_active`,`end_date`),
  KEY `idx_subscriptions_user_created` (`user_id`,`created_at`),
  KEY `idx_subscriptions_package` (`package_id`),
  KEY `idx_subscriptions_static_payment_match` (`payment_status`,`status`,`amount`,`currency`,`payer_account_last3`,`payment_expires_at`),
  CONSTRAINT `fk_subscriptions_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` (`subscription_id`, `user_id`, `package_id`, `start_date`, `end_date`, `order_code`, `amount`, `paid_amount`, `currency`, `provider`, `payment_link`, `payment_note`, `payer_name`, `payer_account_last3`, `payment_expires_at`, `payway_transaction_id`, `payway_approval_code`, `payway_payer_name`, `payment_detected_at`, `payment_raw_source`, `payment_evidence_reference`, `payment_remark`, `payment_status`, `paid_at`, `confirm_source`, `confirmed_by`, `confirmed_at`, `status`, `is_active`, `created_at`, `updated_at`) VALUES (1,3,2,NULL,NULL,'SUB2609156290',169.00,NULL,'USD','ABA_PAYWAY_STATIC_TELEGRAM','https://link.payway.com.kh/ABAPAYrD450560q','SUB2609156290',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,NULL,NULL,NULL,'PENDING_PAYMENT',0,'2026-09-15 13:40:08.511267','2026-09-15 13:40:08.511267'),(2,6,1,NULL,NULL,'SUB2610138332',0.01,NULL,'USD','ABA_PAYWAY_STATIC_TELEGRAM','https://link.payway.com.kh/ABAPAYMu523385B','SUB2610138332','KOEURNG VIREAK','247','2026-10-13 09:31:15.609639',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXPIRED',NULL,NULL,NULL,NULL,'EXPIRED',0,'2026-10-13 09:01:15.622503','2026-10-20 10:33:32.830366'),(3,10,1,'2026-10-14 15:00:00.000000','2026-11-13 15:00:00.000000','QA50-002',0.01,0.01,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-14 15:30:00.000000','qa-admin-reports-50-002-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-14 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-14 15:20:00.000000','ACTIVE',1,'2026-10-14 15:00:00.000000','2026-10-14 15:00:00.000000'),(4,12,2,NULL,NULL,'QA50-004',199.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-12 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID_PENDING_REVIEW',NULL,NULL,NULL,NULL,'REVIEW_REQUIRED',0,'2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000'),(5,14,3,NULL,NULL,'QA50-006',499.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-10 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','REJECTED',NULL,NULL,NULL,NULL,'REJECTED',0,'2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000'),(6,16,1,NULL,NULL,'QA50-008',0.01,0.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-08 15:30:00.000000','qa-admin-reports-50-008-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-08 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-08 15:20:00.000000','REVIEW_REQUIRED',0,'2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000'),(7,18,2,'2026-09-07 15:00:00.000000','2026-10-07 15:00:00.000000','QA50-010',199.00,199.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-07 15:30:00.000000','qa-admin-reports-50-010-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-07 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-07 15:20:00.000000','EXPIRED',0,'2026-09-07 15:00:00.000000','2026-09-07 15:00:00.000000'),(8,20,3,'2026-10-04 15:00:00.000000','2026-11-03 15:00:00.000000','QA50-012',499.00,499.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-04 15:30:00.000000','qa-admin-reports-50-012-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-04 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-04 15:20:00.000000','ACTIVE',1,'2026-10-04 15:00:00.000000','2026-10-04 15:00:00.000000'),(9,22,1,NULL,NULL,'QA50-014',0.01,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-02 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID_PENDING_REVIEW',NULL,NULL,NULL,NULL,'REVIEW_REQUIRED',0,'2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000'),(10,24,2,NULL,NULL,'QA50-016',199.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-30 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','REJECTED',NULL,NULL,NULL,NULL,'REJECTED',0,'2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000'),(11,26,3,NULL,NULL,'QA50-018',499.00,498.99,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-28 15:30:00.000000','qa-admin-reports-50-018-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-28 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-28 15:20:00.000000','REVIEW_REQUIRED',0,'2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000'),(12,28,1,'2026-09-04 15:00:00.000000','2026-10-04 15:00:00.000000','QA50-020',0.01,0.01,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-04 15:30:00.000000','qa-admin-reports-50-020-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-04 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-04 15:20:00.000000','EXPIRED',0,'2026-09-04 15:00:00.000000','2026-09-04 15:00:00.000000'),(13,30,2,'2026-09-24 15:00:00.000000','2026-10-24 15:00:00.000000','QA50-022',199.00,199.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-24 15:30:00.000000','qa-admin-reports-50-022-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-24 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-24 15:20:00.000000','ACTIVE',1,'2026-09-24 15:00:00.000000','2026-09-24 15:00:00.000000'),(14,32,3,NULL,NULL,'QA50-024',499.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-22 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID_PENDING_REVIEW',NULL,NULL,NULL,NULL,'REVIEW_REQUIRED',0,'2026-09-22 15:00:00.000000','2026-09-22 15:00:00.000000'),(15,34,1,NULL,NULL,'QA50-026',0.01,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-20 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','REJECTED',NULL,NULL,NULL,NULL,'REJECTED',0,'2026-09-20 15:00:00.000000','2026-09-20 15:00:00.000000'),(16,36,2,NULL,NULL,'QA50-028',199.00,198.99,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-18 15:30:00.000000','qa-admin-reports-50-028-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-18 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-18 15:20:00.000000','REVIEW_REQUIRED',0,'2026-09-18 15:00:00.000000','2026-09-18 15:00:00.000000'),(17,38,3,'2026-09-08 15:00:00.000000','2026-10-08 15:00:00.000000','QA50-030',499.00,499.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-08 15:30:00.000000','qa-admin-reports-50-030-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-08 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-08 15:20:00.000000','EXPIRED',0,'2026-09-08 15:00:00.000000','2026-09-08 15:00:00.000000'),(18,40,1,'2026-10-12 15:00:00.000000','2026-11-11 15:00:00.000000','QA50-032',0.01,0.01,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-12 15:30:00.000000','qa-admin-reports-50-032-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-12 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-12 15:20:00.000000','ACTIVE',1,'2026-10-12 15:00:00.000000','2026-10-12 15:00:00.000000'),(19,42,2,NULL,NULL,'QA50-034',199.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-10 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID_PENDING_REVIEW',NULL,NULL,NULL,NULL,'REVIEW_REQUIRED',0,'2026-10-10 15:00:00.000000','2026-10-10 15:00:00.000000'),(20,44,3,NULL,NULL,'QA50-036',499.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-08 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','REJECTED',NULL,NULL,NULL,NULL,'REJECTED',0,'2026-10-08 15:00:00.000000','2026-10-08 15:00:00.000000'),(21,46,1,NULL,NULL,'QA50-038',0.01,0.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-06 15:30:00.000000','qa-admin-reports-50-038-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-06 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-06 15:20:00.000000','REVIEW_REQUIRED',0,'2026-10-06 15:00:00.000000','2026-10-06 15:00:00.000000'),(22,48,2,'2026-09-05 15:00:00.000000','2026-10-05 15:00:00.000000','QA50-040',199.00,199.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-05 15:30:00.000000','qa-admin-reports-50-040-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-05 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-05 15:20:00.000000','EXPIRED',0,'2026-09-05 15:00:00.000000','2026-09-05 15:00:00.000000'),(23,50,3,'2026-10-02 15:00:00.000000','2026-11-01 15:00:00.000000','QA50-042',499.00,499.00,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-10-02 15:30:00.000000','qa-admin-reports-50-042-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-10-02 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-02 15:20:00.000000','ACTIVE',1,'2026-10-02 15:00:00.000000','2026-10-02 15:00:00.000000'),(24,52,1,NULL,NULL,'QA50-044',0.01,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-30 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID_PENDING_REVIEW',NULL,NULL,NULL,NULL,'REVIEW_REQUIRED',0,'2026-09-30 15:00:00.000000','2026-09-30 15:00:00.000000'),(25,54,2,NULL,NULL,'QA50-046',199.00,NULL,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-28 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','REJECTED',NULL,NULL,NULL,NULL,'REJECTED',0,'2026-09-28 15:00:00.000000','2026-09-28 15:00:00.000000'),(26,56,3,NULL,NULL,'QA50-048',499.00,498.99,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-26 15:30:00.000000','qa-admin-reports-50-048-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-26 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-26 15:20:00.000000','REVIEW_REQUIRED',0,'2026-09-26 15:00:00.000000','2026-09-26 15:00:00.000000'),(27,58,1,'2026-09-09 15:00:00.000000','2026-10-09 15:00:00.000000','QA50-050',0.01,0.01,'USD','QA_REPORT_FIXTURE',NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,'2026-09-09 15:30:00.000000','qa-admin-reports-50-050-synthetic',NULL,NULL,NULL,NULL,NULL,'QA_ADMIN_REPORTS_50','PAID','2026-09-09 15:20:00.000000','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-09 15:20:00.000000','EXPIRED',0,'2026-09-09 15:00:00.000000','2026-09-09 15:00:00.000000'),(28,6,1,NULL,NULL,'SUB2610161040',0.01,NULL,'USD','ABA_PAYWAY_STATIC_TELEGRAM','https://link.payway.com.kh/ABAPAYMu523385B','SUB2610161040','Koeurng vireak','247','2026-10-16 03:34:44.932112',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'EXPIRED',NULL,NULL,NULL,NULL,'EXPIRED',0,'2026-10-16 03:04:44.942127','2026-10-20 10:33:30.150682');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_audit_logs`
--

DROP TABLE IF EXISTS `system_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_audit_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `actor_user_id` bigint DEFAULT NULL,
  `actor_email` varchar(255) DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `resource_type` varchar(100) DEFAULT NULL,
  `resource_id` bigint DEFAULT NULL,
  `description` text,
  `ip_address` varchar(100) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `metadata_json` text,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_system_audit_logs_created_at` (`created_at`),
  KEY `idx_system_audit_logs_actor` (`actor_user_id`),
  KEY `idx_system_audit_logs_resource` (`resource_type`,`resource_id`),
  CONSTRAINT `fk_system_audit_logs_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_audit_logs`
--

LOCK TABLES `system_audit_logs` WRITE;
/*!40000 ALTER TABLE `system_audit_logs` DISABLE KEYS */;
INSERT INTO `system_audit_logs` VALUES (1,NULL,NULL,'SUBSCRIPTION_CREATED','SUBSCRIPTION',1,'Subscription payment order created for package: Pro, code: SUB2609156290',NULL,NULL,'{\"packageId\":2,\"userId\":3}','2026-09-15 13:40:08.599126'),(24,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',3,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:25:27.809998'),(25,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',4,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:28:30.556311'),(26,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',5,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:29:49.650496'),(27,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',6,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:31:12.504129'),(28,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',7,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:32:54.076019'),(29,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',8,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:34:36.533882'),(30,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',9,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 01:44:50.149441'),(31,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',10,'Invitation published by owner',NULL,NULL,'{\"userId\":1}','2026-09-22 02:19:33.071234'),(33,NULL,NULL,'SUBSCRIPTION_CREATED','SUBSCRIPTION',2,'Subscription payment order created for package: Basic, code: SUB2610138332',NULL,NULL,'{\"packageId\":1,\"userId\":6}','2026-10-13 09:01:15.674004'),(34,2,'admin.demo@koupreng.local','TEMPLATE_DELETED','TEMPLATE',1,'Deleted template','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','{\"name\":\"Royal Khmer Wedding\"}','2026-10-15 16:28:18.400385'),(35,9,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',11,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 1, \"synthetic\": true}','2026-10-15 15:00:00.000000'),(36,10,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',12,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 2, \"synthetic\": true}','2026-10-14 15:00:00.000000'),(37,11,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',13,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 3, \"synthetic\": true}','2026-10-13 15:00:00.000000'),(38,12,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',14,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 4, \"synthetic\": true}','2026-10-12 15:00:00.000000'),(39,13,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',15,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 5, \"synthetic\": true}','2026-10-11 15:00:00.000000'),(40,14,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',16,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 6, \"synthetic\": true}','2026-10-10 15:00:00.000000'),(41,15,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',17,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 7, \"synthetic\": true}','2026-10-09 15:00:00.000000'),(42,16,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',18,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 8, \"synthetic\": true}','2026-10-08 15:00:00.000000'),(43,17,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',19,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 9, \"synthetic\": true}','2026-10-07 15:00:00.000000'),(44,18,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',20,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 10, \"synthetic\": true}','2026-09-07 15:00:00.000000'),(45,19,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',21,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 11, \"synthetic\": true}','2026-10-05 15:00:00.000000'),(46,20,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',22,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 12, \"synthetic\": true}','2026-10-04 15:00:00.000000'),(47,21,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',23,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 13, \"synthetic\": true}','2026-10-03 15:00:00.000000'),(48,22,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',24,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 14, \"synthetic\": true}','2026-10-02 15:00:00.000000'),(49,23,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',25,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 15, \"synthetic\": true}','2026-10-01 15:00:00.000000'),(50,24,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',26,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 16, \"synthetic\": true}','2026-09-30 15:00:00.000000'),(51,25,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',27,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 17, \"synthetic\": true}','2026-09-29 15:00:00.000000'),(52,26,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',28,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 18, \"synthetic\": true}','2026-09-28 15:00:00.000000'),(53,27,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',29,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 19, \"synthetic\": true}','2026-09-27 15:00:00.000000'),(54,28,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',30,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 20, \"synthetic\": true}','2026-09-04 15:00:00.000000'),(55,29,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',31,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 21, \"synthetic\": true}','2026-09-25 15:00:00.000000'),(56,30,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',32,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 22, \"synthetic\": true}','2026-09-24 15:00:00.000000'),(57,31,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',33,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 23, \"synthetic\": true}','2026-09-23 15:00:00.000000'),(58,32,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',34,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 24, \"synthetic\": true}','2026-09-22 15:00:00.000000'),(59,33,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',35,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 25, \"synthetic\": true}','2026-09-21 15:00:00.000000'),(60,34,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',36,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 26, \"synthetic\": true}','2026-09-20 15:00:00.000000'),(61,35,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',37,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 27, \"synthetic\": true}','2026-09-19 15:00:00.000000'),(62,36,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',38,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 28, \"synthetic\": true}','2026-09-18 15:00:00.000000'),(63,37,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',39,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 29, \"synthetic\": true}','2026-10-15 15:00:00.000000'),(64,38,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',40,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 30, \"synthetic\": true}','2026-09-08 15:00:00.000000'),(65,39,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',41,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 31, \"synthetic\": true}','2026-10-13 15:00:00.000000'),(66,40,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',42,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 32, \"synthetic\": true}','2026-10-12 15:00:00.000000'),(67,41,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',43,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 33, \"synthetic\": true}','2026-10-11 15:00:00.000000'),(68,42,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',44,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 34, \"synthetic\": true}','2026-10-10 15:00:00.000000'),(69,43,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',45,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 35, \"synthetic\": true}','2026-10-09 15:00:00.000000'),(70,44,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',46,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 36, \"synthetic\": true}','2026-10-08 15:00:00.000000'),(71,45,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',47,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 37, \"synthetic\": true}','2026-10-07 15:00:00.000000'),(72,46,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',48,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 38, \"synthetic\": true}','2026-10-06 15:00:00.000000'),(73,47,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',49,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 39, \"synthetic\": true}','2026-10-05 15:00:00.000000'),(74,48,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',50,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 40, \"synthetic\": true}','2026-09-05 15:00:00.000000'),(75,49,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',51,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 41, \"synthetic\": true}','2026-10-03 15:00:00.000000'),(76,50,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',52,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 42, \"synthetic\": true}','2026-10-02 15:00:00.000000'),(77,51,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',53,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 43, \"synthetic\": true}','2026-10-01 15:00:00.000000'),(78,52,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',54,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 44, \"synthetic\": true}','2026-09-30 15:00:00.000000'),(79,53,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',55,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 45, \"synthetic\": true}','2026-09-29 15:00:00.000000'),(80,54,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',56,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 46, \"synthetic\": true}','2026-09-28 15:00:00.000000'),(81,55,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',57,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 47, \"synthetic\": true}','2026-09-27 15:00:00.000000'),(82,56,NULL,'QA_REPORT_SAMPLE_FAILED','QA_ADMIN_REPORTS_50',58,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 48, \"synthetic\": true}','2026-09-26 15:00:00.000000'),(83,57,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',59,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 49, \"synthetic\": true}','2026-09-25 15:00:00.000000'),(84,58,NULL,'QA_REPORT_SAMPLE_CREATED','QA_ADMIN_REPORTS_50',60,'Synthetic admin-report testing scenario.',NULL,NULL,'{\"dataset\": \"QA_ADMIN_REPORTS_50\", \"scenario\": 50, \"synthetic\": true}','2026-09-09 15:00:00.000000'),(85,NULL,NULL,'SUBSCRIPTION_CREATED','SUBSCRIPTION',28,'Subscription payment order created for package: Basic, code: SUB2610161040',NULL,NULL,'{\"userId\":6,\"packageId\":1}','2026-10-16 03:04:45.008292'),(86,NULL,NULL,'INVITATION_PUBLISHED','INVITATION',61,'Invitation published by owner',NULL,NULL,'{\"userId\":6}','2026-10-22 12:07:30.112079');
/*!40000 ALTER TABLE `system_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telegram_notifications`
--

DROP TABLE IF EXISTS `telegram_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telegram_notifications` (
  `telegram_notification_id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint NOT NULL,
  `chat_id` varchar(255) NOT NULL,
  `message_text` text NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `response_json` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`telegram_notification_id`),
  KEY `fk_telegram_payment` (`payment_id`),
  CONSTRAINT `fk_telegram_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment_transactions` (`payment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telegram_notifications`
--

LOCK TABLES `telegram_notifications` WRITE;
/*!40000 ALTER TABLE `telegram_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `telegram_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_event_types`
--

DROP TABLE IF EXISTS `template_event_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_event_types` (
  `template_id` bigint NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`template_id`,`event_type`),
  CONSTRAINT `fk_template_event_types_template` FOREIGN KEY (`template_id`) REFERENCES `templates` (`template_id`),
  CONSTRAINT `ck_template_event_types_type` CHECK ((`event_type` in (_utf8mb4'WEDDING',_utf8mb4'ENGAGEMENT',_utf8mb4'BIRTHDAY',_utf8mb4'ANNIVERSARY',_utf8mb4'CORPORATE',_utf8mb4'OTHER')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_event_types`
--

LOCK TABLES `template_event_types` WRITE;
/*!40000 ALTER TABLE `template_event_types` DISABLE KEYS */;
INSERT INTO `template_event_types` VALUES (4,'WEDDING'),(5,'WEDDING'),(12,'ANNIVERSARY'),(12,'BIRTHDAY'),(12,'CORPORATE'),(12,'ENGAGEMENT'),(12,'OTHER'),(12,'WEDDING'),(13,'WEDDING');
/*!40000 ALTER TABLE `template_event_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_languages`
--

DROP TABLE IF EXISTS `template_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_languages` (
  `template_id` bigint NOT NULL,
  `language_mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`template_id`,`language_mode`),
  CONSTRAINT `fk_template_languages_template` FOREIGN KEY (`template_id`) REFERENCES `templates` (`template_id`),
  CONSTRAINT `ck_template_languages_mode` CHECK ((`language_mode` in (_utf8mb4'KH',_utf8mb4'EN',_utf8mb4'BOTH')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_languages`
--

LOCK TABLES `template_languages` WRITE;
/*!40000 ALTER TABLE `template_languages` DISABLE KEYS */;
INSERT INTO `template_languages` VALUES (4,'BOTH'),(4,'EN'),(4,'KH'),(5,'BOTH'),(5,'EN'),(5,'KH'),(12,'BOTH'),(12,'EN'),(12,'KH'),(13,'BOTH'),(13,'EN'),(13,'KH');
/*!40000 ALTER TABLE `template_languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_orders`
--

DROP TABLE IF EXISTS `template_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) NOT NULL,
  `user_id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `payment_link` text NOT NULL,
  `payment_note` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `payment_provider` varchar(50) NOT NULL DEFAULT 'ABA_PAYWAY_STATIC',
  `confirm_source` varchar(100) DEFAULT NULL,
  `confirmed_by` varchar(100) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `raw_telegram_message` text,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `idx_template_orders_user_id` (`user_id`),
  KEY `idx_template_orders_status` (`status`),
  KEY `idx_template_orders_order_code` (`order_code`),
  KEY `idx_template_orders_template_id` (`template_id`),
  KEY `idx_template_orders_expires_at` (`expires_at`),
  CONSTRAINT `fk_template_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_orders`
--

LOCK TABLES `template_orders` WRITE;
/*!40000 ALTER TABLE `template_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `template_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_payment_orders`
--

DROP TABLE IF EXISTS `template_payment_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_payment_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `user_id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `status` varchar(50) NOT NULL,
  `provider` varchar(50) NOT NULL DEFAULT 'ABA_PAYWAY_DYNAMIC_QR_SANDBOX',
  `qr_string` text,
  `qr_image_url` text,
  `payway_request_json` text,
  `payway_response_json` text,
  `callback_raw_json` text,
  `payway_status` varchar(100) DEFAULT NULL,
  `payway_transaction_id` varchar(255) DEFAULT NULL,
  `payway_approval_code` varchar(100) DEFAULT NULL,
  `checkout_url` text,
  `payment_link` text,
  `payment_note` varchar(100) DEFAULT NULL,
  `confirm_source` varchar(100) DEFAULT NULL,
  `confirmed_by` varchar(100) DEFAULT NULL,
  `confirmed_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `raw_telegram_message` text,
  `telegram_chat_id` varchar(100) DEFAULT NULL,
  `telegram_message_id` varchar(100) DEFAULT NULL,
  `telegram_sender_username` varchar(100) DEFAULT NULL,
  `telegram_sender_id` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_template_payment_orders_user_id` (`user_id`),
  KEY `idx_template_payment_orders_status` (`status`),
  KEY `idx_template_payment_orders_order_code` (`order_code`),
  KEY `idx_template_payment_orders_transaction_id` (`transaction_id`),
  KEY `idx_template_payment_orders_template_id` (`template_id`),
  KEY `idx_template_payment_orders_expires_at` (`expires_at`),
  KEY `idx_template_payment_orders_static_match` (`status`,`provider`,`currency`,`amount`,`created_at`),
  CONSTRAINT `fk_template_payment_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_payment_orders`
--

LOCK TABLES `template_payment_orders` WRITE;
/*!40000 ALTER TABLE `template_payment_orders` DISABLE KEYS */;
INSERT INTO `template_payment_orders` VALUES (1,'QA50-001','qa-admin-reports-50-001',9,6,'QA Reports 50 | Traditional','QA template fixture',5.00,5.00,'USD','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-001-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-15 15:20:00.000000','2026-10-15 15:20:00.000000','2026-10-15 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000'),(2,'QA50-003','qa-admin-reports-50-003',11,7,'QA Reports 50 | Modern','QA template fixture',15.00,NULL,'USD','PENDING','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-13 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000'),(3,'QA50-005','qa-admin-reports-50-005',13,8,'QA Reports 50 | Minimalist','QA template fixture',30.00,NULL,'USD','FAILED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-11 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000'),(4,'QA50-007','qa-admin-reports-50-007',15,9,'QA Reports 50 | Floral','QA template fixture',20000.00,NULL,'KHR','EXPIRED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-09 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000'),(5,'QA50-009','qa-admin-reports-50-009',17,10,'QA Reports 50 | Luxury','QA template fixture',60000.00,60000.00,'KHR','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-009-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','BROWSER_CLAIM','QA_ADMIN_REPORTS_50','2026-10-07 15:20:00.000000','2026-10-07 15:20:00.000000','2026-10-07 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000'),(6,'QA50-011','qa-admin-reports-50-011',19,11,'QA Reports 50 | Other','QA template fixture',120000.00,120000.00,'KHR','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-011-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-05 15:20:00.000000','2026-10-05 15:20:00.000000','2026-10-05 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000'),(7,'QA50-013','qa-admin-reports-50-013',21,6,'QA Reports 50 | Traditional','QA template fixture',5.00,NULL,'USD','PENDING','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-03 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000'),(8,'QA50-015','qa-admin-reports-50-015',23,7,'QA Reports 50 | Modern','QA template fixture',15.00,NULL,'USD','FAILED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-01 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000'),(9,'QA50-017','qa-admin-reports-50-017',25,8,'QA Reports 50 | Minimalist','QA template fixture',30.00,NULL,'USD','EXPIRED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-29 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000'),(10,'QA50-019','qa-admin-reports-50-019',27,9,'QA Reports 50 | Floral','QA template fixture',20000.00,20000.00,'KHR','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-019-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','BROWSER_CLAIM','QA_ADMIN_REPORTS_50','2026-09-27 15:20:00.000000','2026-09-27 15:20:00.000000','2026-09-27 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000'),(11,'QA50-021','qa-admin-reports-50-021',29,10,'QA Reports 50 | Luxury','QA template fixture',60000.00,60000.00,'KHR','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-021-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-09-25 15:20:00.000000','2026-09-25 15:20:00.000000','2026-09-25 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000'),(12,'QA50-023','qa-admin-reports-50-023',31,11,'QA Reports 50 | Other','QA template fixture',120000.00,NULL,'KHR','PENDING','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-23 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-23 15:00:00.000000','2026-09-23 15:00:00.000000'),(13,'QA50-025','qa-admin-reports-50-025',33,6,'QA Reports 50 | Traditional','QA template fixture',5.00,NULL,'USD','FAILED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-21 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-21 15:00:00.000000','2026-09-21 15:00:00.000000'),(14,'QA50-027','qa-admin-reports-50-027',35,7,'QA Reports 50 | Modern','QA template fixture',15.00,NULL,'USD','EXPIRED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-19 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-19 15:00:00.000000','2026-09-19 15:00:00.000000'),(15,'QA50-029','qa-admin-reports-50-029',37,8,'QA Reports 50 | Minimalist','QA template fixture',30.00,30.00,'USD','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-029-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','BROWSER_CLAIM','QA_ADMIN_REPORTS_50','2026-10-15 15:20:00.000000','2026-10-15 15:20:00.000000','2026-10-15 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-15 15:00:00.000000','2026-10-15 15:00:00.000000'),(16,'QA50-031','qa-admin-reports-50-031',39,9,'QA Reports 50 | Floral','QA template fixture',20000.00,20000.00,'KHR','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-031-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-13 15:20:00.000000','2026-10-13 15:20:00.000000','2026-10-13 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-13 15:00:00.000000','2026-10-13 15:00:00.000000'),(17,'QA50-033','qa-admin-reports-50-033',41,10,'QA Reports 50 | Luxury','QA template fixture',60000.00,NULL,'KHR','PENDING','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-11 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-11 15:00:00.000000','2026-10-11 15:00:00.000000'),(18,'QA50-035','qa-admin-reports-50-035',43,11,'QA Reports 50 | Other','QA template fixture',120000.00,NULL,'KHR','FAILED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-09 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-09 15:00:00.000000','2026-10-09 15:00:00.000000'),(19,'QA50-037','qa-admin-reports-50-037',45,6,'QA Reports 50 | Traditional','QA template fixture',5.00,NULL,'USD','EXPIRED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-07 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-07 15:00:00.000000','2026-10-07 15:00:00.000000'),(20,'QA50-039','qa-admin-reports-50-039',47,7,'QA Reports 50 | Modern','QA template fixture',15.00,15.00,'USD','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-039-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','BROWSER_CLAIM','QA_ADMIN_REPORTS_50','2026-10-05 15:20:00.000000','2026-10-05 15:20:00.000000','2026-10-05 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-05 15:00:00.000000','2026-10-05 15:00:00.000000'),(21,'QA50-041','qa-admin-reports-50-041',49,8,'QA Reports 50 | Minimalist','QA template fixture',30.00,30.00,'USD','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-041-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','MANUAL_ADMIN','QA_ADMIN_REPORTS_50','2026-10-03 15:20:00.000000','2026-10-03 15:20:00.000000','2026-10-03 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-03 15:00:00.000000','2026-10-03 15:00:00.000000'),(22,'QA50-043','qa-admin-reports-50-043',51,9,'QA Reports 50 | Floral','QA template fixture',20000.00,NULL,'KHR','PENDING','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-10-01 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-10-01 15:00:00.000000','2026-10-01 15:00:00.000000'),(23,'QA50-045','qa-admin-reports-50-045',53,10,'QA Reports 50 | Luxury','QA template fixture',60000.00,NULL,'KHR','FAILED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-29 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-29 15:00:00.000000','2026-09-29 15:00:00.000000'),(24,'QA50-047','qa-admin-reports-50-047',55,11,'QA Reports 50 | Other','QA template fixture',120000.00,NULL,'KHR','EXPIRED','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.',NULL,NULL,NULL,NULL,'2026-09-27 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-27 15:00:00.000000','2026-09-27 15:00:00.000000'),(25,'QA50-049','qa-admin-reports-50-049',57,6,'QA Reports 50 | Traditional','QA template fixture',5.00,5.00,'USD','PAID','QA_REPORT_FIXTURE',NULL,NULL,NULL,NULL,NULL,NULL,'qa-admin-reports-50-049-synthetic',NULL,NULL,NULL,'QA Reports 50: fictional reporting data; no bank transfer or external evidence.','BROWSER_CLAIM','QA_ADMIN_REPORTS_50','2026-09-25 15:20:00.000000','2026-09-25 15:20:00.000000','2026-09-25 15:30:00.000000',NULL,NULL,NULL,NULL,NULL,'2026-09-25 15:00:00.000000','2026-09-25 15:00:00.000000');
/*!40000 ALTER TABLE `template_payment_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `template_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(120) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text,
  `thumbnail_url` varchar(1000) DEFAULT NULL,
  `preview_url` varchar(1000) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `primary_color` varchar(50) DEFAULT NULL,
  `secondary_color` varchar(50) DEFAULT NULL,
  `background_color` varchar(50) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `uk_templates_code` (`code`),
  KEY `idx_templates_status_sort` (`status`,`sort_order`,`created_at`),
  KEY `idx_templates_category` (`category`),
  KEY `idx_templates_premium` (`is_premium`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (2,'Garden Royal Khmer Wedding','garden-royal-khmer-wedding','TRADITIONAL','Elegant watercolor garden traditional Cambodian wedding template with soft blue and green floral aesthetics.','/facebook/all/03-card/cover-card.jpg','/templates/garden-royal-khmer-wedding',0.00,'USD',0,'ACTIVE','#8B9D83','#5A7156','#F4F7F2',1,'2026-09-15 19:30:57.751629','2026-09-21 16:18:22.207976'),(3,'Koupreng Demo Wedding','koupreng-demo-wedding','TRADITIONAL','Fictional bilingual Khmer wedding template for local API testing.',NULL,NULL,0.00,'USD',0,'ACTIVE','#f9af59','#B08E4F','#FFFDF7',100,'2026-09-15 13:35:46.184277','2026-09-15 13:35:46.184277'),(4,'Khmer Celestial','khmer-celestial','TRADITIONAL','{\"presetId\":\"KHMER_CELESTIAL\",\"theme\":\"KHMER_CELESTIAL\",\"openingStyle\":\"celestial-cover\",\"gateStyle\":\"celestial-cover\",\"openingVideoEnabled\":true,\"openingVideoUrl\":\"/invitations/khmer-celestial/burgundy-bokeh.mp4\",\"primaryColor\":\"#541722\",\"secondaryColor\":\"#B88A3A\",\"backgroundColor\":\"#F7F0E4\",\"coverImage\":\"/facebook/all/06-card/cover-card.jpg\",\"enabledSections\":{\"countdown\":true,\"story\":true,\"schedule\":true,\"map\":true,\"gallery\":true,\"party\":false,\"dressCode\":true,\"gift\":false,\"faq\":false,\"rsvp\":true,\"music\":true}}','/facebook/all/06-card/cover-card.jpg','/templates/khmer-celestial',0.00,'USD',0,'ACTIVE','#541722','#B88A3A','#F7F0E4',0,'2026-09-21 16:18:22.197565','2026-09-21 19:10:18.042900'),(5,'សូត្រមង្គល / Silk Heritage','silk-heritage','TRADITIONAL','{\"presetId\":\"SILK_HERITAGE\",\"theme\":\"SILK_HERITAGE\",\"gateStyle\":\"paper\",\"openingStyle\":\"paper\",\"primaryColor\":\"#672C39\",\"secondaryColor\":\"#B39460\",\"backgroundColor\":\"#F6F0E5\",\"coverImage\":\"/templates/silk-heritage/portrait.webp\",\"enabledSections\":{\"countdown\":true,\"story\":false,\"schedule\":true,\"map\":true,\"gallery\":true,\"dressCode\":false,\"gift\":false,\"faq\":false,\"rsvp\":true,\"music\":false}}','/templates/silk-heritage/preview.svg','/templates/silk-heritage',0.00,'USD',0,'ACTIVE',NULL,NULL,NULL,2,'2026-10-13 21:59:11.799854','2026-10-13 21:59:11.799854'),(6,'QA Reports 50 | Traditional','qa-admin-reports-50-template-1','TRADITIONAL','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,5.00,'USD',0,'INACTIVE',NULL,NULL,NULL,900,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(7,'QA Reports 50 | Modern','qa-admin-reports-50-template-2','MODERN','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,15.00,'USD',1,'INACTIVE',NULL,NULL,NULL,901,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(8,'QA Reports 50 | Minimalist','qa-admin-reports-50-template-3','MINIMALIST','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,30.00,'USD',0,'INACTIVE',NULL,NULL,NULL,902,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(9,'QA Reports 50 | Floral','qa-admin-reports-50-template-4','FLORAL','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,20000.00,'KHR',1,'INACTIVE',NULL,NULL,NULL,903,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(10,'QA Reports 50 | Luxury','qa-admin-reports-50-template-5','LUXURY','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,60000.00,'KHR',0,'INACTIVE',NULL,NULL,NULL,904,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(11,'QA Reports 50 | Other','qa-admin-reports-50-template-6','OTHER','Fictional admin-report fixture; unavailable in the public template catalog.',NULL,NULL,120000.00,'KHR',1,'INACTIVE',NULL,NULL,NULL,905,'2026-09-16 17:00:00.000000','2026-10-15 17:00:00.000000'),(12,'កម្មវិធីរបស់អ្នក / Event Essential','event-essential','MINIMALIST','Event-aware invitation for celebrations and business gatherings.','/templates/event-essential.svg','/templates/event-essential',0.00,'USD',0,'ACTIVE',NULL,NULL,NULL,20,'2026-10-20 16:16:10.550035','2026-10-20 16:16:10.550035'),(13,'Khmer Royal Lotus','khmer-royal-lotus','TRADITIONAL','{\"presetId\":\"KHMER_ROYAL_LOTUS\",\"theme\":\"KHMER_ROYAL_LOTUS\",\"openingStyle\":\"royal-lotus-envelope\",\"gateStyle\":\"royal-lotus-envelope\",\"primaryColor\":\"#6B1E2B\",\"secondaryColor\":\"#C8A45D\",\"backgroundColor\":\"#F5EEDF\",\"coverImage\":\"/facebook/all/01-card/cover-card.jpg\",\"fontKhmer\":\"Kantumruy Pro\",\"fontLatin\":\"Cormorant Garamond\",\"enabledSections\":{\"countdown\":true,\"story\":false,\"schedule\":true,\"map\":true,\"gallery\":true,\"party\":false,\"dressCode\":false,\"gift\":true,\"faq\":false,\"rsvp\":true,\"music\":true}}','/facebook/all/01-card/cover-card.jpg','/templates/khmer-royal-lotus',0.00,'USD',0,'ACTIVE','#6B1E2B','#C8A45D','#F5EEDF',2,'2026-10-22 19:08:48.379478','2026-10-22 19:08:48.379478');
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_external_identities`
--

DROP TABLE IF EXISTS `user_external_identities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_external_identities` (
  `identity_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` varchar(20) NOT NULL,
  `provider_subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`identity_id`),
  UNIQUE KEY `uk_external_provider_subject` (`provider`,`provider_subject`),
  UNIQUE KEY `uk_external_user_provider` (`user_id`,`provider`),
  CONSTRAINT `fk_external_identity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_external_identities`
--

LOCK TABLES `user_external_identities` WRITE;
/*!40000 ALTER TABLE `user_external_identities` DISABLE KEYS */;
INSERT INTO `user_external_identities` VALUES (1,8,'GOOGLE','110201200704709024866','2026-10-15 15:39:02.374842'),(2,6,'TELEGRAM','1544306082','2026-10-15 16:06:23.146982');
/*!40000 ALTER TABLE `user_external_identities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_template_access`
--

DROP TABLE IF EXISTS `user_template_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_template_access` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `access_type` varchar(50) NOT NULL DEFAULT 'PURCHASED',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `template_payment_order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_template_access_user_template_order` (`user_id`,`template_id`,`order_id`),
  KEY `idx_user_template_access_user_id` (`user_id`),
  KEY `idx_user_template_access_template_id` (`template_id`),
  KEY `fk_user_template_access_old_order` (`order_id`),
  KEY `idx_user_template_access_template_payment_order_id` (`template_payment_order_id`),
  CONSTRAINT `fk_user_template_access_old_order` FOREIGN KEY (`order_id`) REFERENCES `template_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_template_access_template_payment_order` FOREIGN KEY (`template_payment_order_id`) REFERENCES `template_payment_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_template_access_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_template_access`
--

LOCK TABLES `user_template_access` WRITE;
/*!40000 ALTER TABLE `user_template_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_template_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(100) DEFAULT NULL,
  `role` enum('ADMIN','USER','STAFF') NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `token_version` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` varchar(100) DEFAULT NULL,
  `last_modified_by` varchar(100) DEFAULT NULL,
  `profile_image` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Koupreng Demo User','demo@koupreng.local',NULL,'$2a$10$Vt1o.VQBNFNnbTlLRyg81O1Oo7/dLrxO4nknKciSUiBpQmVT2s3bS','USER','ACTIVE',0,'2026-09-15 13:35:46.092350','2026-09-15 13:35:46.092350',0,NULL,NULL,NULL),(2,'Koupreng Demo Administrator','admin.demo@koupreng.local',NULL,'$2a$10$WUNAQWDsG/udFwlndtDw5O4Qz7eqFKSqc0i10ROBg9yRe4T.b43xS','ADMIN','ACTIVE',2,'2026-09-15 13:35:46.179381','2026-10-15 15:38:02.721189',0,NULL,'2',NULL),(3,'Rathh Bruuu','rathhbruuu@gmail.com',NULL,NULL,'USER','ACTIVE',1,'2026-09-15 13:39:43.651573','2026-09-17 02:55:33.986649',0,NULL,NULL,NULL),(4,'Rath Zzz','rathzzz76@gmail.com',NULL,NULL,'USER','ACTIVE',0,'2026-09-17 01:22:15.118009','2026-09-17 01:22:15.118009',0,NULL,NULL,NULL),(5,'Koeurng Vireak','telegram-1544306082@telegram.local',NULL,NULL,'USER','ACTIVE',1,'2026-09-17 02:51:15.521229','2026-09-17 02:53:01.053545',0,NULL,NULL,NULL),(6,'Vireak',NULL,'060400652','$2a$10$eJfsNMav/k07DWSAShDoyeqHGRu6Zur74wVi6JVSXbhZToqjr4vXi','USER','ACTIVE',19,'2026-09-21 12:22:45.477889','2026-10-22 12:04:42.593849',0,'system','6',NULL),(7,'reak',NULL,'012345678','$2a$10$5AbtrvxNOf3eSaO/9bjaKeFvscwNTQmVOV5nZlkZiWUI5/6GyKaNi','USER','ACTIVE',1,'2026-10-15 08:18:46.593160','2026-10-15 08:19:18.545202',0,'system','7',NULL),(8,'Vireak Koeurng','vireakkoeurng080223@gmail.com',NULL,NULL,'USER','ACTIVE',2,'2026-10-15 15:39:02.343945','2026-10-16 03:22:09.637619',0,'system','8',NULL),(9,'QA Reports 50 | Dara Sok 001','qa-admin-reports-50-001@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-15 14:00:00.000000','2026-10-15 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(10,'QA Reports 50 | Sophea Lim 002','qa-admin-reports-50-002@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-14 14:00:00.000000','2026-10-14 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(11,'QA Reports 50 | Chan Vann 003','qa-admin-reports-50-003@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-13 14:00:00.000000','2026-10-13 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(12,'QA Reports 50 | Pisey Heng 004','qa-admin-reports-50-004@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-12 14:00:00.000000','2026-10-12 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(13,'QA Reports 50 | Sokha Chea 005','qa-admin-reports-50-005@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-10-11 14:00:00.000000','2026-10-11 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(14,'QA Reports 50 | Dara Sok 006','qa-admin-reports-50-006@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-10 14:00:00.000000','2026-10-10 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(15,'QA Reports 50 | Sophea Lim 007','qa-admin-reports-50-007@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-09 14:00:00.000000','2026-10-09 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(16,'QA Reports 50 | Chan Vann 008','qa-admin-reports-50-008@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-08 14:00:00.000000','2026-10-08 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(17,'QA Reports 50 | Pisey Heng 009','qa-admin-reports-50-009@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-07 14:00:00.000000','2026-10-07 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(18,'QA Reports 50 | Sokha Chea 010','qa-admin-reports-50-010@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-07 14:00:00.000000','2026-09-07 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(19,'QA Reports 50 | Dara Sok 011','qa-admin-reports-50-011@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-05 14:00:00.000000','2026-10-05 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(20,'QA Reports 50 | Sophea Lim 012','qa-admin-reports-50-012@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-04 14:00:00.000000','2026-10-04 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(21,'QA Reports 50 | Chan Vann 013','qa-admin-reports-50-013@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-03 14:00:00.000000','2026-10-03 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(22,'QA Reports 50 | Pisey Heng 014','qa-admin-reports-50-014@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-02 14:00:00.000000','2026-10-02 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(23,'QA Reports 50 | Sokha Chea 015','qa-admin-reports-50-015@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-10-01 14:00:00.000000','2026-10-01 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(24,'QA Reports 50 | Dara Sok 016','qa-admin-reports-50-016@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-30 14:00:00.000000','2026-09-30 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(25,'QA Reports 50 | Sophea Lim 017','qa-admin-reports-50-017@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-29 14:00:00.000000','2026-09-29 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(26,'QA Reports 50 | Chan Vann 018','qa-admin-reports-50-018@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-28 14:00:00.000000','2026-09-28 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(27,'QA Reports 50 | Pisey Heng 019','qa-admin-reports-50-019@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-27 14:00:00.000000','2026-09-27 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(28,'QA Reports 50 | Sokha Chea 020','qa-admin-reports-50-020@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-04 14:00:00.000000','2026-09-04 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(29,'QA Reports 50 | Dara Sok 021','qa-admin-reports-50-021@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-25 14:00:00.000000','2026-09-25 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(30,'QA Reports 50 | Sophea Lim 022','qa-admin-reports-50-022@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-24 14:00:00.000000','2026-09-24 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(31,'QA Reports 50 | Chan Vann 023','qa-admin-reports-50-023@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-23 14:00:00.000000','2026-09-23 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(32,'QA Reports 50 | Pisey Heng 024','qa-admin-reports-50-024@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-22 14:00:00.000000','2026-09-22 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(33,'QA Reports 50 | Sokha Chea 025','qa-admin-reports-50-025@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-21 14:00:00.000000','2026-09-21 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(34,'QA Reports 50 | Dara Sok 026','qa-admin-reports-50-026@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-20 14:00:00.000000','2026-09-20 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(35,'QA Reports 50 | Sophea Lim 027','qa-admin-reports-50-027@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-19 14:00:00.000000','2026-09-19 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(36,'QA Reports 50 | Chan Vann 028','qa-admin-reports-50-028@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-18 14:00:00.000000','2026-09-18 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(37,'QA Reports 50 | Pisey Heng 029','qa-admin-reports-50-029@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-15 14:00:00.000000','2026-10-15 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(38,'QA Reports 50 | Sokha Chea 030','qa-admin-reports-50-030@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-08 14:00:00.000000','2026-09-08 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(39,'QA Reports 50 | Dara Sok 031','qa-admin-reports-50-031@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-13 14:00:00.000000','2026-10-13 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(40,'QA Reports 50 | Sophea Lim 032','qa-admin-reports-50-032@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-12 14:00:00.000000','2026-10-12 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(41,'QA Reports 50 | Chan Vann 033','qa-admin-reports-50-033@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-11 14:00:00.000000','2026-10-11 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(42,'QA Reports 50 | Pisey Heng 034','qa-admin-reports-50-034@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-10 14:00:00.000000','2026-10-10 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(43,'QA Reports 50 | Sokha Chea 035','qa-admin-reports-50-035@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-10-09 14:00:00.000000','2026-10-09 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(44,'QA Reports 50 | Dara Sok 036','qa-admin-reports-50-036@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-08 14:00:00.000000','2026-10-08 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(45,'QA Reports 50 | Sophea Lim 037','qa-admin-reports-50-037@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-07 14:00:00.000000','2026-10-07 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(46,'QA Reports 50 | Chan Vann 038','qa-admin-reports-50-038@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-06 14:00:00.000000','2026-10-06 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(47,'QA Reports 50 | Pisey Heng 039','qa-admin-reports-50-039@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-05 14:00:00.000000','2026-10-05 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(48,'QA Reports 50 | Sokha Chea 040','qa-admin-reports-50-040@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-05 14:00:00.000000','2026-09-05 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(49,'QA Reports 50 | Dara Sok 041','qa-admin-reports-50-041@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-03 14:00:00.000000','2026-10-03 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(50,'QA Reports 50 | Sophea Lim 042','qa-admin-reports-50-042@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-02 14:00:00.000000','2026-10-02 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(51,'QA Reports 50 | Chan Vann 043','qa-admin-reports-50-043@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-10-01 14:00:00.000000','2026-10-01 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(52,'QA Reports 50 | Pisey Heng 044','qa-admin-reports-50-044@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-30 14:00:00.000000','2026-09-30 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(53,'QA Reports 50 | Sokha Chea 045','qa-admin-reports-50-045@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-29 14:00:00.000000','2026-09-29 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(54,'QA Reports 50 | Dara Sok 046','qa-admin-reports-50-046@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-28 14:00:00.000000','2026-09-28 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(55,'QA Reports 50 | Sophea Lim 047','qa-admin-reports-50-047@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-27 14:00:00.000000','2026-09-27 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(56,'QA Reports 50 | Chan Vann 048','qa-admin-reports-50-048@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-26 14:00:00.000000','2026-09-26 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(57,'QA Reports 50 | Pisey Heng 049','qa-admin-reports-50-049@example.invalid',NULL,NULL,'USER','ACTIVE',0,'2026-09-25 14:00:00.000000','2026-09-25 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL),(58,'QA Reports 50 | Sokha Chea 050','qa-admin-reports-50-050@example.invalid',NULL,NULL,'USER','DISABLED',0,'2026-09-09 14:00:00.000000','2026-09-09 15:00:00.000000',0,'QA_ADMIN_REPORTS_50','QA_ADMIN_REPORTS_50',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wedding_gifts`
--

DROP TABLE IF EXISTS `wedding_gifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wedding_gifts` (
  `gift_id` bigint NOT NULL AUTO_INCREMENT,
  `invitation_id` bigint NOT NULL,
  `guest_id` bigint DEFAULT NULL,
  `giver_name` varchar(255) NOT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `method` varchar(100) DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `note` text,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`gift_id`),
  KEY `idx_wedding_gifts_invitation_id` (`invitation_id`),
  KEY `idx_wedding_gifts_guest_id` (`guest_id`),
  CONSTRAINT `fk_wedding_gifts_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_wedding_gifts_invitation` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`invitation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wedding_gifts`
--

LOCK TABLES `wedding_gifts` WRITE;
/*!40000 ALTER TABLE `wedding_gifts` DISABLE KEYS */;
INSERT INTO `wedding_gifts` VALUES (1,1,NULL,'Vanna Keo',50.00,'CASH','2035-02-17','With best wishes','2026-09-15 13:35:46.256573','2026-09-15 13:35:46.256573','USD');
/*!40000 ALTER TABLE `wedding_gifts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 19:09:26

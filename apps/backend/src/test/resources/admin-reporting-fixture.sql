CREATE TABLE users(user_id BIGINT PRIMARY KEY,full_name VARCHAR(255),role VARCHAR(30),status VARCHAR(30),created_at TIMESTAMP,deleted BOOLEAN);
CREATE TABLE templates(template_id BIGINT PRIMARY KEY,name VARCHAR(255),category VARCHAR(80),is_premium BOOLEAN,status VARCHAR(30),created_at TIMESTAMP);
CREATE TABLE invitations(invitation_id BIGINT PRIMARY KEY,title VARCHAR(255),user_id BIGINT,template_id BIGINT,event_type VARCHAR(30),status VARCHAR(30),moderation_status VARCHAR(30),event_date DATE,event_time TIME,venue_name VARCHAR(255),created_at TIMESTAMP,published_at TIMESTAMP,deleted BOOLEAN);
CREATE TABLE guests(guest_id BIGINT PRIMARY KEY,invitation_id BIGINT,last_sent_at TIMESTAMP,invitation_viewed_at TIMESTAMP);
CREATE TABLE rsvps(rsvp_id BIGINT PRIMARY KEY,invitation_id BIGINT,guest_id BIGINT,response_status VARCHAR(30),responded_at TIMESTAMP);
CREATE TABLE guest_check_ins(check_in_id BIGINT PRIMARY KEY,invitation_id BIGINT,guest_id BIGINT,is_active BOOLEAN,checked_in_at TIMESTAMP);
CREATE TABLE packages(package_id BIGINT PRIMARY KEY,package_name VARCHAR(255));
CREATE TABLE template_payment_orders(id BIGINT PRIMARY KEY,order_code VARCHAR(80),payway_transaction_id VARCHAR(80),user_id BIGINT,template_id BIGINT,template_name VARCHAR(255),provider VARCHAR(40),status VARCHAR(40),amount DECIMAL(19,2),paid_amount DECIMAL(19,2),currency VARCHAR(3),created_at TIMESTAMP,paid_at TIMESTAMP,confirm_source VARCHAR(80),confirmed_at TIMESTAMP,confirmed_by VARCHAR(255));
CREATE TABLE subscriptions(subscription_id BIGINT PRIMARY KEY,user_id BIGINT,package_id BIGINT,order_code VARCHAR(80),payway_transaction_id VARCHAR(80),amount DECIMAL(19,2),paid_amount DECIMAL(19,2),currency VARCHAR(3),provider VARCHAR(40),payment_status VARCHAR(40),paid_at TIMESTAMP,confirm_source VARCHAR(80),confirmed_at TIMESTAMP,confirmed_by VARCHAR(255),status VARCHAR(40),is_active BOOLEAN,start_date TIMESTAMP,end_date TIMESTAMP,created_at TIMESTAMP);
CREATE TABLE system_audit_logs(log_id BIGINT PRIMARY KEY,actor_user_id BIGINT,action VARCHAR(80),resource_type VARCHAR(80),resource_id VARCHAR(80),created_at TIMESTAMP);
CREATE TABLE notifications(notification_id BIGINT PRIMARY KEY,created_at TIMESTAMP,status VARCHAR(40));
INSERT INTO users VALUES(1,'របាយការណ៍ សាកល្បង','ADMIN','ACTIVE','2026-10-14 17:00:00',false),(2,'Disabled fixture','USER','DISABLED','2026-10-15 00:00:00',false),(3,'Deleted fixture','USER','ACTIVE','2026-10-15 00:00:00',true);
INSERT INTO templates VALUES(1,'គំរូមង្គលការ','WEDDING',true,'ACTIVE','2026-01-01 00:00:00'),(2,'Free template','OTHER',false,'ACTIVE','2026-10-15 00:00:00');
INSERT INTO invitations VALUES
(1,'ពិធីមង្គលការ សាកល្បង',1,1,'WEDDING','PUBLISHED','ACTIVE','2026-10-15','09:00:00','ភ្នំពេញ','2026-10-14 17:00:00','2026-10-15 00:00:00',false),
(2,'Birthday 100%_fixture',1,2,'BIRTHDAY','DRAFT','HIDDEN','2026-10-16','09:00:00','Venue','2026-10-15 16:59:59',NULL,false),
(3,'Exclusive boundary',1,1,'CORPORATE','DRAFT','ACTIVE','2026-10-15','09:00:00','Venue','2026-10-15 17:00:00',NULL,false),
(4,'Before boundary',1,1,'ENGAGEMENT','ARCHIVED','ACTIVE','2026-10-14','09:00:00','Venue','2026-10-14 16:59:59',NULL,false),
(5,'Deleted',1,1,'ANNIVERSARY','DRAFT','ACTIVE','2026-10-15','09:00:00','Venue','2026-10-15 00:00:00',NULL,true),
(6,'Other event',1,2,'OTHER','DRAFT','ACTIVE','2026-10-15','09:00:00','Venue','2026-10-15 01:00:00',NULL,false);
INSERT INTO guests VALUES(1,1,'2026-10-15 01:00:00','2026-10-15 02:00:00'),(2,1,NULL,NULL),(3,2,NULL,NULL);
INSERT INTO rsvps VALUES(1,1,1,'ATTENDING','2026-10-15 01:00:00'),(2,1,1,'MAYBE','2026-10-15 02:00:00'),(3,1,3,'ATTENDING','2026-10-15 03:00:00'),(4,1,NULL,'ATTENDING','2026-10-15 04:00:00');
INSERT INTO guest_check_ins VALUES(1,1,1,true,'2026-10-15 00:00:00'),(2,1,1,true,'2026-10-15 00:00:00'),(3,1,2,false,'2026-10-15 00:00:00'),(4,1,3,true,'2026-10-15 00:00:00');
INSERT INTO packages VALUES(1,'Premium fixture');
INSERT INTO template_payment_orders VALUES
(1,'ORDER-1','REF-1',1,1,'គំរូមង្គលការ','ABA','PAID',10,10,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','ABA_PAYWAY_CALLBACK','2026-10-15 01:00:00','ADMIN:1'),
(2,'ORDER-2','REF-2',1,1,'Khmer','ABA','PAID',40000,40000,'KHR','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','private@example.test'),
(3,'ORDER-3',NULL,1,1,'Pending','ABA','PENDING',999,NULL,'USD','2026-10-15 00:00:00',NULL,NULL,NULL,NULL),
(4,'ORDER-4',NULL,1,1,'Failed','ABA','FAILED',99,NULL,'USD','2026-10-15 00:00:00',NULL,NULL,NULL,NULL),
(5,'ORDER-5','REF-5',1,1,'Claim','ABA','PAID',777,777,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','BROWSER_CLAIM','2026-10-15 01:00:00',NULL),
(6,'ORDER-6','REF-6',1,1,'Mismatch','ABA','PAID',50,49,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1'),
(7,'ORDER-7','DUPLICATE-REF',1,1,'Duplicate A','ABA','PAID',20,20,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1'),
(8,'ORDER-8','DUPLICATE-REF',1,1,'Duplicate B','ABA','PAID',20,20,'USD','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1'),
(9,'ORDER-9',NULL,1,1,'Missing date','ABA','PAID',30,30,'USD','2026-10-15 00:00:00',NULL,'MANUAL_ADMIN','2026-10-15 01:00:00','1'),
(10,'ORDER-10','REF-10',1,1,'Earlier creation','ABA','PAID',12,12,'USD','2026-09-01 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1'),
(11,'ORDER-11','REF-11',1,1,'Other currency','ABA','PAID',100,100,'EUR','2026-10-15 00:00:00','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1');
INSERT INTO subscriptions VALUES
(1,1,1,'SUB-1','SUB-REF-1',25,25,'USD','ABA','PAID','2026-10-15 01:00:00','MANUAL_ADMIN','2026-10-15 01:00:00','1','ACTIVE',true,'2026-10-01 00:00:00','2026-11-01 00:00:00','2026-10-15 00:00:00'),
(2,2,1,'SUB-2','SUB-REF-2',88,88,'USD','ABA','PAID','2026-10-15 01:00:00','TELEGRAM_ADMIN_DETECT','2026-10-15 01:00:00',NULL,'EXPIRED',true,'2026-09-01 00:00:00','2026-10-01 00:00:00','2026-10-15 00:00:00'),
(3,2,1,'SUB-3',NULL,45,NULL,'USD','ABA','PENDING',NULL,NULL,NULL,NULL,'PENDING_PAYMENT',false,NULL,NULL,'2026-10-15 00:00:00');
INSERT INTO system_audit_logs VALUES(1,1,'LOGIN','USER','1','2026-10-15 00:00:00');
INSERT INTO notifications VALUES(1,'2026-10-15 00:00:00','FAILED');
ALTER TABLE invitations ADD COLUMN slug VARCHAR(255) DEFAULT 'fixture-slug';
ALTER TABLE template_payment_orders ADD COLUMN package_name VARCHAR(255) DEFAULT 'Legacy package';

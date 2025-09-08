CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`permissions` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(500) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'student',
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`phone` text,
	`avatar` text,
	`last_login` timestamp,
	`is_active` boolean DEFAULT true,
	`is_approved` boolean DEFAULT false,
	`login_attempts` int DEFAULT 0,
	`locked_until` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roll_number` varchar(50) NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` varchar(255),
	`phone` text,
	`date_of_birth` date,
	`grade` text NOT NULL,
	`section` text,
	`admission_date` date NOT NULL,
	`parent_name` text,
	`parent_contact` text,
	`parent_email` text,
	`address` text,
	`status` text NOT NULL DEFAULT ('active'),
	`avatar` text,
	`blood_group` text,
	`medical_info` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_roll_number_unique` UNIQUE(`roll_number`),
	CONSTRAINT `students_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` varchar(50) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`phone` varchar(20),
	`date_of_birth` date,
	`hire_date` date NOT NULL,
	`department` varchar(100),
	`subject` varchar(100),
	`qualification` text,
	`experience` int,
	`salary` decimal(10,2),
	`address` text,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`avatar` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_employee_id_unique` UNIQUE(`employee_id`),
	CONSTRAINT `teachers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`subject` varchar(100) NOT NULL,
	`grade` varchar(20) NOT NULL,
	`section` varchar(20),
	`teacher_id` int,
	`due_date` date NOT NULL,
	`total_marks` int,
	`instructions` text,
	`attachments` text,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`grade` varchar(20) NOT NULL,
	`section` varchar(20),
	`subject` varchar(100) NOT NULL,
	`teacher_id` int,
	`room` varchar(50),
	`schedule` text,
	`max_students` int,
	`current_students` int DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`assignment_id` int,
	`subject` varchar(100) NOT NULL,
	`exam_type` varchar(50),
	`marks_obtained` decimal(5,2),
	`total_marks` decimal(5,2),
	`grade` varchar(10),
	`remarks` text,
	`graded_by` int,
	`graded_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grade` varchar(20) NOT NULL,
	`section` varchar(20),
	`day_of_week` varchar(20) NOT NULL,
	`period` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`teacher_id` int,
	`room` varchar(50),
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timetable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`teacher_id` int,
	`date` date NOT NULL,
	`status` varchar(20) NOT NULL,
	`remarks` text,
	`grade` varchar(20),
	`section` varchar(20),
	`subject` varchar(100),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`due_date` date,
	`paid_date` date,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`payment_method` varchar(50),
	`reference_number` varchar(100),
	`remarks` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`book_id` int NOT NULL,
	`student_id` int NOT NULL,
	`issue_date` date NOT NULL,
	`due_date` date NOT NULL,
	`return_date` date,
	`status` varchar(20) NOT NULL DEFAULT 'issued',
	`fine` decimal(8,2) DEFAULT '0',
	`remarks` text,
	`issued_by` int,
	`returned_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_issues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`author` varchar(200) NOT NULL,
	`isbn` varchar(50),
	`category` varchar(100),
	`publisher` varchar(100),
	`publication_year` int,
	`quantity` int NOT NULL DEFAULT 1,
	`available` int NOT NULL DEFAULT 1,
	`location` varchar(100),
	`description` text,
	`status` varchar(20) NOT NULL DEFAULT 'available',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_isbn_unique` UNIQUE(`isbn`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`target_audience` varchar(50) NOT NULL,
	`grade` varchar(20),
	`section` varchar(20),
	`publish_date` date NOT NULL,
	`expiry_date` date,
	`priority` varchar(20) NOT NULL DEFAULT 'normal',
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_by` int,
	`attachments` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`action` varchar(100) NOT NULL,
	`resource_type` varchar(100) NOT NULL,
	`resource_id` varchar(100),
	`old_values` text,
	`new_values` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`description` text,
	`is_encrypted` boolean DEFAULT false,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacher_id` int NOT NULL,
	`month` varchar(20) NOT NULL,
	`year` varchar(4) NOT NULL,
	`basic_salary` decimal(10,2) NOT NULL,
	`allowances` decimal(10,2) DEFAULT '0',
	`deductions` decimal(10,2) DEFAULT '0',
	`overtime` decimal(10,2) DEFAULT '0',
	`bonus` decimal(10,2) DEFAULT '0',
	`gross_salary` decimal(10,2) NOT NULL,
	`net_salary` decimal(10,2) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `payroll_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`student_id` int NOT NULL,
	`submission_id` int NOT NULL,
	`total_score` decimal(5,2) NOT NULL,
	`max_score` int NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`grade` varchar(5),
	`passed` boolean NOT NULL,
	`rank` int,
	`time_spent` int,
	`correct_answers` int,
	`total_questions` int,
	`analytics` json,
	`remarks` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_results_exam_id_student_id_unique` UNIQUE(`exam_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `exam_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`student_id` int NOT NULL,
	`attempt_number` int NOT NULL DEFAULT 1,
	`status` varchar(20) NOT NULL DEFAULT 'in_progress',
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`submitted_at` timestamp,
	`auto_submitted_at` timestamp,
	`total_score` decimal(5,2),
	`max_score` int,
	`percentage` decimal(5,2),
	`time_spent` int,
	`is_late_submission` boolean DEFAULT false,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `exam_submissions_exam_id_student_id_attempt_number_unique` UNIQUE(`exam_id`,`student_id`,`attempt_number`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`subject` varchar(100) NOT NULL,
	`class` varchar(50) NOT NULL,
	`teacher_id` int NOT NULL,
	`total_marks` int NOT NULL DEFAULT 0,
	`duration` int NOT NULL,
	`instructions` text,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`start_time` timestamp,
	`end_time` timestamp,
	`allow_late_submission` boolean DEFAULT false,
	`show_results_after_submission` boolean DEFAULT false,
	`shuffle_questions` boolean DEFAULT false,
	`max_attempts` int DEFAULT 1,
	`passing_marks` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` boolean DEFAULT false,
	`order_index` int NOT NULL DEFAULT 0,
	`explanation` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`question_text` text NOT NULL,
	`question_type` varchar(20) NOT NULL,
	`marks` int NOT NULL DEFAULT 1,
	`explanation` text,
	`order_index` int NOT NULL DEFAULT 0,
	`is_required` boolean DEFAULT true,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`question_id` int NOT NULL,
	`answer_text` text,
	`selected_option_id` int,
	`selected_options` json,
	`is_correct` boolean,
	`marks_awarded` decimal(5,2),
	`max_marks` int,
	`time_spent` int,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submission_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `submission_answers_submission_id_question_id_unique` UNIQUE(`submission_id`,`question_id`)
);
--> statement-breakpoint
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_assignment_id_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_graded_by_teachers_id_fk` FOREIGN KEY (`graded_by`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable` ADD CONSTRAINT `timetable_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_issues` ADD CONSTRAINT `book_issues_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_issues` ADD CONSTRAINT `book_issues_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_issues` ADD CONSTRAINT `book_issues_issued_by_teachers_id_fk` FOREIGN KEY (`issued_by`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_issues` ADD CONSTRAINT `book_issues_returned_by_teachers_id_fk` FOREIGN KEY (`returned_by`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `system_settings` ADD CONSTRAINT `system_settings_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payroll` ADD CONSTRAINT `payroll_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_results` ADD CONSTRAINT `exam_results_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_results` ADD CONSTRAINT `exam_results_submission_id_exam_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `exam_submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_submissions` ADD CONSTRAINT `exam_submissions_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_answers` ADD CONSTRAINT `submission_answers_submission_id_exam_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `exam_submissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_answers` ADD CONSTRAINT `submission_answers_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_answers` ADD CONSTRAINT `submission_answers_selected_option_id_question_options_id_fk` FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON DELETE no action ON UPDATE no action;
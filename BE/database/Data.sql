-- Roles
INSERT INTO Role (name) VALUES
('Admin'),
('Manager'),
('School Nurse'),
('Parent');
-- (bỏ 'Teacher')

-- Users
INSERT INTO Users (email, password, role_id, is_active, phone) VALUES
('admin@gmail.com', 'hashed_password1', (SELECT role_id FROM Role WHERE name = 'Admin'), 1, null),
('manager@gmail.com', 'hashed_password2', (SELECT role_id FROM Role WHERE name = 'Manager'), 1, '0987654321'),
('nurse1@gmail.com', 'hashed_password3', (SELECT role_id FROM Role WHERE name = 'School Nurse'), 1, '0911222333'),
('parent1@gmail.com', 'hashed_password4', (SELECT role_id FROM Role WHERE name = 'Parent'), 1, '0909888777');
-- (bỏ teacher user)

-- Infomation (Personal info for users who log in except teacher)
INSERT INTO Infomation (user_id, role_id, fullname, dayOfBirth, phone, email, gender, address, major) VALUES
((SELECT user_id FROM Users WHERE email = 'admin@gmail.com'), (SELECT role_id FROM Role WHERE name = 'Admin'),
 'Nguyen Van A', '1980-01-01', '0123456789', 'admin@gmail.com', 'Male', N'123 Main St, Hanoi', NULL),

((SELECT user_id FROM Users WHERE email = 'manager@gmail.com'), (SELECT role_id FROM Role WHERE name = 'Manager'),
 'Tran Thi B', '1975-05-15', '0987654321', 'manager@gmail.com', 'Female', N'456 Secondary St, Hanoi', NULL),

((SELECT user_id FROM Users WHERE email = 'nurse1@gmail.com'), (SELECT role_id FROM Role WHERE name = 'School Nurse'),
 'Le Van C', '1990-03-20', '0911222333', 'nurse1@gmail.com', 'Male', N'789 Health St, Hanoi', NULL),

((SELECT user_id FROM Users WHERE email = 'parent1@gmail.com'), (SELECT role_id FROM Role WHERE name = 'Parent'),
 'Pham Thi D', '1985-07-10', '0909888777', 'parent1@gmail.com', 'Female', N'321 Parent St, Hanoi', NULL);
-- (bỏ teacher infomation)
-- Class
INSERT INTO Class (class_name, number_of_student) VALUES
('10A1', 30),
('10A2', 25);



-- Student_Information
INSERT INTO Student_Information (student_code, full_name, gender, date_of_birth, class_name, parent_id, address) VALUES
('STU001', N'Nguyen Van D', 'Male', '2010-09-01', N'10A1', 4,  N'12 Student Lane, Hanoi'),
('STU002', N'Tran Thi E', 'Female', '2011-02-15', N'10A2', 2,  N'34 Student Lane, Hanoi'),
('STU003', N'Nguyen Van D', 'Male', '2010-11-21', N'10A1', 4,  N'12 Street, Hanoi'),
('STU004', N'Nguyen Thi B', 'Female', '2010-05-05', N'10A1', 3,  N'55A Neko Lane, Hanoi'),
('STU005', N'Nguyen Quynh Q', 'Female', '2010-02-28', N'10A1', 3,  N'189 Nguyen Duy, Hanoi'),
('STU006', N'Nguyen Duy T', 'Male', '2010-09-01', N'10A1', 2,  N'122 Study Lane, Hanoi');


-- (Bỏ Class_Assignment vì liên quan Teacher)

-- Incident_type
INSERT INTO Incident_type (name, description) VALUES
('Injury', 'Physical injury on school premises'),
('Allergic Reaction', 'Severe allergic reaction');

-- MedicalSupply
INSERT INTO MedicalSupply (name, type, unit, quantity, description, expired_date, is_active, nurse_id, usage_note) VALUES
('Paracetamol', 'Medication', 'Tablets', 100, 'Pain reliever', '2026-12-31', 1, (SELECT info_id FROM Infomation WHERE fullname = 'Le Van C'), 'Take as needed'),
('Bandage', 'Supply', 'Pieces', 200, 'For wound dressing', NULL, 1, (SELECT info_id FROM Infomation WHERE fullname = 'Le Van C'), 'Apply on wounds');

-- Vaccination_Campaign
INSERT INTO Vaccination_Campaign (title, description, scheduled_date, created_by, fee, approval_status) VALUES
('Flu Vaccination 2025', 'Annual flu vaccination campaign', '2025-10-01', (SELECT info_id FROM Infomation WHERE fullname = 'Le Van C'), 50, 'APPROVED');

-- MedicalCheckup_Schedule
INSERT INTO MedicalCheckup_Schedule (title, description, scheduled_date, created_by, fee, approval_status) VALUES
('Annual Checkup 2025', 'General health checkup for all students', '2025-11-01', (SELECT info_id FROM Infomation WHERE fullname = 'Le Van C'), 0, 'APPROVED');

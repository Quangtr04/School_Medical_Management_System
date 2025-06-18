-- Roles
INSERT INTO Role (name) VALUES
('Admin'),
('Manager'),
('School Nurse'),
('Parent');


INSERT INTO Users (email, password, fullname, dayOfBirth, phone, gender, address, major, role_id, is_active) VALUES
('admin@gmail.com', 'hashed_password1', N'Nguyen Van A', '1980-01-01', '0123456789', 'Male', N'123 Main St, Hanoi', NULL, (SELECT role_id FROM Role WHERE name = 'Admin'), 1),
('manager@gmail.com', 'hashed_password2', N'Tran Thi B', '1975-05-15', '0987654321', 'Female', N'456 Secondary St, Hanoi', NULL, (SELECT role_id FROM Role WHERE name = 'Manager'), 1),
('nurse1@gmail.com', 'hashed_password3', N'Le Van C', '1990-03-20', '0911222333', 'Male', N'789 Health St, Hanoi', NULL, (SELECT role_id FROM Role WHERE name = 'School Nurse'), 1),
('parent1@gmail.com', 'hashed_password4', N'Pham Thi D', '1985-07-10', '0909888777', 'Female', N'321 Parent St, Hanoi', NULL, (SELECT role_id FROM Role WHERE name = 'Parent'), 1);

-- Class
INSERT INTO Class (class_name, number_of_student) VALUES
('10A1', 30),
('10A2', 25);


INSERT INTO Student_Information (student_code, full_name, gender, date_of_birth, class_name, parent_id, address) VALUES
('STU001', N'Nguyen Van D', 'Male', '2010-09-01', '10A1', 4, N'12 Student Lane, Hanoi'),
('STU002', N'Tran Thi E', 'Female', '2011-02-15', '10A2', 2, N'34 Student Lane, Hanoi'),
('STU003', N'Nguyen Van D', 'Male', '2010-11-21', '10A1', 4, N'12 Street, Hanoi'),
('STU004', N'Nguyen Thi B', 'Female', '2010-05-05', '10A1', 3, N'55A Neko Lane, Hanoi'),
('STU005', N'Nguyen Quynh Q', 'Female', '2010-02-28', '10A1', 3, N'189 Nguyen Duy, Hanoi'),
('STU006', N'Nguyen Duy T', 'Male', '2010-09-01', '10A1', 2, N'122 Study Lane, Hanoi');


-- (Bỏ Class_Assignment vì liên quan Teacher)

-- Severity_Of_Incident 
INSERT INTO Severity_Of_Incident (serverity) VALUES
(N'Nhẹ'),            
(N'Vừa'),            
(N'Nặng'),           
(N'Nguy kịch');

--Medical Supply
INSERT INTO Medical_Supply (name, type, unit, quantity, description, expired_date, is_active, nurse_id, usage_note) VALUES
('Paracetamol', 'Medication', 'Tablets', 100, 'Pain reliever', '2026-12-31', 1, 3, 'Take as needed'),
('Bandage', 'Supply', 'Pieces', 200, 'For wound dressing', NULL, 1, 3, 'Apply on wounds');

-- Vaccination Campaign
INSERT INTO Vaccination_Campaign (title, description, scheduled_date, created_by, approved_by, approval_status, sponsor, class) VALUES
('Flu Vaccination 2025', 'Annual flu vaccination campaign', '2025-10-01', 3, 1, 'APPROVED', N'Ministry of Health', NULL);

-- MedicalCheckup_Schedule
INSERT INTO MedicalCheckup_Schedule (title, description, scheduled_date, created_by, approved_by, approval_status, sponsor, class) VALUES
('Annual Checkup 2025', 'General health checkup for all students', '2025-11-01', 3, 1, 'APPROVED', N'Department of Education', NULL);

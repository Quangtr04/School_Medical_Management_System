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

INSERT INTO Student_Health (
    student_id, height_cm, weight_kg, blood_type, allergy, chronic_disease,
    vision_left, vision_right, hearing_left, hearing_right, health_status,
    created_at, updated_at
) VALUES
(1, 145, 40, 'O', NULL, NULL, 1.0, 1.0, 'Normal', 'Normal', 'Healthy', GETDATE(), NULL),
(2, 140, 35, 'A', 'Peanuts', NULL, 0.9, 1.0, 'Normal', 'Normal', 'Allergy - Monitored', GETDATE(), NULL),
(3, 146, 42, 'B', NULL, 'Asthma', 0.8, 1.0, 'Normal', 'Slightly impaired', 'Asthma - Follow up needed', GETDATE(), NULL),
(4, 138, 32, 'AB', 'Dust', NULL, 1.0, 1.0, 'Normal', 'Normal', 'Healthy', GETDATE(), NULL),
(5, 142, 37, 'O', NULL, NULL, 0.9, 0.9, 'Normal', 'Normal', 'Mild myopia', GETDATE(), NULL),
(6, 144, 39, 'A', NULL, NULL, 1.0, 1.0, 'Normal', 'Normal', 'Healthy', GETDATE(), NULL);




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


-- Checkup_Consent_Form
INSERT INTO Checkup_Consent_Form (checkup_id, student_id, parent_id, status, submitted_at, note) VALUES
(1, 1, 2, 'APPROVED', GETDATE(), N'Confirmed for checkup'),
(1, 2, 3, 'APPROVED', GETDATE(), N'Available for checkup');

-- Checkup_Participation
INSERT INTO Checkup_Participation (checkup_id, student_id, consent_form_id, checked_at, height_cm, weight_kg,
vision_left, vision_right, hearing_left, hearing_right, blood_pressure, notes, abnormal_signs, needs_counseling, note) VALUES
(1, 1, 1, GETDATE(), 145, 38, 1.0, 1.0, 'Normal', 'Normal', '110/70', N'All normal', NULL, 0, NULL),
(1, 2, 2, GETDATE(), 142, 36, 0.9, 1.0, 'Normal', 'Normal', '105/68', N'Slight myopia', N'Vision check recommended', 1, N'Follow-up needed');

-- Incident_Medication_Log
INSERT INTO Incident_Medication_Log (event_id, supply_id, quantity_used) VALUES
(1, 1, 2),
(1, 2, 1);

-- Medical_Incident
INSERT INTO Medical_Incident (serverity_id, subject_info_id, student_id, description, occurred_at, reported_at, nurse_id, status, resolution_notes, resolved_at) VALUES
(1, 2, 1, N'Student fainted during PE class', GETDATE(), GETDATE(), 4, 'RESOLVED', N'Hydration and rest advised', GETDATE()),
(2, 3, 2, N'Allergic reaction to unknown substance', GETDATE(), GETDATE(), 4, 'MONITORING', N'Antihistamines given, monitor for 24h', NULL);

-- Medication_Submisstion_Request
INSERT INTO Medication_Submisstion_Request (parent_id, student_id, status, created_at, nurse_id, note, image_url, start_date, end_date) VALUES
(2, 1, 'APPROVED', GETDATE(), 4, N'Paracetamol for fever', NULL, GETDATE(), DATEADD(day, 3, GETDATE())),
(3, 2, 'PENDING', GETDATE(), 4, N'Cough syrup', NULL, GETDATE(), DATEADD(day, 2, GETDATE()));

-- Vaccination_Consent_Form
INSERT INTO Vaccination_Consent_Form (campaign_id, student_id, parent_id, status, submitted_at, note) VALUES
(1, 1, 2, 'APPROVED', GETDATE(), N'Consent given'),
(1, 2, 3, 'APPROVED', GETDATE(), N'Consent approved');

-- Vaccination_Result
INSERT INTO Vaccination_Result (campaign_id, student_id, consent_form_id, vaccinated_at, vaccine_name, dose_number, reaction, follow_up_required, note) VALUES
(1, 1, 1, GETDATE(), 'MMR', 1, NULL, 0, N'No issues observed'),
(1, 2, 2, GETDATE(), 'MMR', 1, 'Slight fever', 1, N'Monitor for 2 days');

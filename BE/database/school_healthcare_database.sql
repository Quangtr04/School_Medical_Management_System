CREATE TABLE Role (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname NVARCHAR(255) NOT NULL,
    dayOfBirth DATE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    major NVARCHAR(255),
    role_id INT NOT NULL FOREIGN KEY REFERENCES Role(role_id),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Class (
    class_name VARCHAR(50) PRIMARY KEY,
    number_of_student INT
);

CREATE TABLE Student_Information (
    student_id INT PRIMARY KEY IDENTITY(1,1),
    student_code VARCHAR(20),
    full_name NVARCHAR(100) NOT NULL,
    gender NVARCHAR(10),
    date_of_birth DATE,
    class_name VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Class(class_name),
    address NVARCHAR(200),
    parent_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Medication_Submisstion_Request (
    id_req INT PRIMARY KEY IDENTITY(1,1),
    parent_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    status VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    nurse_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    note NVARCHAR(MAX),
    image_url VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE Medication_Daily_Log (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    id_req INT NOT NULL FOREIGN KEY REFERENCES Medication_Submisstion_Request(id_req),
    nurse_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    note NVARCHAR(MAX),
    updated_at DATETIME DEFAULT GETDATE(),
    image_url VARCHAR(255),
);

CREATE TABLE Student_Health (
    record_id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    height_cm INT,
    weight_kg INT,
    blood_type VARCHAR(10),
    allergy TEXT,
    chronic_disease TEXT,
    vision_left FLOAT,
    vision_right FLOAT,
    hearing_left VARCHAR(50),
    hearing_right VARCHAR(50),
    health_status VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE Severity_Of_Incident (
    serverity_id INT PRIMARY KEY IDENTITY(1,1),
    serverity NVARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Medical_Incident (
    event_id INT PRIMARY KEY IDENTITY(1,1),
    serverity_id INT NOT NULL FOREIGN KEY REFERENCES Severity_Of_Incident(serverity_id),
    subject_info_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    description NVARCHAR(MAX),
    occurred_at DATETIME NOT NULL,
    reported_at DATETIME DEFAULT GETDATE(),
    nurse_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    status VARCHAR(50) NOT NULL,
    resolution_notes TEXT,
    resolved_at DATETIME
);

CREATE TABLE Medical_Supply (
    supply_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX),
    expired_date DATE,
    is_active BIT DEFAULT 1,
    nurse_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    usage_note NVARCHAR(MAX)
);

CREATE TABLE Incident_Medication_Log (
    incident_usage_id INT PRIMARY KEY IDENTITY(1,1),
    event_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Incident(event_id),
    supply_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Supply(supply_id),
    quantity_used INT NOT NULL
);

CREATE TABLE Vaccination_Campaign (
    campaign_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    scheduled_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    approved_by NVARCHAR(255) NULL ,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sponsor NVARCHAR(255) NOT NULL,
    class INT
);

CREATE TABLE Vaccination_Consent_Form (
    form_id INT PRIMARY KEY IDENTITY(1,1),
    campaign_id INT NOT NULL FOREIGN KEY REFERENCES Vaccination_Campaign(campaign_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    parent_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    status VARCHAR(50) NOT NULL,
    submitted_at DATETIME,
    note NVARCHAR(MAX)
);

CREATE TABLE Vaccination_Result (
    id INT PRIMARY KEY IDENTITY(1,1),
    campaign_id INT NOT NULL FOREIGN KEY REFERENCES Vaccination_Campaign(campaign_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    consent_form_id INT NOT NULL FOREIGN KEY REFERENCES Vaccination_Consent_Form(form_id),
    vaccinated_at DATETIME,
    vaccine_name NVARCHAR(255),
    dose_number INT,
    reaction NVARCHAR(MAX),
    follow_up_required BIT DEFAULT 0,
    note NVARCHAR(MAX)
);

CREATE TABLE Medical_Checkup_Schedule (
    checkup_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    scheduled_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    approved_by NVARCHAR(255) NULL,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sponsor NVARCHAR(255) NOT NULL,
    class INT
);

CREATE TABLE Checkup_Consent_Form (
    form_id INT PRIMARY KEY IDENTITY(1,1),
    checkup_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Checkup_Schedule(checkup_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    parent_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    status VARCHAR(50) NOT NULL,
    submitted_at DATETIME,
    note NVARCHAR(MAX)
);

CREATE TABLE Checkup_Participation (
    id INT PRIMARY KEY IDENTITY(1,1),
    checkup_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Checkup_Schedule(checkup_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    consent_form_id INT NOT NULL FOREIGN KEY REFERENCES Checkup_Consent_Form(form_id),
    checked_at DATETIME,
    height_cm INT,
    weight_kg INT,
    vision_left FLOAT,
    vision_right FLOAT,
    hearing_left VARCHAR(50),
    hearing_right VARCHAR(50),
    blood_pressure VARCHAR(50),
    notes NVARCHAR(MAX),
    abnormal_signs NVARCHAR(MAX),
    needs_counseling BIT DEFAULT 0
);

CREATE TABLE Notification (
  notification_id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  receiver_id INT NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  is_read BIT DEFAULT 0,
  CONSTRAINT FK_Notification_User FOREIGN KEY (receiver_id)
    REFERENCES Users(user_id)
    ON DELETE CASCADE -- (Tùy chọn: khi xóa user thì xóa luôn thông báo)
);

CREATE TABLE UserRequest (
  req_id INT IDENTITY(1,1) PRIMARY KEY,
  fullname NVARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  title NVARCHAR(255) NOT NULL,
  req_type VARCHAR(20) NOT NULL, 
  text NVARCHAR(MAX) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  status VARCHAR(20) DEFAULT 'PENDING', 
  target_role_id INT NOT NULL,

  FOREIGN KEY (target_role_id) REFERENCES Role(role_id)
);

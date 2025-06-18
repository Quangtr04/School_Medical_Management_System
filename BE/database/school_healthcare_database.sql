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
    note TEXT,
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
    note TEXT,
    updated_at DATETIME DEFAULT GETDATE()
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
    description TEXT,
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
    description TEXT,
    expired_date DATE,
    is_active BIT DEFAULT 1,
    nurse_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    usage_note TEXT
);

CREATE TABLE Incident_Medication_Log (
    incident_usage_id INT PRIMARY KEY IDENTITY(1,1),
    event_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Incident(event_id),
    supply_id INT NOT NULL FOREIGN KEY REFERENCES Medical_Supply(supply_id),
    quantity_used INT NOT NULL
);

CREATE TABLE Vaccination_Campaign (
    campaign_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    description TEXT,
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
    note TEXT
);

CREATE TABLE Vaccination_Result (
    id INT PRIMARY KEY IDENTITY(1,1),
    campaign_id INT NOT NULL FOREIGN KEY REFERENCES Vaccination_Campaign(campaign_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    consent_form_id INT NOT NULL FOREIGN KEY REFERENCES Vaccination_Consent_Form(form_id),
    vaccinated_at DATETIME,
    vaccine_name VARCHAR(255),
    dose_number INT,
    reaction TEXT,
    follow_up_required BIT DEFAULT 0,
    note TEXT
);

CREATE TABLE Medical_Checkup_Schedule (
    checkup_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    description TEXT,
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
    checkup_id INT NOT NULL FOREIGN KEY REFERENCES MedicalCheckup_Schedule(checkup_id),
    student_id INT NOT NULL FOREIGN KEY REFERENCES Student_Information(student_id),
    parent_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    status VARCHAR(50) NOT NULL,
    submitted_at DATETIME,
    note TEXT
);

CREATE TABLE Checkup_Participation (
    id INT PRIMARY KEY IDENTITY(1,1),
    checkup_id INT NOT NULL FOREIGN KEY REFERENCES MedicalCheckup_Schedule(checkup_id),
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
    notes TEXT,
    abnormal_signs TEXT,
    needs_counseling BIT DEFAULT 0,
    note TEXT
);

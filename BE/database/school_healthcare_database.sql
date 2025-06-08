-- Roles and Users
CREATE TABLE Role (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
	phone varchar(50),
    role_id INT NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Role FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Personal Info (Only for users who log in: Parent, Teacher, Nurse, Admin)
CREATE TABLE Infomation (
    info_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    fullname NVARCHAR(255) NOT NULL,
    dayOfBirth DATE NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    gender NVARCHAR(10) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    major NVARCHAR(255) NULL,
    CONSTRAINT FK_Infomation_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Infomation_Role FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Class and Assignment
CREATE TABLE Class (
    class_name NVARCHAR(50) PRIMARY KEY,
    number_of_student INT NULL
);

-- Student Information (tách riêng, không cần tài khoản)
CREATE TABLE Student_Information (
    student_info_id INT IDENTITY(1,1) PRIMARY KEY,
    student_code NVARCHAR(20) UNIQUE NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    gender NVARCHAR(10) NULL,
    date_of_birth DATE NULL,
    class_name NVARCHAR(50) NULL,
    parent_id INT NOT NULL,
    address NVARCHAR(200) NULL,
    created_at DATETIME DEFAULT GETDATE(),
	CONSTRAINT FK_Student_Information_Users FOREIGN KEY (parent_id) REFERENCES Users(user_id),
	CONSTRAINT FK_Student_Information_Class FOREIGN KEY (class_name) REFERENCES Class(class_name)


);




-- Medication Request
CREATE TABLE Medication_Submisstion_Request (
    id_req INT IDENTITY(1,1) PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_MedicationRequest_Parent FOREIGN KEY (parent_id) REFERENCES Infomation(info_id),
    CONSTRAINT FK_MedicationRequest_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id)
);

CREATE TABLE Handling_Medicine (
    id_handling INT IDENTITY(1,1) PRIMARY KEY,
    nurse_id INT NOT NULL,
    id_req INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    handled_at DATETIME NULL,
    CONSTRAINT FK_HandlingMedicine_Nurse FOREIGN KEY (nurse_id) REFERENCES Infomation(info_id),
    CONSTRAINT FK_HandlingMedicine_Request FOREIGN KEY (id_req) REFERENCES Medication_Submisstion_Request(id_req)
);

-- Student Health Record
CREATE TABLE Student_Health (
    record_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    height_cm INT NULL,
    weight_kg INT NULL,
    blood_type NVARCHAR(10) NULL,
    allergy NVARCHAR(MAX) NULL,
    chronic_disease NVARCHAR(MAX) NULL,
    vision_left FLOAT NULL,
    vision_right FLOAT NULL,
    hearing_left NVARCHAR(50) NULL,
    hearing_right NVARCHAR(50) NULL,
    health_status NVARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    CONSTRAINT FK_StudentHealth_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id)
);

-- Medical Incident
CREATE TABLE Incident_type (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL
);

CREATE TABLE Medical_incident (
    event_id INT IDENTITY(1,1) PRIMARY KEY,
    type_id INT NOT NULL,
    subject_info_id INT NULL,
    number_of_students INT NOT NULL,
    description NVARCHAR(MAX) NULL,
    occurred_at DATETIME NOT NULL,
    reported_at DATETIME DEFAULT GETDATE(),
    nurse_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    resolution_notes NVARCHAR(MAX) NULL,
    resolved_at DATETIME NULL,
    CONSTRAINT FK_MedicalIncident_Type FOREIGN KEY (type_id) REFERENCES Incident_type(type_id),
    CONSTRAINT FK_MedicalIncident_StudentInfo FOREIGN KEY (subject_info_id) REFERENCES Student_Information(student_info_id),
    CONSTRAINT FK_MedicalIncident_Nurse FOREIGN KEY (nurse_id) REFERENCES Infomation(info_id)
);

-- Medical Supplies
CREATE TABLE MedicalSupply (
    supply_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    type NVARCHAR(50) NOT NULL,
    unit NVARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    expired_date DATE NULL,
    is_active BIT DEFAULT 1,
    nurse_id INT NOT NULL,
    usage_note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_MedicalSupply_Nurse FOREIGN KEY (nurse_id) REFERENCES Infomation(info_id)
);

-- Vaccination Campaign
CREATE TABLE Vaccination_Campaign (
    campaign_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    scheduled_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT NOT NULL,
    fee FLOAT NOT NULL,
    approved_by INT NULL,
    approval_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT FK_VaccinationCampaign_CreatedBy FOREIGN KEY (created_by) REFERENCES Infomation(info_id),
    CONSTRAINT FK_VaccinationCampaign_ApprovedBy FOREIGN KEY (approved_by) REFERENCES Infomation(info_id)
);

CREATE TABLE Vaccination_Consent_Form (
    form_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    status_fee NVARCHAR(50) NOT NULL,
    submitted_at DATETIME NULL,
    note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_VaccConsentForm_Campaign FOREIGN KEY (campaign_id) REFERENCES Vaccination_Campaign(campaign_id),
    CONSTRAINT FK_VaccConsentForm_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id),
    CONSTRAINT FK_VaccConsentForm_Parent FOREIGN KEY (parent_id) REFERENCES Infomation(info_id)
);

CREATE TABLE Vaccination_Participation (
    id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    student_id INT NOT NULL,
    consent_form_id INT NOT NULL,
    is_present BIT DEFAULT 0,
    note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_VaccParticipation_Campaign FOREIGN KEY (campaign_id) REFERENCES Vaccination_Campaign(campaign_id),
    CONSTRAINT FK_VaccParticipation_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id),
    CONSTRAINT FK_VaccParticipation_ConsentForm FOREIGN KEY (consent_form_id) REFERENCES Vaccination_Consent_Form(form_id)
);

CREATE TABLE Vaccination_Result (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT NOT NULL,
    student_id INT NOT NULL,
    vaccinated_at DATETIME NULL,
    vaccine_name NVARCHAR(255) NOT NULL,
    dose_number INT NULL,
    reaction NVARCHAR(MAX) NULL,
    follow_up_required BIT DEFAULT 0,
    notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_VaccResult_Campaign FOREIGN KEY (campaign_id) REFERENCES Vaccination_Campaign(campaign_id),
    CONSTRAINT FK_VaccResult_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id)
);

-- Medical Checkups
CREATE TABLE MedicalCheckup_Schedule (
    checkup_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    scheduled_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT NOT NULL,
    fee FLOAT NOT NULL,
    approved_by INT NULL,
    approval_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT FK_CheckupSchedule_CreatedBy FOREIGN KEY (created_by) REFERENCES Infomation(info_id),
    CONSTRAINT FK_CheckupSchedule_ApprovedBy FOREIGN KEY (approved_by) REFERENCES Infomation(info_id)
);

CREATE TABLE Checkup_Consent_Form (
    form_id INT IDENTITY(1,1) PRIMARY KEY,
    checkup_id INT NOT NULL,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL,
    status_fee NVARCHAR(50) NOT NULL,
    submitted_at DATETIME NULL,
    note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_CheckupConsentForm_Checkup FOREIGN KEY (checkup_id) REFERENCES MedicalCheckup_Schedule(checkup_id),
    CONSTRAINT FK_CheckupConsentForm_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id),
    CONSTRAINT FK_CheckupConsentForm_Parent FOREIGN KEY (parent_id) REFERENCES Infomation(info_id)
);

CREATE TABLE Checkup_Participation (
    id INT IDENTITY(1,1) PRIMARY KEY,
    checkup_id INT NOT NULL,
    student_id INT NOT NULL,
    consent_form_id INT NOT NULL,
    is_present BIT DEFAULT 0,
    note NVARCHAR(MAX) NULL,
    CONSTRAINT FK_CheckupParticipation_Checkup FOREIGN KEY (checkup_id) REFERENCES MedicalCheckup_Schedule(checkup_id),
    CONSTRAINT FK_CheckupParticipation_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id),
    CONSTRAINT FK_CheckupParticipation_ConsentForm FOREIGN KEY (consent_form_id) REFERENCES Checkup_Consent_Form(form_id)
);

CREATE TABLE Checkup_Result (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    checkup_id INT NOT NULL,
    student_id INT NOT NULL,
    checked_at DATETIME NULL,
    height_cm INT NULL,
    weight_kg INT NULL,
    vision_left FLOAT NULL,
    vision_right FLOAT NULL,
    hearing_left NVARCHAR(50) NULL,
    hearing_right NVARCHAR(50) NULL,
    blood_pressure NVARCHAR(50) NULL,
    notes NVARCHAR(MAX) NULL,
    abnormal_signs NVARCHAR(MAX) NULL,
    needs_counseling BIT DEFAULT 0,
    CONSTRAINT FK_CheckupResult_Checkup FOREIGN KEY (checkup_id) REFERENCES MedicalCheckup_Schedule(checkup_id),
    CONSTRAINT FK_CheckupResult_Student FOREIGN KEY (student_id) REFERENCES Student_Information(student_info_id)
);

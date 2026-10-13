-- ============================================================
-- Insurance Fraud & Risk Intelligence Platform
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS insurance_fraud_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE insurance_fraud_db;

-- ============================================================
-- TABLE 1: policyholders
-- ============================================================
CREATE TABLE policyholders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    policy_number   INT UNIQUE NOT NULL,
    sex             ENUM('Male', 'Female') DEFAULT 'Male',
    age             INT,
    marital_status  ENUM('Single', 'Married', 'Widow', 'Divorced') DEFAULT 'Single',
    age_of_holder   VARCHAR(20),
    agent_type      ENUM('Internal', 'External') DEFAULT 'External',
    rep_number      INT,
    driver_rating   INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: vehicles
-- ============================================================
CREATE TABLE vehicles (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    policy_number       INT NOT NULL,
    make                VARCHAR(50),
    vehicle_category    VARCHAR(30),
    vehicle_price       VARCHAR(30),
    age_of_vehicle      VARCHAR(20),
    year                INT,
    number_of_cars      VARCHAR(20),
    FOREIGN KEY (policy_number) REFERENCES policyholders(policy_number)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 3: policies
-- ============================================================
CREATE TABLE policies (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    policy_number   INT UNIQUE NOT NULL,
    policy_type     VARCHAR(50),
    base_policy     ENUM('Liability', 'Collision', 'All Perils') DEFAULT 'Liability',
    deductible      INT,
    FOREIGN KEY (policy_number) REFERENCES policyholders(policy_number)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 4: claims
-- ============================================================
CREATE TABLE claims (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    claim_index             INT UNIQUE NOT NULL,
    policy_number           INT,
    month                   VARCHAR(10),
    week_of_month           INT,
    day_of_week             VARCHAR(15),
    month_claimed           VARCHAR(10),
    week_of_month_claimed   INT,
    day_of_week_claimed     VARCHAR(15),
    accident_area           ENUM('Urban', 'Rural') DEFAULT 'Urban',
    fault                   ENUM('Policy Holder', 'Third Party') DEFAULT 'Policy Holder',
    days_policy_accident    VARCHAR(20),
    days_policy_claim       VARCHAR(20),
    past_number_of_claims   VARCHAR(20),
    police_report_filed     ENUM('Yes', 'No') DEFAULT 'No',
    witness_present         ENUM('Yes', 'No') DEFAULT 'No',
    number_of_suppliments   VARCHAR(20),
    address_change_claim    VARCHAR(30),
    status                  ENUM('Open', 'Under Review', 'Closed') DEFAULT 'Open',
    filed_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_number) REFERENCES policyholders(policy_number)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 5: fraud_predictions
-- ============================================================
CREATE TABLE fraud_predictions (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    claim_index         INT UNIQUE NOT NULL,
    fraud_probability   DECIMAL(6,5) NOT NULL,
    risk_score          DECIMAL(5,2) NOT NULL,
    risk_level          ENUM('Low', 'Medium', 'High') NOT NULL,
    predicted_fraud     TINYINT(1) NOT NULL,
    actual_fraud        TINYINT(1),
    model_version       VARCHAR(20) DEFAULT 'v1.0.0',
    model_name          VARCHAR(100),
    threshold_used      DECIMAL(4,3) DEFAULT 0.330,
    predicted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_index) REFERENCES claims(claim_index)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 6: investigations
-- ============================================================
CREATE TABLE investigations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    claim_index     INT NOT NULL,
    assigned_to     VARCHAR(100),
    priority        ENUM('Critical', 'High', 'Medium', 'Low') DEFAULT 'Medium',
    status          ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
    notes           TEXT,
    opened_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at     TIMESTAMP NULL,
    FOREIGN KEY (claim_index) REFERENCES claims(claim_index)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 7: model_metadata
-- ============================================================
CREATE TABLE model_metadata (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    model_name              VARCHAR(100) NOT NULL,
    model_version           VARCHAR(20)  NOT NULL,
    operational_threshold   DECIMAL(4,3),
    roc_auc                 DECIMAL(6,4),
    pr_auc                  DECIMAL(6,4),
    precision_at_threshold  DECIMAL(6,4),
    recall_at_threshold     DECIMAL(6,4),
    f1_score                DECIMAL(6,4),
    brier_score_before      DECIMAL(6,4),
    brier_score_after       DECIMAL(6,4),
    risk_band_low_max       DECIMAL(4,3) DEFAULT 0.300,
    risk_band_medium_max    DECIMAL(4,3) DEFAULT 0.600,
    deployed_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED: model_metadata
-- ============================================================
INSERT INTO model_metadata (
    model_name, model_version, operational_threshold,
    roc_auc, pr_auc, precision_at_threshold,
    recall_at_threshold, f1_score,
    brier_score_before, brier_score_after
) VALUES (
    'Random Forest with Isotonic Calibration',
    'v1.0.0', 0.330,
    0.8530, 0.2710, 0.7500,
    0.0320, 0.0615,
    0.0630, 0.0500
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_claims_policy         ON claims(policy_number);
CREATE INDEX idx_claims_status         ON claims(status);
CREATE INDEX idx_predictions_risk      ON fraud_predictions(risk_level);
CREATE INDEX idx_predictions_prob      ON fraud_predictions(fraud_probability);
CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_claim  ON investigations(claim_index);

-- ============================================================
-- VIEW: full claim summary
-- ============================================================
CREATE VIEW v_claim_summary AS
SELECT
    c.claim_index,
    c.policy_number,
    ph.sex,
    ph.age,
    ph.marital_status,
    c.accident_area,
    c.fault,
    c.police_report_filed,
    c.witness_present,
    c.past_number_of_claims,
    c.days_policy_accident,
    p.base_policy,
    p.deductible,
    v.make,
    v.vehicle_category,
    v.vehicle_price,
    fp.fraud_probability,
    fp.risk_score,
    fp.risk_level,
    fp.predicted_fraud,
    fp.actual_fraud,
    inv.status   AS investigation_status,
    inv.priority AS investigation_priority
FROM claims c
LEFT JOIN policyholders  ph  ON c.policy_number = ph.policy_number
LEFT JOIN policies       p   ON c.policy_number = p.policy_number
LEFT JOIN vehicles       v   ON c.policy_number = v.policy_number
LEFT JOIN fraud_predictions fp ON c.claim_index = fp.claim_index
LEFT JOIN investigations  inv  ON c.claim_index = inv.claim_index;

-- ============================================================
-- TABLE 8: users (Authentication)
-- ============================================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('Administrator', 'Analyst', 'Investigator') NOT NULL DEFAULT 'Analyst',
    disabled        TINYINT(1) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP NULL
);

-- Seed default users (passwords are bcrypt hashed)
INSERT INTO users (username, full_name, email, password_hash, role) VALUES
('admin',         'System Administrator',   'admin@sentinel-ai.io',         '$2b$12$placeholder_admin_hash',    'Administrator'),
('analyst',       'Risk Intelligence Officer','analyst@sentinel-ai.io',      '$2b$12$placeholder_analyst_hash',  'Analyst'),
('investigator',  'Fraud Investigator',      'investigator@sentinel-ai.io',  '$2b$12$placeholder_invest_hash',  'Investigator');

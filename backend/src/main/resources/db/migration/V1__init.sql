CREATE TABLE users (
    user_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    username      VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15)  NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE loans (
    loan_id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_type          VARCHAR(255)  NOT NULL,
    description        VARCHAR(2000) NOT NULL,
    interest_rate      DOUBLE        NOT NULL,
    maximum_amount     DOUBLE        NOT NULL,
    repayment_tenure   INT           NOT NULL,
    eligibility        VARCHAR(1000) NOT NULL,
    documents_required VARCHAR(1000) NOT NULL,
    active             BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_loans_type UNIQUE (loan_type)
);

CREATE TABLE application_documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    data        LONGTEXT NOT NULL
);

CREATE TABLE loan_applications (
    loan_application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_date     DATE          NOT NULL,
    status              VARCHAR(20)   NOT NULL,
    requested_amount    DOUBLE        NOT NULL,
    state               VARCHAR(255)  NOT NULL,
    district            VARCHAR(255)  NOT NULL,
    farm_location       VARCHAR(255)  NOT NULL,
    farmer_address      VARCHAR(500)  NOT NULL,
    farm_size_in_acres  DOUBLE        NOT NULL,
    farm_purpose        VARCHAR(1000) NOT NULL,
    admin_remarks       VARCHAR(1000),
    document_id         BIGINT,
    user_id             BIGINT        NOT NULL,
    loan_id             BIGINT        NOT NULL,
    CONSTRAINT uk_app_document UNIQUE (document_id),
    CONSTRAINT fk_app_document FOREIGN KEY (document_id) REFERENCES application_documents (document_id),
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_app_loan FOREIGN KEY (loan_id) REFERENCES loans (loan_id)
);

CREATE INDEX idx_app_user ON loan_applications (user_id);
CREATE INDEX idx_app_status ON loan_applications (status);

CREATE TABLE feedback (
    feedback_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedback_text VARCHAR(2000) NOT NULL,
    rating        INT           NOT NULL,
    date          DATE          NOT NULL,
    user_id       BIGINT        NOT NULL,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

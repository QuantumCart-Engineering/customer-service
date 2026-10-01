CREATE TABLE addresses (
    id CHAR(36) NOT NULL,

    customer_id CHAR(36) NOT NULL,

    address_type ENUM(
        'HOME',
        'WORK',
        'OTHER'
    ) NOT NULL DEFAULT 'HOME',

    recipient_name VARCHAR(150) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255) NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,

    country VARCHAR(100) NOT NULL DEFAULT 'India',

    phone VARCHAR(20) NULL,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    status ENUM(
        'ACTIVE',
        'DELETED'
    ) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_addresses_customer (
        customer_id
    ),

    INDEX idx_addresses_customer_status (
        customer_id,
        status
    ),

    CONSTRAINT fk_addresses_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
);
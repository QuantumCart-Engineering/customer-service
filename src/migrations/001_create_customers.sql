CREATE TABLE customers (
    id CHAR(36) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NULL,

    status ENUM(
        'ACTIVE',
        'BLOCKED',
        'DELETED'
    ) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);
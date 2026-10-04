ALTER TABLE customers
ADD COLUMN identity_user_id CHAR(36) NULL
AFTER id;

CREATE UNIQUE INDEX uk_customers_identity_user_id
ON customers (identity_user_id);
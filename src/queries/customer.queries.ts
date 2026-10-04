export const createCustomerQuery = `
    INSERT INTO customers (
        id,
        identity_user_id,
        first_name,
        last_name
    )
    VALUES (?, ?, ?, ?)
`;

export const findCustomerByIdQuery = `
    SELECT
        id,
        identity_user_id,
        first_name,
        last_name,
        status,
        created_at,
        updated_at
    FROM customers
    WHERE id = ?
    LIMIT 1
`;

export const findCustomerByIdentityUserIdQuery = `
    SELECT
        id,
        identity_user_id,
        first_name,
        last_name,
        status,
        created_at,
        updated_at
    FROM customers
    WHERE identity_user_id = ?
    LIMIT 1
`;

export const updateCustomerQuery = `
    UPDATE customers
    SET
        first_name = ?,
        last_name = ?
    WHERE id = ?
      AND status != 'DELETED'
`;

export const updateCustomerStatusQuery = `
    UPDATE customers
    SET
        status = ?
    WHERE id = ?
`;

export const deleteCustomerQuery = `
    UPDATE customers
    SET
        status = 'DELETED'
    WHERE id = ?
      AND status != 'DELETED'
`;
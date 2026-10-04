export const createAddressQuery = `
    INSERT INTO addresses (
        id,
        customer_id,
        address_type,
        recipient_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const findAddressByIdQuery = `
    SELECT
        id,
        customer_id,
        address_type,
        recipient_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default,
        status,
        created_at,
        updated_at
    FROM addresses
    WHERE id = ?
    LIMIT 1
`;

export const findAddressesByCustomerIdQuery = `
    SELECT
        id,
        customer_id,
        address_type,
        recipient_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default,
        status,
        created_at,
        updated_at
    FROM addresses
    WHERE customer_id = ?
      AND status = 'ACTIVE'
    ORDER BY is_default DESC, created_at DESC
`;

export const updateAddressQuery = `
    UPDATE addresses
    SET
        address_type = ?,
        recipient_name = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        phone = ?,
        is_default = ?
    WHERE id = ?
      AND customer_id = ?
      AND status != 'DELETED'
`;

export const deleteAddressQuery = `
    UPDATE addresses
    SET
        status = 'DELETED',
        is_default = FALSE
    WHERE id = ?
      AND customer_id = ?
      AND status != 'DELETED'
`;

export const clearDefaultAddressQuery = `
    UPDATE addresses
    SET
        is_default = FALSE
    WHERE customer_id = ?
      AND status = 'ACTIVE'
`;
export const customerSummaryQuery = `
    SELECT
        COUNT(*) AS total_customers,
        COALESCE(SUM(status = 'ACTIVE'), 0) AS active_customers,
        COALESCE(SUM(status = 'BLOCKED'), 0) AS blocked_customers,
        COALESCE(SUM(status = 'DELETED'), 0) AS deleted_customers,
        COALESCE(SUM(
            created_at >= ? AND created_at < ?
        ), 0) AS new_customers
    FROM customers
`;

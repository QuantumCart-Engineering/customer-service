import {
    RowDataPacket
} from "mysql2";

import { pool } from "../config/database";

import {
    customerSummaryQuery
} from "../queries/customer-report.queries";

export interface CustomerReportSummary {
    totalCustomers: number;
    activeCustomers: number;
    blockedCustomers: number;
    deletedCustomers: number;
    newCustomers: number;
}

interface CustomerSummaryRow
    extends RowDataPacket {

    total_customers: number | string;

    active_customers: number | string;

    blocked_customers: number | string;

    deleted_customers: number | string;

    new_customers: number | string;
}

export class CustomerReportRepository {

    async getSummary(
        start: string,
        endExclusive: string
    ): Promise<CustomerReportSummary> {

        const [rows] =
            await pool.execute<CustomerSummaryRow[]>(
                customerSummaryQuery,
                [start, endExclusive]
            );

        const row = rows[0];

        return {
            totalCustomers: Number(
                row?.total_customers ?? 0
            ),

            activeCustomers: Number(
                row?.active_customers ?? 0
            ),

            blockedCustomers: Number(
                row?.blocked_customers ?? 0
            ),

            deletedCustomers: Number(
                row?.deleted_customers ?? 0
            ),

            newCustomers: Number(
                row?.new_customers ?? 0
            )
        };
    }
}

import {
    ResultSetHeader,
    RowDataPacket
} from "mysql2";

import { pool } from "../config/database";

import {
    Customer,
    CustomerStatus
} from "../entities/customer.entity";

import {
    createCustomerQuery,
    findCustomerByIdQuery,
    findCustomerByIdentityUserIdQuery,
    updateCustomerQuery,
    updateCustomerStatusQuery,
    deleteCustomerQuery
} from "../queries/customer.queries";

interface CustomerRow
    extends RowDataPacket {

    id: string;

    identity_user_id: string;

    first_name: string;

    last_name: string | null;

    status: CustomerStatus;

    created_at: Date;

    updated_at: Date;
}

export class CustomerRepository {

    async create(
        customer: Customer
    ): Promise<Customer> {

        await pool.execute<ResultSetHeader>(
            createCustomerQuery,
            [
                customer.id,
                customer.identityUserId,
                customer.firstName,
                customer.lastName
            ]
        );

        return customer;
    }

    async findById(
        id: string
    ): Promise<Customer | null> {

        const [
            rows
        ] =
            await pool.execute<CustomerRow[]>(
                findCustomerByIdQuery,
                [id]
            );

        if (rows.length === 0) {
            return null;
        }

        return this.mapRow(
            rows[0]
        );
    }

    async findByIdentityUserId(
        identityUserId: string
    ): Promise<Customer | null> {

        const [
            rows
        ] =
            await pool.execute<CustomerRow[]>(
                findCustomerByIdentityUserIdQuery,
                [identityUserId]
            );

        if (rows.length === 0) {
            return null;
        }

        return this.mapRow(
            rows[0]
        );
    }

    async update(
        id: string,
        firstName: string,
        lastName: string | null
    ): Promise<boolean> {

        const [
            result
        ] =
            await pool.execute<ResultSetHeader>(
                updateCustomerQuery,
                [
                    firstName,
                    lastName,
                    id
                ]
            );

        return result.affectedRows > 0;
    }

    async updateStatus(
        id: string,
        status: CustomerStatus
    ): Promise<boolean> {

        const [
            result
        ] =
            await pool.execute<ResultSetHeader>(
                updateCustomerStatusQuery,
                [
                    status,
                    id
                ]
            );

        return result.affectedRows > 0;
    }

    async delete(
        id: string
    ): Promise<boolean> {

        const [
            result
        ] =
            await pool.execute<ResultSetHeader>(
                deleteCustomerQuery,
                [id]
            );

        return result.affectedRows > 0;
    }

    private mapRow(
        row: CustomerRow
    ): Customer {

        return {
            id: row.id,

            identityUserId:
                row.identity_user_id,

            firstName:
                row.first_name,

            lastName:
                row.last_name,

            status:
                row.status,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at
        };
    }
}
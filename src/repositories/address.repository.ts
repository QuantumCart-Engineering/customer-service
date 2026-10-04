import {
    ResultSetHeader,
    RowDataPacket
} from "mysql2";

import { pool } from "../config/database";

import {
    Address,
    AddressStatus,
    AddressType
} from "../entities/address.entity";

import {
    createAddressQuery,
    findAddressByIdQuery,
    findAddressesByCustomerIdQuery,
    updateAddressQuery,
    deleteAddressQuery,
    clearDefaultAddressQuery
} from "../queries/address.queries";

interface AddressRow
    extends RowDataPacket {
    id: string;
    customer_id: string;
    address_type: AddressType;
    recipient_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: number;
    status: AddressStatus;
    created_at: Date;
    updated_at: Date;
}

export class AddressRepository {

    async create(
        address: Address
    ): Promise<Address> {

        await pool.execute<ResultSetHeader>(
            createAddressQuery,
            [
                address.id,
                address.customerId,
                address.addressType,
                address.recipientName,
                address.addressLine1,
                address.addressLine2,
                address.city,
                address.state,
                address.postalCode,
                address.country,
                address.phone,
                address.isDefault
            ]
        );

        return address;
    }

    async findById(
        id: string
    ): Promise<Address | null> {

        const [
            rows
        ] =
            await pool.execute<AddressRow[]>(
                findAddressByIdQuery,
                [id]
            );

        if (rows.length === 0) {
            return null;
        }

        return this.mapRow(
            rows[0]
        );
    }

    async findByCustomerId(
        customerId: string
    ): Promise<Address[]> {

        const [
            rows
        ] =
            await pool.execute<AddressRow[]>(
                findAddressesByCustomerIdQuery,
                [customerId]
            );

        return rows.map(
            row => this.mapRow(row)
        );
    }

    async update(
        id: string,
        customerId: string,
        address: Address
    ): Promise<boolean> {

        const [
            result
        ] =
            await pool.execute<ResultSetHeader>(
                updateAddressQuery,
                [
                    address.addressType,
                    address.recipientName,
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.state,
                    address.postalCode,
                    address.country,
                    address.phone,
                    address.isDefault,
                    id,
                    customerId
                ]
            );

        return result.affectedRows > 0;
    }

    async clearDefault(
        customerId: string
    ): Promise<void> {

        await pool.execute(
            clearDefaultAddressQuery,
            [customerId]
        );
    }

    async delete(
        id: string,
        customerId: string
    ): Promise<boolean> {

        const [
            result
        ] =
            await pool.execute<ResultSetHeader>(
                deleteAddressQuery,
                [
                    id,
                    customerId
                ]
            );

        return result.affectedRows > 0;
    }

    private mapRow(
        row: AddressRow
    ): Address {

        return {
            id: row.id,

            customerId:
                row.customer_id,

            addressType:
                row.address_type,

            recipientName:
                row.recipient_name,

            addressLine1:
                row.address_line1,

            addressLine2:
                row.address_line2,

            city:
                row.city,

            state:
                row.state,

            postalCode:
                row.postal_code,

            country:
                row.country,

            phone:
                row.phone,

            isDefault:
                Boolean(row.is_default),

            status:
                row.status,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at
        };
    }
}
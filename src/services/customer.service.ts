
import { randomUUID } from "crypto";

import {
    CreateCustomerDto,
    UpdateCustomerDto
} from "../dto/customer.dto";

import {
    Customer,
    CustomerStatus
} from "../entities/customer.entity";

import {
    CustomerRepository
} from "../repositories/customer.repository";

import { AppError } from "../errors/app.error";

export class CustomerService {

    constructor(
        private readonly customerRepository:
            CustomerRepository
    ) { }

    async createCustomer(
        dto: CreateCustomerDto
    ): Promise<Customer> {

        const identityUserId =
            dto.identityUserId?.trim();

        if (!identityUserId) {
            throw new AppError(
                "Identity user ID is required",
                400
            );
        }

        const existingCustomer =
            await this.customerRepository
                .findByIdentityUserId(
                    identityUserId
                );

        if (existingCustomer) {
            throw new AppError(
                "Customer profile already exists for this identity user",
                409
            );
        }

        const firstName =
            dto.firstName?.trim();

        if (!firstName) {
            throw new AppError(
                "First name is required",
                400
            );
        }

        const customer: Customer = {
            id: randomUUID(),
            identityUserId,
            firstName,
            lastName: dto.lastName?.trim() || null,
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return this.customerRepository.create(
            customer
        );
    }

    async getCustomerById(
        id: string
    ): Promise<Customer> {

        const customer =
            await this.customerRepository.findById(
                id
            );

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404
            );
        }

        return customer;
    }

    async getCustomerByIdForIdentity(
        customerId: string,
        identityUserId: string
    ): Promise<Customer> {

        const normalizedIdentityUserId =
            identityUserId?.trim();

        if (!normalizedIdentityUserId) {
            throw new AppError(
                "Authenticated identity is required",
                401
            );
        }

        const customer =
            await this.getCustomerById(customerId);

        if (
            customer.identityUserId !==
            normalizedIdentityUserId
        ) {
            // Do not reveal whether another user's
            // customer profile exists.
            throw new AppError(
                "Customer not found",
                404
            );
        }

        return customer;
    }

    async getCustomerByIdentityUserId(
        identityUserId: string
    ): Promise<Customer> {

        const normalizedIdentityUserId =
            identityUserId?.trim();

        if (!normalizedIdentityUserId) {
            throw new AppError(
                "Identity user ID is required",
                400
            );
        }

        const customer =
            await this.customerRepository
                .findByIdentityUserId(
                    normalizedIdentityUserId
                );

        if (!customer) {
            throw new AppError(
                "Customer profile not found",
                404
            );
        }

        return customer;
    }


    async getCustomerByIdentityForIdentity(
        requestedIdentityUserId: string,
        authenticatedIdentityUserId: string
    ): Promise<Customer> {

        const authenticatedId =
            authenticatedIdentityUserId?.trim();

        if (!authenticatedId) {
            throw new AppError(
                "Authenticated identity is required",
                401
            );
        }

        if (
            requestedIdentityUserId !== authenticatedId
        ) {
            throw new AppError(
                "Customer not found",
                404
            );
        }

        return this.getCustomerByIdentityUserId(
            authenticatedId
        );
    }


    async updateCustomer(
        id: string,
        identityUserId: string,
        dto: UpdateCustomerDto
    ): Promise<Customer> {

        const customer =
            await this.getCustomerByIdForIdentity(
                id,
                identityUserId
            );

        if (customer.status === "DELETED") {
            throw new AppError(
                "Deleted customer cannot be updated",
                409
            );
        }

        const firstName =
            dto.firstName !== undefined
                ? dto.firstName.trim()
                : customer.firstName;

        if (!firstName) {
            throw new AppError(
                "First name is required",
                400
            );
        }

        const lastName =
            dto.lastName !== undefined
                ? dto.lastName?.trim() || null
                : customer.lastName;

        const updated =
            await this.customerRepository.update(
                id,
                firstName,
                lastName
            );

        if (!updated) {
            throw new AppError(
                "Customer could not be updated",
                500
            );
        }

        return this.getCustomerByIdForIdentity(
            id,
            identityUserId
        );
    }

    async updateStatus(
        id: string,
        identityUserId: string,
        status: CustomerStatus
    ): Promise<Customer> {

        const customer =
            await this.getCustomerByIdForIdentity(
                id,
                identityUserId
            );

        if (customer.status === "DELETED") {
            throw new AppError(
                "Deleted customer status cannot be changed",
                409
            );
        }

        if (status === "DELETED") {
            throw new AppError(
                "Use deleteCustomer to delete a customer",
                400
            );
        }

        if (customer.status === status) {
            return customer;
        }

        const updated =
            await this.customerRepository.updateStatus(
                id,
                status
            );

        if (!updated) {
            throw new AppError(
                "Customer status could not be updated",
                500
            );
        }

        return this.getCustomerByIdForIdentity(
            id,
            identityUserId
        );
    }

    async deleteCustomer(
        id: string,
        identityUserId: string
    ): Promise<void> {

        const customer =
            await this.getCustomerByIdForIdentity(
                id,
                identityUserId
            );

        if (customer.status === "DELETED") {
            return;
        }

        const deleted =
            await this.customerRepository.delete(
                id
            );

        if (!deleted) {
            throw new AppError(
                "Customer could not be deleted",
                500
            );
        }
    }
}

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

export class CustomerService {

    constructor(
        private readonly customerRepository:
            CustomerRepository
    ) {}

    async createCustomer(
        dto: CreateCustomerDto
    ): Promise<Customer> {

        const identityUserId =
            dto.identityUserId?.trim();

        if (!identityUserId) {
            throw new Error(
                "Identity user ID is required"
            );
        }

        const existingCustomer =
            await this.customerRepository
                .findByIdentityUserId(
                    identityUserId
                );

        if (existingCustomer) {
            throw new Error(
                "Customer profile already exists for this identity user"
            );
        }

        const firstName =
            dto.firstName?.trim();

        if (!firstName) {
            throw new Error(
                "First name is required"
            );
        }

        const customer: Customer = {
            id: randomUUID(),

            identityUserId,

            firstName,

            lastName:
                dto.lastName?.trim() || null,

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
            throw new Error(
                "Customer not found"
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
            throw new Error(
                "Identity user ID is required"
            );
        }

        const customer =
            await this.customerRepository
                .findByIdentityUserId(
                    normalizedIdentityUserId
                );

        if (!customer) {
            throw new Error(
                "Customer profile not found"
            );
        }

        return customer;
    }

    async updateCustomer(
        id: string,
        dto: UpdateCustomerDto
    ): Promise<Customer> {

        const customer =
            await this.getCustomerById(id);

        if (
            customer.status === "DELETED"
        ) {
            throw new Error(
                "Deleted customer cannot be updated"
            );
        }

        const firstName =
            dto.firstName !== undefined
                ? dto.firstName.trim()
                : customer.firstName;

        if (!firstName) {
            throw new Error(
                "First name is required"
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
            throw new Error(
                "Customer could not be updated"
            );
        }

        const updatedCustomer =
            await this.customerRepository.findById(
                id
            );

        if (!updatedCustomer) {
            throw new Error(
                "Customer not found after update"
            );
        }

        return updatedCustomer;
    }

    async updateStatus(
        id: string,
        status: CustomerStatus
    ): Promise<Customer> {

        const customer =
            await this.getCustomerById(id);

        if (
            customer.status === "DELETED"
        ) {
            throw new Error(
                "Deleted customer status cannot be changed"
            );
        }

        if (
            status === "DELETED"
        ) {
            throw new Error(
                "Use deleteCustomer to delete a customer"
            );
        }

        if (
            customer.status === status
        ) {
            return customer;
        }

        const updated =
            await this.customerRepository.updateStatus(
                id,
                status
            );

        if (!updated) {
            throw new Error(
                "Customer status could not be updated"
            );
        }

        const updatedCustomer =
            await this.customerRepository.findById(
                id
            );

        if (!updatedCustomer) {
            throw new Error(
                "Customer not found after status update"
            );
        }

        return updatedCustomer;
    }

    async deleteCustomer(
        id: string
    ): Promise<void> {

        const customer =
            await this.getCustomerById(id);

        if (
            customer.status === "DELETED"
        ) {
            return;
        }

        const deleted =
            await this.customerRepository.delete(
                id
            );

        if (!deleted) {
            throw new Error(
                "Customer could not be deleted"
            );
        }
    }
}
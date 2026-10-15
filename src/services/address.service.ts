import { randomUUID } from "crypto";

import {
    CreateAddressDto,
    UpdateAddressDto
} from "../dto/address.dto";

import {
    Address
} from "../entities/address.entity";

import {
    AddressRepository
} from "../repositories/address.repository";

import {
    CustomerRepository
} from "../repositories/customer.repository";

import { AppError } from "../errors/app.error";

export class AddressService {

    constructor(
        private readonly addressRepository:
            AddressRepository,

        private readonly customerRepository:
            CustomerRepository
    ) {}

    async createAddress(
        customerId: string,
        identityUserId: string,
        dto: CreateAddressDto
    ): Promise<Address> {

        await this.ensureCustomerOwnership(
            customerId,
            identityUserId
        );

        this.validateAddressDto(dto);

        const isDefault =
            dto.isDefault === true;

        if (isDefault) {
            await this.addressRepository.clearDefault(
                customerId
            );
        }

        const address: Address = {
            id: randomUUID(),

            customerId,

            addressType:
                dto.addressType ?? "HOME",

            recipientName:
                dto.recipientName.trim(),

            addressLine1:
                dto.addressLine1.trim(),

            addressLine2:
                dto.addressLine2?.trim() || null,

            city:
                dto.city.trim(),

            state:
                dto.state.trim(),

            postalCode:
                dto.postalCode.trim(),

            country:
                dto.country?.trim() || "India",

            phone:
                dto.phone?.trim() || null,

            isDefault,

            status: "ACTIVE",

            createdAt: new Date(),

            updatedAt: new Date()
        };

        return this.addressRepository.create(
            address
        );
    }

    async getAddressById(
        customerId: string,
        identityUserId: string,
        addressId: string
    ): Promise<Address> {

        const address =
            await this.addressRepository.findById(
                addressId
            );

        if (!address) {
            throw new AppError(
                "Address not found",
                404
            );
        }

        if (
            address.customerId !== customerId
        ) {
            throw new AppError(
                "Address does not belong to customer",
                404
            );
        }

        if (
            address.status === "DELETED"
        ) {
            throw new AppError(
                "Address not found",
                404
            );
        }

        await this.ensureCustomerOwnership(
            customerId,
            identityUserId
        );

        return address;
    }

    async getCustomerAddresses(
        customerId: string,
        identityUserId: string
    ): Promise<Address[]> {

        await this.ensureCustomerOwnership(
            customerId,
            identityUserId
        );

        return this.addressRepository.findByCustomerId(
            customerId
        );
    }

    async updateAddress(
        customerId: string,
        identityUserId: string,
        addressId: string,
        dto: UpdateAddressDto
    ): Promise<Address> {

        const existing =
            await this.getAddressById(
                customerId,
                identityUserId,
                addressId
            );

        const address: Address = {

            ...existing,

            addressType:
                dto.addressType ??
                existing.addressType,

            recipientName:
                dto.recipientName !== undefined
                    ? dto.recipientName.trim()
                    : existing.recipientName,

            addressLine1:
                dto.addressLine1 !== undefined
                    ? dto.addressLine1.trim()
                    : existing.addressLine1,

            addressLine2:
                dto.addressLine2 !== undefined
                    ? dto.addressLine2?.trim() || null
                    : existing.addressLine2,

            city:
                dto.city !== undefined
                    ? dto.city.trim()
                    : existing.city,

            state:
                dto.state !== undefined
                    ? dto.state.trim()
                    : existing.state,

            postalCode:
                dto.postalCode !== undefined
                    ? dto.postalCode.trim()
                    : existing.postalCode,

            country:
                dto.country !== undefined
                    ? dto.country.trim()
                    : existing.country,

            phone:
                dto.phone !== undefined
                    ? dto.phone?.trim() || null
                    : existing.phone,

            isDefault:
                dto.isDefault ??
                existing.isDefault
        };

        this.validateAddress(
            address
        );

        if (
            dto.isDefault === true &&
            !existing.isDefault
        ) {
            await this.addressRepository.clearDefault(
                customerId
            );
        }

        const updated =
            await this.addressRepository.update(
                addressId,
                customerId,
                address
            );

        if (!updated) {
            throw new AppError(
                "Address could not be updated",
                500
            );
        }

        const updatedAddress =
            await this.addressRepository.findById(
                addressId
            );

        if (!updatedAddress) {
            throw new AppError(
                "Address not found after update",
                500
            );
        }

        return updatedAddress;
    }

    async deleteAddress(
        customerId: string,
        identityUserId: string,
        addressId: string
    ): Promise<void> {

        await this.getAddressById(
            customerId,
            identityUserId,
            addressId
        );

        const deleted =
            await this.addressRepository.delete(
                addressId,
                customerId
            );

        if (!deleted) {
            throw new AppError(
                "Address could not be deleted",
                500
            );
        }
    }

    private async ensureCustomerOwnership(
        customerId: string,
        identityUserId: string
    ): Promise<void> {

        const normalizedIdentityUserId =
            identityUserId?.trim();

        if (!normalizedIdentityUserId) {
            throw new AppError(
                "Authenticated identity is required",
                401
            );
        }

        const customer =
            await this.customerRepository.findById(
                customerId
            );

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404
            );
        }

        if (
            customer.status === "DELETED"
        ) {
            throw new AppError(
                "Deleted customer cannot have address operations",
                409
            );
        }

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
    }

    private validateAddressDto(
        dto: CreateAddressDto
    ): void {

        if (
            !dto.recipientName?.trim()
        ) {
            throw new AppError(
                "Recipient name is required",
                400
            );
        }

        if (
            !dto.addressLine1?.trim()
        ) {
            throw new AppError(
                "Address line 1 is required",
                400
            );
        }

        if (
            !dto.city?.trim()
        ) {
            throw new AppError(
                "City is required",
                400
            );
        }

        if (
            !dto.state?.trim()
        ) {
            throw new AppError(
                "State is required",
                400
            );
        }

        if (
            !dto.postalCode?.trim()
        ) {
            throw new AppError(
                "Postal code is required",
                400
            );
        }
    }

    private validateAddress(
        address: Address
    ): void {

        if (
            !address.recipientName.trim()
        ) {
            throw new AppError(
                "Recipient name is required",
                400
            );
        }

        if (
            !address.addressLine1.trim()
        ) {
            throw new AppError(
                "Address line 1 is required",
                400
            );
        }

        if (
            !address.city.trim()
        ) {
            throw new AppError(
                "City is required",
                400
            );
        }

        if (
            !address.state.trim()
        ) {
            throw new AppError(
                "State is required",
                400
            );
        }

        if (
            !address.postalCode.trim()
        ) {
            throw new AppError(
                "Postal code is required",
                400
            );
        }
    }
}
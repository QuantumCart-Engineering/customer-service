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

export class AddressService {

    constructor(
        private readonly addressRepository:
            AddressRepository,

        private readonly customerRepository:
            CustomerRepository
    ) {}

    async createAddress(
        customerId: string,
        dto: CreateAddressDto
    ): Promise<Address> {

        await this.ensureCustomerExists(
            customerId
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
        addressId: string
    ): Promise<Address> {

        const address =
            await this.addressRepository.findById(
                addressId
            );

        if (!address) {
            throw new Error(
                "Address not found"
            );
        }

        if (
            address.customerId !== customerId
        ) {
            throw new Error(
                "Address does not belong to customer"
            );
        }

        if (
            address.status === "DELETED"
        ) {
            throw new Error(
                "Address not found"
            );
        }

        return address;
    }

    async getCustomerAddresses(
        customerId: string
    ): Promise<Address[]> {

        await this.ensureCustomerExists(
            customerId
        );

        return this.addressRepository.findByCustomerId(
            customerId
        );
    }

    async updateAddress(
        customerId: string,
        addressId: string,
        dto: UpdateAddressDto
    ): Promise<Address> {

        const existing =
            await this.getAddressById(
                customerId,
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
            throw new Error(
                "Address could not be updated"
            );
        }

        const updatedAddress =
            await this.addressRepository.findById(
                addressId
            );

        if (!updatedAddress) {
            throw new Error(
                "Address not found after update"
            );
        }

        return updatedAddress;
    }

    async deleteAddress(
        customerId: string,
        addressId: string
    ): Promise<void> {

        await this.getAddressById(
            customerId,
            addressId
        );

        const deleted =
            await this.addressRepository.delete(
                addressId,
                customerId
            );

        if (!deleted) {
            throw new Error(
                "Address could not be deleted"
            );
        }
    }

    private async ensureCustomerExists(
        customerId: string
    ): Promise<void> {

        const customer =
            await this.customerRepository.findById(
                customerId
            );

        if (!customer) {
            throw new Error(
                "Customer not found"
            );
        }

        if (
            customer.status === "DELETED"
        ) {
            throw new Error(
                "Deleted customer cannot have address operations"
            );
        }
    }

    private validateAddressDto(
        dto: CreateAddressDto
    ): void {

        if (
            !dto.recipientName?.trim()
        ) {
            throw new Error(
                "Recipient name is required"
            );
        }

        if (
            !dto.addressLine1?.trim()
        ) {
            throw new Error(
                "Address line 1 is required"
            );
        }

        if (
            !dto.city?.trim()
        ) {
            throw new Error(
                "City is required"
            );
        }

        if (
            !dto.state?.trim()
        ) {
            throw new Error(
                "State is required"
            );
        }

        if (
            !dto.postalCode?.trim()
        ) {
            throw new Error(
                "Postal code is required"
            );
        }
    }

    private validateAddress(
        address: Address
    ): void {

        if (
            !address.recipientName.trim()
        ) {
            throw new Error(
                "Recipient name is required"
            );
        }

        if (
            !address.addressLine1.trim()
        ) {
            throw new Error(
                "Address line 1 is required"
            );
        }

        if (
            !address.city.trim()
        ) {
            throw new Error(
                "City is required"
            );
        }

        if (
            !address.state.trim()
        ) {
            throw new Error(
                "State is required"
            );
        }

        if (
            !address.postalCode.trim()
        ) {
            throw new Error(
                "Postal code is required"
            );
        }
    }
}
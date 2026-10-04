import {
    AddressRepository
} from "../../repositories/address.repository";

import {
    CustomerRepository
} from "../../repositories/customer.repository";

import {
    AddressService
} from "../../services/address.service";

import {
    Address
} from "../../entities/address.entity";

import {
    Customer
} from "../../entities/customer.entity";

describe(
    "AddressService",
    () => {

        let addressRepository:
            jest.Mocked<AddressRepository>;

        let customerRepository:
            jest.Mocked<CustomerRepository>;

        let addressService:
            AddressService;

        beforeEach(() => {

            addressRepository =
                {
                    create:
                        jest.fn(),

                    findById:
                        jest.fn(),

                    findByCustomerId:
                        jest.fn(),

                    update:
                        jest.fn(),

                    clearDefault:
                        jest.fn(),

                    delete:
                        jest.fn()
                } as unknown as
                    jest.Mocked<AddressRepository>;

            customerRepository =
                {
                    findById:
                        jest.fn()
                } as unknown as
                    jest.Mocked<CustomerRepository>;

            addressService =
                new AddressService(
                    addressRepository,
                    customerRepository
                );
        });

        const activeCustomer:
            Customer = {
                id:
                    "customer-123",

                identityUserId:
                    "identity-123",

                firstName:
                    "Akash",

                lastName:
                    "Kumar",

                status:
                    "ACTIVE",

                createdAt:
                    new Date(),

                updatedAt:
                    new Date()
            };

        const activeAddress:
            Address = {
                id:
                    "address-123",

                customerId:
                    "customer-123",

                addressType:
                    "HOME",

                recipientName:
                    "Akash Kumar",

                addressLine1:
                    "123 Main Street",

                addressLine2:
                    null,

                city:
                    "Noida",

                state:
                    "Uttar Pradesh",

                postalCode:
                    "201301",

                country:
                    "India",

                phone:
                    "9876543210",

                isDefault:
                    true,

                status:
                    "ACTIVE",

                createdAt:
                    new Date(),

                updatedAt:
                    new Date()
            };

        describe(
            "createAddress",
            () => {

                it(
                    "should create an address successfully",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        addressRepository
                            .create
                            .mockImplementation(
                                async address =>
                                    address
                            );

                        const result =
                            await addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        addressType:
                                            "HOME",

                                        recipientName:
                                            " Akash Kumar ",

                                        addressLine1:
                                            " 123 Main Street ",

                                        city:
                                            " Noida ",

                                        state:
                                            " Uttar Pradesh ",

                                        postalCode:
                                            " 201301 ",

                                        phone:
                                            " 9876543210 ",

                                        isDefault:
                                            false
                                    }
                                );

                        expect(
                            result
                        ).toEqual(
                            expect.objectContaining({
                                customerId:
                                    "customer-123",

                                addressType:
                                    "HOME",

                                recipientName:
                                    "Akash Kumar",

                                addressLine1:
                                    "123 Main Street",

                                city:
                                    "Noida",

                                state:
                                    "Uttar Pradesh",

                                postalCode:
                                    "201301",

                                country:
                                    "India",

                                phone:
                                    "9876543210",

                                isDefault:
                                    false,

                                status:
                                    "ACTIVE"
                            })
                        );

                        expect(
                            addressRepository
                                .create
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            addressRepository
                                .clearDefault
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should clear existing default address when creating a default address",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        addressRepository
                            .create
                            .mockImplementation(
                                async address =>
                                    address
                            );

                        await addressService
                            .createAddress(
                                "customer-123",
                                {
                                    recipientName:
                                        "Akash Kumar",

                                    addressLine1:
                                        "123 Main Street",

                                    city:
                                        "Noida",

                                    state:
                                        "Uttar Pradesh",

                                    postalCode:
                                        "201301",

                                    isDefault:
                                        true
                                }
                            );

                        expect(
                            addressRepository
                                .clearDefault
                        ).toHaveBeenCalledWith(
                            "customer-123"
                        );

                        expect(
                            addressRepository
                                .create
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                it(
                    "should reject address when customer does not exist",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "Noida",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "Customer not found"
                        );

                        expect(
                            addressRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should reject address for deleted customer",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue({
                                ...activeCustomer,
                                status:
                                    "DELETED"
                            });

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "Noida",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "Deleted customer cannot have address operations"
                        );

                        expect(
                            addressRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should reject when recipient name is missing",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "   ",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "Noida",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "Recipient name is required"
                        );

                        expect(
                            addressRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should reject when address line 1 is missing",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "   ",

                                        city:
                                            "Noida",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "Address line 1 is required"
                        );
                    }
                );

                it(
                    "should reject when city is missing",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "   ",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "City is required"
                        );
                    }
                );

                it(
                    "should reject when state is missing",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "Noida",

                                        state:
                                            "   ",

                                        postalCode:
                                            "201301"
                                    }
                                )
                        ).rejects.toThrow(
                            "State is required"
                        );
                    }
                );

                it(
                    "should reject when postal code is missing",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        await expect(
                            addressService
                                .createAddress(
                                    "customer-123",
                                    {
                                        recipientName:
                                            "Akash Kumar",

                                        addressLine1:
                                            "123 Main Street",

                                        city:
                                            "Noida",

                                        state:
                                            "Uttar Pradesh",

                                        postalCode:
                                            "   "
                                    }
                                )
                        ).rejects.toThrow(
                            "Postal code is required"
                        );
                    }
                );
            }
        );

        describe(
            "getAddressById",
            () => {

                it(
                    "should return address belonging to customer",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue(
                                activeAddress
                            );

                        const result =
                            await addressService
                                .getAddressById(
                                    "customer-123",
                                    "address-123"
                                );

                        expect(
                            result
                        ).toEqual(
                            activeAddress
                        );
                    }
                );

                it(
                    "should reject when address does not exist",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            addressService
                                .getAddressById(
                                    "customer-123",
                                    "address-123"
                                )
                        ).rejects.toThrow(
                            "Address not found"
                        );
                    }
                );

                it(
                    "should reject when address belongs to another customer",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue({
                                ...activeAddress,

                                customerId:
                                    "another-customer"
                            });

                        await expect(
                            addressService
                                .getAddressById(
                                    "customer-123",
                                    "address-123"
                                )
                        ).rejects.toThrow(
                            "Address does not belong to customer"
                        );
                    }
                );

                it(
                    "should reject deleted address",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue({
                                ...activeAddress,

                                status:
                                    "DELETED"
                            });

                        await expect(
                            addressService
                                .getAddressById(
                                    "customer-123",
                                    "address-123"
                                )
                        ).rejects.toThrow(
                            "Address not found"
                        );
                    }
                );
            }
        );

        describe(
            "getCustomerAddresses",
            () => {

                it(
                    "should return customer addresses",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                activeCustomer
                            );

                        addressRepository
                            .findByCustomerId
                            .mockResolvedValue([
                                activeAddress
                            ]);

                        const result =
                            await addressService
                                .getCustomerAddresses(
                                    "customer-123"
                                );

                        expect(
                            result
                        ).toEqual([
                            activeAddress
                        ]);

                        expect(
                            addressRepository
                                .findByCustomerId
                        ).toHaveBeenCalledWith(
                            "customer-123"
                        );
                    }
                );

                it(
                    "should reject when customer does not exist",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            addressService
                                .getCustomerAddresses(
                                    "customer-123"
                                )
                        ).rejects.toThrow(
                            "Customer not found"
                        );

                        expect(
                            addressRepository
                                .findByCustomerId
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        describe(
            "updateAddress",
            () => {

                it(
                    "should update address successfully",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue(
                                activeAddress
                            );

                        addressRepository
                            .update
                            .mockResolvedValue(
                                true
                            );

                        const updatedAddress:
                            Address = {
                                ...activeAddress,

                                city:
                                    "Greater Noida"
                            };

                        addressRepository
                            .findById
                            .mockResolvedValueOnce(
                                activeAddress
                            )
                            .mockResolvedValueOnce(
                                updatedAddress
                            );

                        const result =
                            await addressService
                                .updateAddress(
                                    "customer-123",
                                    "address-123",
                                    {
                                        city:
                                            "Greater Noida"
                                    }
                                );

                        expect(
                            addressRepository
                                .update
                        ).toHaveBeenCalledWith(
                            "address-123",
                            "customer-123",
                            expect.objectContaining({
                                city:
                                    "Greater Noida"
                            })
                        );

                        expect(
                            result
                        ).toEqual(
                            updatedAddress
                        );
                    }
                );

                it(
                    "should clear existing default when address becomes default",
                    async () => {

                        const nonDefaultAddress:
                            Address = {
                                ...activeAddress,

                                isDefault:
                                    false
                            };

                        const updatedAddress:
                            Address = {
                                ...nonDefaultAddress,

                                isDefault:
                                    true
                            };

                        addressRepository
                            .findById
                            .mockResolvedValueOnce(
                                nonDefaultAddress
                            )
                            .mockResolvedValueOnce(
                                updatedAddress
                            );

                        addressRepository
                            .clearDefault
                            .mockResolvedValue(
                                undefined
                            );

                        addressRepository
                            .update
                            .mockResolvedValue(
                                true
                            );

                        const result =
                            await addressService
                                .updateAddress(
                                    "customer-123",
                                    "address-123",
                                    {
                                        isDefault:
                                            true
                                    }
                                );

                        expect(
                            addressRepository
                                .clearDefault
                        ).toHaveBeenCalledWith(
                            "customer-123"
                        );

                        expect(
                            result
                        ).toEqual(
                            updatedAddress
                        );
                    }
                );
            }
        );

        describe(
            "deleteAddress",
            () => {

                it(
                    "should delete an existing address",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue(
                                activeAddress
                            );

                        addressRepository
                            .delete
                            .mockResolvedValue(
                                true
                            );

                        await addressService
                            .deleteAddress(
                                "customer-123",
                                "address-123"
                            );

                        expect(
                            addressRepository
                                .delete
                        ).toHaveBeenCalledWith(
                            "address-123",
                            "customer-123"
                        );
                    }
                );

                it(
                    "should not delete an address belonging to another customer",
                    async () => {

                        addressRepository
                            .findById
                            .mockResolvedValue({
                                ...activeAddress,

                                customerId:
                                    "another-customer"
                            });

                        await expect(
                            addressService
                                .deleteAddress(
                                    "customer-123",
                                    "address-123"
                                )
                        ).rejects.toThrow(
                            "Address does not belong to customer"
                        );

                        expect(
                            addressRepository
                                .delete
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );
    }
);
import {
    CustomerRepository
} from "../../repositories/customer.repository";

import {
    CustomerService
} from "../../services/customer.service";

import {
    Customer
} from "../../entities/customer.entity";

describe(
    "CustomerService",
    () => {

        let customerRepository:
            jest.Mocked<CustomerRepository>;

        let customerService:
            CustomerService;

        beforeEach(() => {

            customerRepository =
                {
                    create:
                        jest.fn(),

                    findById:
                        jest.fn(),

                    findByIdentityUserId:
                        jest.fn(),

                    update:
                        jest.fn(),

                    updateStatus:
                        jest.fn(),

                    delete:
                        jest.fn()
                } as unknown as
                    jest.Mocked<CustomerRepository>;

            customerService =
                new CustomerService(
                    customerRepository
                );
        });

        describe(
            "createCustomer",
            () => {

                it(
                    "should create a customer successfully",
                    async () => {

                        const customer: Customer = {
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

                        customerRepository
                            .findByIdentityUserId
                            .mockResolvedValue(
                                null
                            );

                        customerRepository
                            .create
                            .mockResolvedValue(
                                customer
                            );

                        const result =
                            await customerService
                                .createCustomer({
                                    identityUserId:
                                        "identity-123",

                                    firstName:
                                        " Akash ",

                                    lastName:
                                        " Kumar "
                                });

                        expect(
                            result
                        ).toEqual(
                            customer
                        );

                        expect(
                            customerRepository
                                .findByIdentityUserId
                        ).toHaveBeenCalledWith(
                            "identity-123"
                        );

                        expect(
                            customerRepository
                                .create
                        ).toHaveBeenCalledWith(
                            expect.objectContaining({
                                identityUserId:
                                    "identity-123",

                                firstName:
                                    "Akash",

                                lastName:
                                    "Kumar",

                                status:
                                    "ACTIVE"
                            })
                        );
                    }
                );

                it(
                    "should reject when identity user ID is missing",
                    async () => {

                        await expect(
                            customerService
                                .createCustomer({
                                    identityUserId:
                                        "",

                                    firstName:
                                        "Akash"
                                })
                        ).rejects.toThrow(
                            "Identity user ID is required"
                        );

                        expect(
                            customerRepository
                                .findByIdentityUserId
                        ).not.toHaveBeenCalled();

                        expect(
                            customerRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should reject duplicate identity user ID",
                    async () => {

                        const existingCustomer:
                            Customer = {
                                id:
                                    "customer-existing",

                                identityUserId:
                                    "identity-123",

                                firstName:
                                    "Existing",

                                lastName:
                                    "User",

                                status:
                                    "ACTIVE",

                                createdAt:
                                    new Date(),

                                updatedAt:
                                    new Date()
                            };

                        customerRepository
                            .findByIdentityUserId
                            .mockResolvedValue(
                                existingCustomer
                            );

                        await expect(
                            customerService
                                .createCustomer({
                                    identityUserId:
                                        "identity-123",

                                    firstName:
                                        "Akash"
                                })
                        ).rejects.toThrow(
                            "Customer profile already exists for this identity user"
                        );

                        expect(
                            customerRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should reject when first name is missing",
                    async () => {

                        customerRepository
                            .findByIdentityUserId
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            customerService
                                .createCustomer({
                                    identityUserId:
                                        "identity-123",

                                    firstName:
                                        "   "
                                })
                        ).rejects.toThrow(
                            "First name is required"
                        );

                        expect(
                            customerRepository
                                .create
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        describe(
            "getCustomerById",
            () => {

                it(
                    "should return customer when found",
                    async () => {

                        const customer:
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

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        const result =
                            await customerService
                                .getCustomerById(
                                    "customer-123"
                                );

                        expect(
                            result
                        ).toEqual(
                            customer
                        );
                    }
                );

                it(
                    "should throw when customer does not exist",
                    async () => {

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            customerService
                                .getCustomerById(
                                    "customer-123"
                                )
                        ).rejects.toThrow(
                            "Customer not found"
                        );
                    }
                );
            }
        );

        describe(
            "getCustomerByIdentityUserId",
            () => {

                it(
                    "should return customer by identity user ID",
                    async () => {

                        const customer:
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

                        customerRepository
                            .findByIdentityUserId
                            .mockResolvedValue(
                                customer
                            );

                        const result =
                            await customerService
                                .getCustomerByIdentityUserId(
                                    "identity-123"
                                );

                        expect(
                            result
                        ).toEqual(
                            customer
                        );
                    }
                );

                it(
                    "should reject missing identity user ID",
                    async () => {

                        await expect(
                            customerService
                                .getCustomerByIdentityUserId(
                                    "   "
                                )
                        ).rejects.toThrow(
                            "Identity user ID is required"
                        );
                    }
                );

                it(
                    "should throw when customer profile does not exist",
                    async () => {

                        customerRepository
                            .findByIdentityUserId
                            .mockResolvedValue(
                                null
                            );

                        await expect(
                            customerService
                                .getCustomerByIdentityUserId(
                                    "identity-123"
                                )
                        ).rejects.toThrow(
                            "Customer profile not found"
                        );
                    }
                );
            }
        );

        describe(
            "updateCustomer",
            () => {

                it(
                    "should update customer successfully",
                    async () => {

                        const existingCustomer:
                            Customer = {
                                id:
                                    "customer-123",

                                identityUserId:
                                    "identity-123",

                                firstName:
                                    "Old",

                                lastName:
                                    "Name",

                                status:
                                    "ACTIVE",

                                createdAt:
                                    new Date(),

                                updatedAt:
                                    new Date()
                            };

                        const updatedCustomer:
                            Customer = {
                                ...existingCustomer,

                                firstName:
                                    "New",

                                lastName:
                                    "Name"
                            };

                        customerRepository
                            .findById
                            .mockResolvedValueOnce(
                                existingCustomer
                            )
                            .mockResolvedValueOnce(
                                updatedCustomer
                            );

                        customerRepository
                            .update
                            .mockResolvedValue(
                                true
                            );

                        const result =
                            await customerService
                                .updateCustomer(
                                    "customer-123",
                                    {
                                        firstName:
                                            " New "
                                    }
                                );

                        expect(
                            customerRepository
                                .update
                        ).toHaveBeenCalledWith(
                            "customer-123",
                            "New",
                            "Name"
                        );

                        expect(
                            result
                        ).toEqual(
                            updatedCustomer
                        );
                    }
                );

                it(
                    "should not update a deleted customer",
                    async () => {

                        const customer:
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
                                    "DELETED",

                                createdAt:
                                    new Date(),

                                updatedAt:
                                    new Date()
                            };

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        await expect(
                            customerService
                                .updateCustomer(
                                    "customer-123",
                                    {
                                        firstName:
                                            "New"
                                    }
                                )
                        ).rejects.toThrow(
                            "Deleted customer cannot be updated"
                        );

                        expect(
                            customerRepository
                                .update
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        describe(
            "updateStatus",
            () => {

                it(
                    "should update customer status",
                    async () => {

                        const customer:
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

                        const blockedCustomer:
                            Customer = {
                                ...customer,

                                status:
                                    "BLOCKED"
                            };

                        customerRepository
                            .findById
                            .mockResolvedValueOnce(
                                customer
                            )
                            .mockResolvedValueOnce(
                                blockedCustomer
                            );

                        customerRepository
                            .updateStatus
                            .mockResolvedValue(
                                true
                            );

                        const result =
                            await customerService
                                .updateStatus(
                                    "customer-123",
                                    "BLOCKED"
                                );

                        expect(
                            customerRepository
                                .updateStatus
                        ).toHaveBeenCalledWith(
                            "customer-123",
                            "BLOCKED"
                        );

                        expect(
                            result
                        ).toEqual(
                            blockedCustomer
                        );
                    }
                );

                it(
                    "should reject status change for deleted customer",
                    async () => {

                        const customer:
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
                                    "DELETED",

                                createdAt:
                                    new Date(),

                                updatedAt:
                                    new Date()
                            };

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        await expect(
                            customerService
                                .updateStatus(
                                    "customer-123",
                                    "ACTIVE"
                                )
                        ).rejects.toThrow(
                            "Deleted customer status cannot be changed"
                        );

                        expect(
                            customerRepository
                                .updateStatus
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should not allow DELETED through status update",
                    async () => {

                        const customer:
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

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        await expect(
                            customerService
                                .updateStatus(
                                    "customer-123",
                                    "DELETED"
                                )
                        ).rejects.toThrow(
                            "Use deleteCustomer to delete a customer"
                        );

                        expect(
                            customerRepository
                                .updateStatus
                        ).not.toHaveBeenCalled();
                    }
                );

                it(
                    "should return existing customer when status is unchanged",
                    async () => {

                        const customer:
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

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        const result =
                            await customerService
                                .updateStatus(
                                    "customer-123",
                                    "ACTIVE"
                                );

                        expect(
                            result
                        ).toEqual(
                            customer
                        );

                        expect(
                            customerRepository
                                .updateStatus
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        describe(
            "deleteCustomer",
            () => {

                it(
                    "should soft delete an active customer",
                    async () => {

                        const customer:
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

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        customerRepository
                            .delete
                            .mockResolvedValue(
                                true
                            );

                        await customerService
                            .deleteCustomer(
                                "customer-123"
                            );

                        expect(
                            customerRepository
                                .delete
                        ).toHaveBeenCalledWith(
                            "customer-123"
                        );
                    }
                );

                it(
                    "should do nothing when customer is already deleted",
                    async () => {

                        const customer:
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
                                    "DELETED",

                                createdAt:
                                    new Date(),

                                updatedAt:
                                    new Date()
                            };

                        customerRepository
                            .findById
                            .mockResolvedValue(
                                customer
                            );

                        await customerService
                            .deleteCustomer(
                                "customer-123"
                            );

                        expect(
                            customerRepository
                                .delete
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );
    }
);
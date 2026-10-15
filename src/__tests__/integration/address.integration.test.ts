import request from "supertest";

import { randomUUID } from "crypto";

import app from "../../app";

import { pool } from "../../config/database";

const apiRequest = (identityUserId: string) => ({
    get: (url: string) =>
        request(app).get(url).set("x-user-id", identityUserId),
    post: (url: string) =>
        request(app).post(url).set("x-user-id", identityUserId),
    patch: (url: string) =>
        request(app).patch(url).set("x-user-id", identityUserId),
    delete: (url: string) =>
        request(app).delete(url).set("x-user-id", identityUserId),
});

describe("Address API - Integration Tests", () => {

    const identityUserId = randomUUID();

    let customerId: string;

    let addressId: string;

    let secondAddressId: string;

    beforeAll(async () => {

        const customerResponse =
            await apiRequest(identityUserId)
                .post("/api/v1/customers")
                .send({
                    identityUserId,
                    firstName: "Address",
                    lastName: "Integration"
                });

        expect(customerResponse.status)
            .toBe(201);

        customerId =
            customerResponse.body.data.id;
    });

    afterAll(async () => {

        if (customerId) {

            await pool.execute(
                `
                DELETE FROM addresses
                WHERE customer_id = ?
                `,
                [customerId]
            );

            await pool.execute(
                `
                DELETE FROM customers
                WHERE id = ?
                `,
                [customerId]
            );
        }

        await pool.end();
    });

    describe(
        "POST /api/v1/customers/:customerId/addresses",
        () => {

            it(
                "should create an address",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .post(
                                `/api/v1/customers/${customerId}/addresses`
                            )
                            .send({
                                addressType: "HOME",
                                recipientName:
                                    "Address Integration",
                                addressLine1:
                                    "123 Test Street",
                                addressLine2:
                                    "Apartment 101",
                                city: "Noida",
                                state:
                                    "Uttar Pradesh",
                                postalCode: "201301",
                                country: "India",
                                phone: "9876543210",
                                isDefault: true
                            });

                    expect(response.status)
                        .toBe(201);

                    expect(response.body.success)
                        .toBe(true);

                    expect(response.body.data)
                        .toMatchObject({
                            customerId,
                            addressType: "HOME",
                            recipientName:
                                "Address Integration",
                            addressLine1:
                                "123 Test Street",
                            addressLine2:
                                "Apartment 101",
                            city: "Noida",
                            state:
                                "Uttar Pradesh",
                            postalCode: "201301",
                            country: "India",
                            phone: "9876543210",
                            isDefault: true,
                            status: "ACTIVE"
                        });

                    addressId =
                        response.body.data.id;

                    expect(addressId)
                        .toBeDefined();

                    /*
                     * Verify persistence.
                     */

                    const [rows] =
                        await pool.execute(
                            `
                            SELECT
                                id,
                                customer_id,
                                address_type,
                                recipient_name,
                                address_line1,
                                address_line2,
                                city,
                                state,
                                postal_code,
                                country,
                                phone,
                                is_default,
                                status
                            FROM addresses
                            WHERE id = ?
                            `,
                            [addressId]
                        );

                    const address =
                        (rows as any[])[0];

                    expect(address)
                        .toBeDefined();

                    expect(address.customer_id)
                        .toBe(customerId);

                    expect(address.address_type)
                        .toBe("HOME");

                    expect(address.is_default)
                        .toBe(1);

                    expect(address.status)
                        .toBe("ACTIVE");
                }
            );

            it(
                "should reject an address for an unknown customer",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .post(
                                `/api/v1/customers/${randomUUID()}/addresses`
                            )
                            .send({
                                addressType: "HOME",
                                recipientName:
                                    "Unknown Customer",
                                addressLine1:
                                    "123 Test Street",
                                city: "Noida",
                                state:
                                    "Uttar Pradesh",
                                postalCode: "201301"
                            });

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe("Customer not found");
                }
            );
        }
    );

    describe(
        "GET /api/v1/customers/:customerId/addresses",
        () => {

            it(
                "should return customer addresses",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${customerId}/addresses`
                            );

                    expect(response.status)
                        .toBe(200);

                    expect(response.body.success)
                        .toBe(true);

                    expect(
                        response.body.data
                    ).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                id: addressId,
                                customerId,
                                addressType: "HOME",
                                isDefault: true,
                                status: "ACTIVE"
                            })
                        ])
                    );
                }
            );

            it(
                "should return 404 for an unknown customer",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${randomUUID()}/addresses`
                            );

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe("Customer not found");
                }
            );
        }
    );

    describe(
        "GET /api/v1/customers/:customerId/addresses/:addressId",
        () => {

            it(
                "should return an address by ID",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${customerId}/addresses/${addressId}`
                            );

                    expect(response.status)
                        .toBe(200);

                    expect(response.body.success)
                        .toBe(true);

                    expect(response.body.data)
                        .toMatchObject({
                            id: addressId,
                            customerId,
                            addressType: "HOME",
                            recipientName:
                                "Address Integration",
                            city: "Noida",
                            state:
                                "Uttar Pradesh",
                            postalCode:
                                "201301",
                            isDefault: true,
                            status: "ACTIVE"
                        });
                }
            );

            it(
                "should reject an address belonging to another customer",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${randomUUID()}/addresses/${addressId}`
                            );

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe(
                            "Address does not belong to customer"
                        );
                }
            );

            it(
                "should return 404 for an unknown address",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${customerId}/addresses/${randomUUID()}`
                            );

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe("Address not found");
                }
            );
        }
    );

    describe("Ownership regressions", () => {

        const otherIdentityUserId = randomUUID();

        it(
            "should reject create address when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .post(
                            `/api/v1/customers/${customerId}/addresses`
                        )
                        .send({
                            addressType: "HOME",
                            recipientName:
                                "No Identity",
                            addressLine1:
                                "1 Test Street",
                            city: "Noida",
                            state:
                                "Uttar Pradesh",
                            postalCode: "201301"
                        });

                expect(response.status)
                    .toBe(401);

                expect(response.body.error.message)
                    .toBe(
                        "Authenticated identity is required"
                    );
            }
        );

        it(
            "should reject create address when customer belongs to another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .post(
                            `/api/v1/customers/${customerId}/addresses`
                        )
                        .send({
                            addressType: "HOME",
                            recipientName:
                                "Cross Identity",
                            addressLine1:
                                "1 Test Street",
                            city: "Noida",
                            state:
                                "Uttar Pradesh",
                            postalCode: "201301"
                        });

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject listing addresses when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .get(
                            `/api/v1/customers/${customerId}/addresses`
                        );

                expect(response.status)
                    .toBe(401);

                expect(response.body.error.message)
                    .toBe(
                        "Authenticated identity is required"
                    );
            }
        );

        it(
            "should reject listing addresses when customer belongs to another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .get(
                            `/api/v1/customers/${customerId}/addresses`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject fetching an address when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .get(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        );

                expect(response.status)
                    .toBe(401);

                expect(response.body.error.message)
                    .toBe(
                        "Authenticated identity is required"
                    );
            }
        );

        it(
            "should reject fetching an address when customer belongs to another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .get(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject updating an address when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .patch(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        )
                        .send({
                            city: "No Identity"
                        });

                expect(response.status)
                    .toBe(401);

                expect(response.body.error.message)
                    .toBe(
                        "Authenticated identity is required"
                    );
            }
        );

        it(
            "should reject updating an address when customer belongs to another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        )
                        .send({
                            city: "Hacked"
                        });

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject deleting an address when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .delete(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        );

                expect(response.status)
                    .toBe(401);

                expect(response.body.error.message)
                    .toBe(
                        "Authenticated identity is required"
                    );
            }
        );

        it(
            "should reject deleting an address when customer belongs to another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .delete(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );
    });

    describe("Default address behavior", () => {

        it(
            "should clear the previous default address when a new default is created",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .post(
                            `/api/v1/customers/${customerId}/addresses`
                        )
                        .send({
                            addressType: "WORK",
                            recipientName:
                                "Work Address",
                            addressLine1:
                                "456 Office Street",
                            city: "Noida",
                            state:
                                "Uttar Pradesh",
                            postalCode: "201302",
                            country: "India",
                            isDefault: true
                        });

                expect(response.status)
                    .toBe(201);

                secondAddressId =
                    response.body.data.id;

                expect(
                    response.body.data.isDefault
                ).toBe(true);

                const [rows] =
                    await pool.execute(
                        `
                        SELECT
                            id,
                            is_default
                        FROM addresses
                        WHERE customer_id = ?
                          AND status = 'ACTIVE'
                        ORDER BY created_at
                        `,
                        [customerId]
                    );

                const addresses =
                    rows as any[];

                const firstAddress =
                    addresses.find(
                        address =>
                            address.id ===
                            addressId
                    );

                const secondAddress =
                    addresses.find(
                        address =>
                            address.id ===
                            secondAddressId
                    );

                expect(firstAddress)
                    .toBeDefined();

                expect(secondAddress)
                    .toBeDefined();

                expect(
                    firstAddress.is_default
                ).toBe(0);

                expect(
                    secondAddress.is_default
                ).toBe(1);
            }
        );

        it(
            "should clear the previous default when an existing address becomes default",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}/addresses/${addressId}`
                        )
                        .send({
                            isDefault: true
                        });

                expect(response.status)
                    .toBe(200);

                expect(
                    response.body.data.isDefault
                ).toBe(true);

                const [rows] =
                    await pool.execute(
                        `
                        SELECT
                            id,
                            is_default
                        FROM addresses
                        WHERE customer_id = ?
                          AND status = 'ACTIVE'
                        `,
                        [customerId]
                    );

                const addresses =
                    rows as any[];

                const firstAddress =
                    addresses.find(
                        address =>
                            address.id ===
                            addressId
                    );

                const secondAddress =
                    addresses.find(
                        address =>
                            address.id ===
                            secondAddressId
                    );

                expect(
                    firstAddress.is_default
                ).toBe(1);

                expect(
                    secondAddress.is_default
                ).toBe(0);
            }
        );
    });

    describe(
        "PATCH /api/v1/customers/:customerId/addresses/:addressId",
        () => {

            it(
                "should update an address",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .patch(
                                `/api/v1/customers/${customerId}/addresses/${addressId}`
                            )
                            .send({
                                addressLine1:
                                    "999 Updated Street",
                                city: "Greater Noida",
                                postalCode:
                                    "201310",
                                phone:
                                    "9999999999"
                            });

                    expect(response.status)
                        .toBe(200);

                    expect(response.body.success)
                        .toBe(true);

                    expect(response.body.data)
                        .toMatchObject({
                            id: addressId,
                            customerId,
                            addressLine1:
                                "999 Updated Street",
                            city: "Greater Noida",
                            postalCode:
                                "201310",
                            phone:
                                "9999999999"
                        });
                }
            );
        }
    );

    describe(
        "DELETE /api/v1/customers/:customerId/addresses/:addressId",
        () => {

            it(
                "should soft delete an address",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .delete(
                                `/api/v1/customers/${customerId}/addresses/${addressId}`
                            );

                    expect(response.status)
                        .toBe(204);

                    const [rows] =
                        await pool.execute(
                            `
                            SELECT
                                id,
                                status
                            FROM addresses
                            WHERE id = ?
                            `,
                            [addressId]
                        );

                    const address =
                        (rows as any[])[0];

                    expect(address)
                        .toBeDefined();

                    expect(address.status)
                        .toBe("DELETED");
                }
            );

            it(
                "should not return a deleted address",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/${customerId}/addresses/${addressId}`
                            );

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe("Address not found");
                }
            );
        }
    );

});
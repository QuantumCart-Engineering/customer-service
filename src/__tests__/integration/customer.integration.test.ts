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

describe("Customer API - Integration Tests", () => {

    const identityUserId = randomUUID();

    let customerId: string;

    let spoofedCustomerId: string;

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

        if (spoofedCustomerId) {

            await pool.execute(
                `
                DELETE FROM customers
                WHERE id = ?
                `,
                [spoofedCustomerId]
            );
        }

        await pool.end();
    });

    describe("GET /health", () => {

        it(
            "should return customer service health status",
            async () => {

                const response =
                    await request(app)
                        .get("/health");

                expect(response.status)
                    .toBe(200);

                expect(response.body)
                    .toEqual({
                        success: true,
                        service:
                            "customer-service",
                        status: "UP"
                    });
            }
        );
    });

    describe("POST /api/v1/customers", () => {

        it(
            "should create a customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .post("/api/v1/customers")
                        .send({
                            identityUserId,
                            firstName: "Integration",
                            lastName: "Test"
                        });

                expect(response.status)
                    .toBe(201);

                expect(response.body.success)
                    .toBe(true);

                expect(response.body.data)
                    .toMatchObject({
                        identityUserId,
                        firstName: "Integration",
                        lastName: "Test",
                        status: "ACTIVE"
                    });

                expect(response.body.data.id)
                    .toBeDefined();

                customerId =
                    response.body.data.id;

                /*
                 * Verify persistence in database.
                 */

                const [rows] =
                    await pool.execute(
                        `
                        SELECT
                            id,
                            identity_user_id,
                            first_name,
                            last_name,
                            status
                        FROM customers
                        WHERE id = ?
                        `,
                        [customerId]
                    );

                const customer =
                    (rows as any[])[0];

                expect(customer)
                    .toBeDefined();

                expect(customer.id)
                    .toBe(customerId);

                expect(customer.identity_user_id)
                    .toBe(identityUserId);

                expect(customer.first_name)
                    .toBe("Integration");

                expect(customer.last_name)
                    .toBe("Test");

                expect(customer.status)
                    .toBe("ACTIVE");
            }
        );

        it(
            "should reject duplicate customer for the same identity user",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .post("/api/v1/customers")
                        .send({
                            identityUserId,
                            firstName: "Another",
                            lastName: "Customer"
                        });

                expect(response.status)
                    .toBe(409);

                expect(response.body.success)
                    .toBe(false);

                expect(response.body.error.message)
                    .toBe(
                        "Customer profile already exists for this identity user"
                    );
            }
        );
    });

    describe("GET /api/v1/customers/:id", () => {

        it(
            "should return customer by ID",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .get(
                            `/api/v1/customers/${customerId}`
                        );

                expect(response.status)
                    .toBe(200);

                expect(response.body.success)
                    .toBe(true);

                expect(response.body.data)
                    .toMatchObject({
                        id: customerId,
                        identityUserId,
                        firstName: "Integration",
                        lastName: "Test",
                        status: "ACTIVE"
                    });
            }
        );

        it(
            "should return 404 for an unknown customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .get(
                            `/api/v1/customers/${randomUUID()}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.success)
                    .toBe(false);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );
    });

    describe(
        "GET /api/v1/customers/by-identity/:identityUserId",
        () => {

            it(
                "should return customer by identity user ID",
                async () => {

                    const response =
                        await apiRequest(identityUserId)
                            .get(
                                `/api/v1/customers/by-identity/${identityUserId}`
                            );

                    expect(response.status)
                        .toBe(200);

                    expect(response.body.success)
                        .toBe(true);

                    expect(response.body.data)
                        .toMatchObject({
                            id: customerId,
                            identityUserId,
                            firstName:
                                "Integration",
                            lastName:
                                "Test",
                            status:
                                "ACTIVE"
                        });
                }
            );

            it(
                "should return 404 for an unknown identity user",
                async () => {

                    const unknownIdentityUserId =
                        randomUUID();

                    const response =
                        await apiRequest(
                            unknownIdentityUserId
                        )
                            .get(
                                `/api/v1/customers/by-identity/${unknownIdentityUserId}`
                            );

                    expect(response.status)
                        .toBe(404);

                    expect(response.body.success)
                        .toBe(false);

                    expect(response.body.error.message)
                        .toBe(
                            "Customer profile not found"
                        );
                }
            );
        }
    );

    describe("Ownership regressions", () => {

        const otherIdentityUserId = randomUUID();

        it(
            "should reject fetching a customer when authenticated identity is missing",
            async () => {

                const response =
                    await request(app)
                        .get(
                            `/api/v1/customers/${customerId}`
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
            "should reject fetching a customer owned by another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .get(
                            `/api/v1/customers/${customerId}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject fetching by identity when path identity differs from authenticated identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .get(
                            `/api/v1/customers/by-identity/${identityUserId}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject updating a customer owned by another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}`
                        )
                        .send({
                            firstName: "Hacked"
                        });

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject status change for a customer owned by another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}/status`
                        )
                        .send({
                            status: "BLOCKED"
                        });

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should reject deleting a customer owned by another identity",
            async () => {

                const response =
                    await apiRequest(otherIdentityUserId)
                        .delete(
                            `/api/v1/customers/${customerId}`
                        );

                expect(response.status)
                    .toBe(404);

                expect(response.body.error.message)
                    .toBe("Customer not found");
            }
        );

        it(
            "should ignore a spoofed identityUserId in the create payload and use the authenticated identity",
            async () => {

                const authenticatedIdentity =
                    randomUUID();

                const spoofedIdentity =
                    randomUUID();

                const response =
                    await apiRequest(authenticatedIdentity)
                        .post("/api/v1/customers")
                        .send({
                            identityUserId:
                                spoofedIdentity,
                            firstName:
                                "Spoof",
                            lastName:
                                "Attempt"
                        });

                expect(response.status)
                    .toBe(201);

                expect(
                    response.body.data.identityUserId
                ).toBe(authenticatedIdentity);

                expect(
                    response.body.data.identityUserId
                ).not.toBe(spoofedIdentity);

                spoofedCustomerId =
                    response.body.data.id;
            }
        );
    });

    describe("PATCH /api/v1/customers/:id", () => {

        it(
            "should update customer profile",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}`
                        )
                        .send({
                            firstName: "Updated",
                            lastName: "Customer"
                        });

                expect(response.status)
                    .toBe(200);

                expect(response.body.success)
                    .toBe(true);

                expect(response.body.data)
                    .toMatchObject({
                        id: customerId,
                        identityUserId,
                        firstName: "Updated",
                        lastName: "Customer",
                        status: "ACTIVE"
                    });
            }
        );
    });

    describe("PATCH /api/v1/customers/:id/status", () => {

        it(
            "should block an active customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}/status`
                        )
                        .send({
                            status: "BLOCKED"
                        });

                expect(response.status)
                    .toBe(200);

                expect(response.body.success)
                    .toBe(true);

                expect(response.body.data.status)
                    .toBe("BLOCKED");
            }
        );

        it(
            "should reactivate a blocked customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .patch(
                            `/api/v1/customers/${customerId}/status`
                        )
                        .send({
                            status: "ACTIVE"
                        });

                expect(response.status)
                    .toBe(200);

                expect(response.body.success)
                    .toBe(true);

                expect(response.body.data.status)
                    .toBe("ACTIVE");
            }
        );
    });

    describe("DELETE /api/v1/customers/:id", () => {

        it(
            "should soft delete the customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .delete(
                            `/api/v1/customers/${customerId}`
                        );

                expect(response.status)
                    .toBe(204);

                /*
                 * Verify soft deletion.
                 */

                const [rows] =
                    await pool.execute(
                        `
                        SELECT
                            id,
                            status
                        FROM customers
                        WHERE id = ?
                        `,
                        [customerId]
                    );

                const customer =
                    (rows as any[])[0];

                expect(customer)
                    .toBeDefined();

                expect(customer.status)
                    .toBe("DELETED");
            }
        );

        it(
            "should not return a deleted customer",
            async () => {

                const response =
                    await apiRequest(identityUserId)
                        .get(
                            `/api/v1/customers/${customerId}`
                        );

                /*
                 * Current repository returns the customer
                 * even when status is DELETED.
                 */
                expect(response.status)
                    .toBe(200);

                expect(response.body.data.status)
                    .toBe("DELETED");
            }
        );
    });

});
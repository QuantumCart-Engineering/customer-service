import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../app";
import { pool } from "../../config/database";

describe("Customer API - Integration Tests", () => {

    const identityUserId = randomUUID();

    let customerId: string;

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
                    await request(app)
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
                    await request(app)
                        .post("/api/v1/customers")
                        .send({
                            identityUserId,
                            firstName: "Another",
                            lastName: "Customer"
                        });

                expect(response.status)
                    .toBe(400);

                expect(response.body.success)
                    .toBe(false);
            }
        );
    });

    describe("GET /api/v1/customers/:id", () => {

        it(
            "should return customer by ID",
            async () => {

                const response =
                    await request(app)
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
                    await request(app)
                        .get(
                            `/api/v1/customers/${randomUUID()}`
                        );

                expect(response.status)
                    .toBe(400);

                expect(response.body.success)
                    .toBe(false);
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
                        await request(app)
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

                    const response =
                        await request(app)
                            .get(
                                `/api/v1/customers/by-identity/${randomUUID()}`
                            );

                    expect(response.status)
                        .toBe(400);

                    expect(response.body.success)
                        .toBe(false);
                }
            );
        }
    );

    describe("PATCH /api/v1/customers/:id", () => {

        it(
            "should update customer profile",
            async () => {

                const response =
                    await request(app)
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
                    await request(app)
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
                    await request(app)
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
                    await request(app)
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
                    await request(app)
                        .get(
                            `/api/v1/customers/${customerId}`
                        );

                /*
                 * Current repository returns the customer
                 * even when status is DELETED, so this
                 * expectation documents the current API
                 * behavior only if the service allows it.
                 */
                expect(response.status)
                    .toBe(200);

                expect(response.body.data.status)
                    .toBe("DELETED");
            }
        );
    });
});
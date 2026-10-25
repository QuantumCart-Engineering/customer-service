
import { Router } from "express";

import {
    CustomerController
} from "../controllers/customer.controller";

import {
    CustomerService
} from "../services/customer.service";

import {
    CustomerRepository
} from "../repositories/customer.repository";

import {
    CustomerReportController
} from "../controllers/customer-report.controller";

import {
    CustomerReportRepository
} from "../repositories/customer-report.repository";

import {
    CustomerReportService
} from "../services/customer-report.service";

const router = Router();

const customerRepository =
    new CustomerRepository();

const customerService =
    new CustomerService(
        customerRepository
    );

const customerController =
    new CustomerController(
        customerService
    );

const customerReportController =
    new CustomerReportController(
        new CustomerReportService(
            new CustomerReportRepository()
        )
    );

/**
 * @swagger
 * /api/v1/customers/reports/summary:
 *   get:
 *     tags:
 *       - Customer Reports
 *     summary: Customer analytics summary (admin)
 *     description: Total, active, blocked and new customers for a date range.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Summary returned successfully
 *       '400':
 *         description: Invalid date range
 *       '401':
 *         description: Authentication required
 *       '403':
 *         description: Administrator role required
 */
router.get(
    "/reports/summary",
    customerReportController.getSummary
);

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     tags:
 *       - Customers
 *     summary: Create a customer profile
 *     description: Creates a customer profile linked to an Identity Service user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomerRequest'
 *     responses:
 *       '201':
 *         description: Customer profile created successfully
 *       '400':
 *         description: Invalid customer data
 *       '409':
 *         description: Customer profile already exists for this identity user
 *       '500':
 *         description: Internal server error
 */
router.post(
    "/",
    customerController.createCustomer
);

/**
 * @swagger
 * /api/v1/customers/by-identity/{identityUserId}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Get customer by Identity Service user ID
 *     description: Retrieves a customer profile using its linked identity user ID.
 *     parameters:
 *       - in: path
 *         name: identityUserId
 *         required: true
 *         description: UUID of the Identity Service user
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Customer profile retrieved successfully
 *       '400':
 *         description: Invalid identity user ID
 *       '404':
 *         description: Customer profile not found
 *       '500':
 *         description: Internal server error
 */
router.get(
    "/by-identity/:identityUserId",
    customerController.getCustomerByIdentityUserId
);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Get customer by ID
 *     description: Retrieves a customer profile by its customer ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Customer profile retrieved successfully
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal server error
 */
router.get(
    "/:id",
    customerController.getCustomer
);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   patch:
 *     tags:
 *       - Customers
 *     summary: Update customer profile
 *     description: Updates the customer's profile fields.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerRequest'
 *     responses:
 *       '200':
 *         description: Customer profile updated successfully
 *       '400':
 *         description: Invalid customer data
 *       '404':
 *         description: Customer not found
 *       '409':
 *         description: Customer profile cannot be updated in its current state
 *       '500':
 *         description: Internal server error
 */
router.patch(
    "/:id",
    customerController.updateCustomer
);

/**
 * @swagger
 * /api/v1/customers/{id}/status:
 *   patch:
 *     tags:
 *       - Customers
 *     summary: Update customer status
 *     description: Updates the status of a customer profile.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomerStatusRequest'
 *     responses:
 *       '200':
 *         description: Customer status updated successfully
 *       '400':
 *         description: Invalid status value
 *       '404':
 *         description: Customer not found
 *       '409':
 *         description: Customer status cannot be changed in its current state
 *       '500':
 *         description: Internal server error
 */
router.patch(
    "/:id/status",
    customerController.updateStatus
);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     summary: Soft-delete customer profile
 *     description: Marks a customer profile as deleted without physically removing its database record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Customer profile deleted successfully
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal server error
 */
router.delete(
    "/:id",
    customerController.deleteCustomer
);

export default router;

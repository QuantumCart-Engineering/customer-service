
import { Router } from "express";

import { AddressController } from "../controllers/address.controller";
import { AddressService } from "../services/address.service";
import { AddressRepository } from "../repositories/address.repository";
import { CustomerRepository } from "../repositories/customer.repository";

const router = Router();

const addressRepository =
    new AddressRepository();

const customerRepository =
    new CustomerRepository();

const addressService =
    new AddressService(
        addressRepository,
        customerRepository
    );

const addressController =
    new AddressController(
        addressService
    );

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses:
 *   post:
 *     tags:
 *       - Addresses
 *     summary: Create customer address
 *     description: Creates a new address for an existing customer.
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *             $ref: '#/components/schemas/CreateAddressRequest'
 *     responses:
 *       '201':
 *         description: Address created successfully
 *       '400':
 *         description: Invalid address data
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal server error
 */
router.post(
    "/customers/:customerId/addresses",
    addressController.createAddress
);

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses:
 *   get:
 *     tags:
 *       - Addresses
 *     summary: Get customer addresses
 *     description: Retrieves the addresses associated with a customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Customer addresses retrieved successfully
 *       '404':
 *         description: Customer not found
 *       '500':
 *         description: Internal server error
 */
router.get(
    "/customers/:customerId/addresses",
    addressController.getCustomerAddresses
);

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses/{addressId}:
 *   get:
 *     tags:
 *       - Addresses
 *     summary: Get address by ID
 *     description: Retrieves a specific address belonging to the specified customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: UUID of the address
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Address retrieved successfully
 *       '404':
 *         description: Address not found or does not belong to the customer
 *       '500':
 *         description: Internal server error
 */
router.get(
    "/customers/:customerId/addresses/:addressId",
    addressController.getAddress
);

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses/{addressId}:
 *   patch:
 *     tags:
 *       - Addresses
 *     summary: Update customer address
 *     description: Updates the specified address belonging to a customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: UUID of the address
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressRequest'
 *     responses:
 *       '200':
 *         description: Address updated successfully
 *       '400':
 *         description: Invalid address data
 *       '404':
 *         description: Customer or address not found
 *       '500':
 *         description: Internal server error
 */
router.patch(
    "/customers/:customerId/addresses/:addressId",
    addressController.updateAddress
);

/**
 * @swagger
 * /api/v1/customers/{customerId}/addresses/{addressId}:
 *   delete:
 *     tags:
 *       - Addresses
 *     summary: Delete customer address
 *     description: Deletes the specified address belonging to a customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: UUID of the customer
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: UUID of the address
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Address deleted successfully
 *       '404':
 *         description: Customer or address not found
 *       '500':
 *         description: Internal server error
 */
router.delete(
    "/customers/:customerId/addresses/:addressId",
    addressController.deleteAddress
);

export default router;

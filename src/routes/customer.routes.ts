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

router.post(
    "/",
    customerController.createCustomer
);

router.get(
    "/by-identity/:identityUserId",
    customerController.getCustomerByIdentityUserId
);

router.get(
    "/:id",
    customerController.getCustomer
);

router.patch(
    "/:id",
    customerController.updateCustomer
);

router.patch(
    "/:id/status",
    customerController.updateStatus
);

router.delete(
    "/:id",
    customerController.deleteCustomer
);

export default router;
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

router.post(
    "/customers/:customerId/addresses",
    addressController.createAddress
);

router.get(
    "/customers/:customerId/addresses",
    addressController.getCustomerAddresses
);

router.get(
    "/customers/:customerId/addresses/:addressId",
    addressController.getAddress
);

router.patch(
    "/customers/:customerId/addresses/:addressId",
    addressController.updateAddress
);

router.delete(
    "/customers/:customerId/addresses/:addressId",
    addressController.deleteAddress
);

export default router;
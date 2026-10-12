
import { Router } from "express";

import customerRoutes from "./customer.routes";
import addressRoutes from "./address.routes";

const router = Router();

// Customer profile endpoints:
// /customers/*
router.use(
    "/customers",
    customerRoutes
);

// Customer address endpoints:
// /customers/:customerId/addresses/*
router.use(
    "/",
    addressRoutes
);

export default router;

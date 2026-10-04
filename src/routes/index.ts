import { Router } from "express";

import customerRoutes from "./customer.routes";
import addressRoutes from "./address.routes";

const router = Router();

router.use(
    "/customers",
    customerRoutes
);

router.use(
    "/",
    addressRoutes
);

export default router;
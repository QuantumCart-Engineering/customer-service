import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(
    helmet()
);

app.use(
    cors()
);

app.use(
    express.json()
);

app.get(
    "/health",
    (_req, res) => {
        res.status(200).json({
            success: true,
            service: "customer-service",
            status: "UP"
        });
    }
);

app.use(
    "/api/v1",
    routes
);

app.use(
    errorMiddleware
);

export default app;
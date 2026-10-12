import {
    NextFunction,
    Request,
    Response
} from "express";

import { AppError } from "../errors/app.error";

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    console.error(error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message
            }
        });

        return;
    }

    if (error instanceof Error) {
        res.status(500).json({
            success: false,
            error: {
                message: "Internal server error"
            }
        });

        return;
    }

    res.status(500).json({
        success: false,
        error: {
            message: "Internal server error"
        }
    });
};
import {
    NextFunction,
    Request,
    Response
} from "express";

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    console.error(error);

    if (error instanceof Error) {
        res.status(400).json({
            success: false,
            error: {
                message: error.message
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
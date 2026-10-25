import {
    Request,
    Response
} from "express";

import {
    CustomerReportService
} from "../services/customer-report.service";

import {
    parseDateRange
} from "../utils/date-range";

export class CustomerReportController {

    constructor(
        private readonly reportService:
            CustomerReportService
    ) {}

    getSummary = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const range = parseDateRange(
            req.query.from,
            req.query.to
        );

        const data =
            await this.reportService.getSummary(
                range
            );

        res.status(200).json({
            success: true,
            data
        });
    };
}

import {
    CustomerReportRepository
} from "../repositories/customer-report.repository";

import type { DateRange } from "../utils/date-range";

export class CustomerReportService {

    constructor(
        private readonly repository:
            CustomerReportRepository
    ) {}

    async getSummary(range: DateRange) {

        const summary =
            await this.repository.getSummary(
                range.start,
                range.endExclusive
            );

        return {
            range: {
                from: range.from,
                to: range.to
            },
            ...summary
        };
    }
}

import {
    CustomerReportService
} from "../../services/customer-report.service";

import type {
    CustomerReportRepository
} from "../../repositories/customer-report.repository";

import type { DateRange } from "../../utils/date-range";

const range: DateRange = {
    from: "2026-03-01",
    to: "2026-03-31",
    start: "2026-03-01 00:00:00",
    endExclusive: "2026-04-01 00:00:00"
};

describe("CustomerReportService", () => {

    it("returns the repository summary scoped to the range", async () => {
        const repository = {
            getSummary: jest.fn().mockResolvedValue({
                totalCustomers: 5,
                activeCustomers: 4,
                blockedCustomers: 0,
                deletedCustomers: 1,
                newCustomers: 2
            })
        };

        const service = new CustomerReportService(
            repository as unknown as CustomerReportRepository
        );

        const result = await service.getSummary(range);

        expect(
            repository.getSummary
        ).toHaveBeenCalledWith(
            range.start,
            range.endExclusive
        );

        expect(result).toEqual({
            range: {
                from: "2026-03-01",
                to: "2026-03-31"
            },
            totalCustomers: 5,
            activeCustomers: 4,
            blockedCustomers: 0,
            deletedCustomers: 1,
            newCustomers: 2
        });
    });
});

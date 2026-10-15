
import {
    Request,
    Response
} from "express";

import {
    CreateCustomerDto,
    UpdateCustomerDto
} from "../dto/customer.dto";

import {
    CustomerService
} from "../services/customer.service";

import { AppError } from "../errors/app.error";

interface CustomerParams {
    id: string;
}

interface IdentityUserParams {
    identityUserId: string;
}

export class CustomerController {

    constructor(
        private readonly customerService:
            CustomerService
    ) { }

    private getAuthenticatedIdentity(
        req: { headers: Request["headers"] }
    ): string {

        const identityUserId =
            req.headers["x-user-id"];

        if (
            typeof identityUserId !== "string" ||
            !identityUserId.trim()
        ) {
            throw new AppError(
                "Authenticated identity is required",
                401
            );
        }

        return identityUserId.trim();
    }

    createCustomer = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const dto: CreateCustomerDto = {
            ...req.body,
            identityUserId
        };

        const customer =
            await this.customerService.createCustomer(
                dto
            );

        res.status(201).json({
            success: true,
            data: customer
        });
    };

    getCustomer = async (
        req: Request<CustomerParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const customer =
            await this.customerService
                .getCustomerByIdForIdentity(
                    req.params.id,
                    identityUserId
                );

        res.status(200).json({
            success: true,
            data: customer
        });
    };

    getCustomerByIdentityUserId = async (
        req: Request<IdentityUserParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const customer =
            await this.customerService
                .getCustomerByIdentityForIdentity(
                    req.params.identityUserId,
                    identityUserId
                );

        res.status(200).json({
            success: true,
            data: customer
        });
    };

    updateCustomer = async (
        req: Request<CustomerParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const dto =
            req.body as UpdateCustomerDto;

        const customer =
            await this.customerService.updateCustomer(
                req.params.id,
                identityUserId,
                dto
            );

        res.status(200).json({
            success: true,
            data: customer
        });
    };

    updateStatus = async (
        req: Request<CustomerParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const customer =
            await this.customerService.updateStatus(
                req.params.id,
                identityUserId,
                req.body.status
            );

        res.status(200).json({
            success: true,
            data: customer
        });
    };

    deleteCustomer = async (
        req: Request<CustomerParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        await this.customerService.deleteCustomer(
            req.params.id,
            identityUserId
        );

        res.status(204).send();
    };
}

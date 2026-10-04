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
    ) {}

    createCustomer = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const dto =
            req.body as CreateCustomerDto;

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

        const customer =
            await this.customerService.getCustomerById(
                req.params.id
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

        const customer =
            await this.customerService
                .getCustomerByIdentityUserId(
                    req.params.identityUserId
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

        const dto =
            req.body as UpdateCustomerDto;

        const customer =
            await this.customerService.updateCustomer(
                req.params.id,
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

        const customer =
            await this.customerService.updateStatus(
                req.params.id,
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

        await this.customerService.deleteCustomer(
            req.params.id
        );

        res.status(204).send();
    };
}
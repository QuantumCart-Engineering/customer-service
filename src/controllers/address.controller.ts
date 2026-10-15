import {
    Request,
    Response
} from "express";

import {
    CreateAddressDto,
    UpdateAddressDto
} from "../dto/address.dto";

import {
    AddressService
} from "../services/address.service";

import { AppError } from "../errors/app.error";

interface AddressParams {
    customerId: string;
    addressId: string;
}

export class AddressController {

    constructor(
        private readonly addressService:
            AddressService
    ) {}

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

    createAddress = async (
        req: Request<
            Pick<AddressParams, "customerId">
        >,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const dto =
            req.body as CreateAddressDto;

        const address =
            await this.addressService.createAddress(
                req.params.customerId,
                identityUserId,
                dto
            );

        res.status(201).json({
            success: true,
            data: address
        });
    };

    getAddress = async (
        req: Request<AddressParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const address =
            await this.addressService.getAddressById(
                req.params.customerId,
                identityUserId,
                req.params.addressId
            );

        res.status(200).json({
            success: true,
            data: address
        });
    };

    getCustomerAddresses = async (
        req: Request<
            Pick<AddressParams, "customerId">
        >,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const addresses =
            await this.addressService.getCustomerAddresses(
                req.params.customerId,
                identityUserId
            );

        res.status(200).json({
            success: true,
            data: addresses
        });
    };

    updateAddress = async (
        req: Request<AddressParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        const dto =
            req.body as UpdateAddressDto;

        const address =
            await this.addressService.updateAddress(
                req.params.customerId,
                identityUserId,
                req.params.addressId,
                dto
            );

        res.status(200).json({
            success: true,
            data: address
        });
    };

    deleteAddress = async (
        req: Request<AddressParams>,
        res: Response
    ): Promise<void> => {

        const identityUserId =
            this.getAuthenticatedIdentity(req);

        await this.addressService.deleteAddress(
            req.params.customerId,
            identityUserId,
            req.params.addressId
        );

        res.status(204).send();
    };
}
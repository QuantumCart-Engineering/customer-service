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

interface AddressParams {
    customerId: string;
    addressId: string;
}

export class AddressController {

    constructor(
        private readonly addressService:
            AddressService
    ) {}

    createAddress = async (
        req: Request<
            Pick<AddressParams, "customerId">
        >,
        res: Response
    ): Promise<void> => {

        const dto =
            req.body as CreateAddressDto;

        const address =
            await this.addressService.createAddress(
                req.params.customerId,
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

        const address =
            await this.addressService.getAddressById(
                req.params.customerId,
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

        const addresses =
            await this.addressService.getCustomerAddresses(
                req.params.customerId
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

        const dto =
            req.body as UpdateAddressDto;

        const address =
            await this.addressService.updateAddress(
                req.params.customerId,
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

        await this.addressService.deleteAddress(
            req.params.customerId,
            req.params.addressId
        );

        res.status(204).send();
    };
}
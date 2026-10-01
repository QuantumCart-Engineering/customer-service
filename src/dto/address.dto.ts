import {
    AddressType
} from "../entities/address.entity";

export interface CreateAddressDto {
    addressType?: AddressType;
    recipientName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    phone?: string | null;
    isDefault?: boolean;
}

export interface UpdateAddressDto {
    addressType?: AddressType;
    recipientName?: string;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string | null;
    isDefault?: boolean;
}
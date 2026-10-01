export type AddressType =
    | "HOME"
    | "WORK"
    | "OTHER";

export type AddressStatus =
    | "ACTIVE"
    | "DELETED";

export interface Address {
    id: string;
    customerId: string;
    addressType: AddressType;
    recipientName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
    status: AddressStatus;
    createdAt: Date;
    updatedAt: Date;
}
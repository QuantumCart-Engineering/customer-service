export type CustomerStatus =
    | "ACTIVE"
    | "BLOCKED"
    | "DELETED";

export interface Customer {
    id: string;

    identityUserId: string;

    firstName: string;

    lastName: string | null;

    status: CustomerStatus;

    createdAt: Date;

    updatedAt: Date;
}
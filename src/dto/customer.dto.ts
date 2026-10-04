export interface CreateCustomerDto {
    identityUserId: string;

    firstName: string;

    lastName?: string | null;
}

export interface UpdateCustomerDto {
    firstName?: string;

    lastName?: string | null;
}
export interface CreateCustomerDto {
    firstName: string;
    lastName?: string | null;
}

export interface UpdateCustomerDto {
    firstName?: string;
    lastName?: string | null;
}

import { IsEmail, Length } from "class-validator";

export class CreateCustomerInputs {
    @IsEmail()
    email: string;

    @Length(10, 10, { message: 'Phone number must be 10 digits' })
    phone: number;

    @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
    password: string;
}

export class CustomerLoginInputs {
    @IsEmail()
    email: string;

    @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
    password: string;
}

export interface CustomerPayload {
    _id: string;
    email: string;
    verified: boolean;
}


export class OrderInputs {
    _id: string;
    unit: number
}
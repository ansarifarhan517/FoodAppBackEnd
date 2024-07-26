
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
    transactionId: string;
    amount: string
    items: [cartItem]
}

export class cartItem {
    _id: string;
    unit: number
}

export class CreateDeliveryUserInputs {
    @IsEmail()
    email: string;

    @Length(10, 10, { message: 'Phone number must be 10 digits' })
    phone: number;

    @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
    password: string;

    @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
    firstName: string;

    @Length(6, 12, { message: 'Password must be between 6 and 12 characters' })
    lastName: string;


    @Length(6, 24, { message: 'address must be between 6 and 24 characters' })
    address: string;


    @Length(4, 12, { message: 'Pincode must be between 4 and 12 characters' })
    pincode: string;



}
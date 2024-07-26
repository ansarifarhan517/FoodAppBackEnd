export interface CreateVendorInput {
    name: string;
    ownerName: string;
    foodType: string[];
    pincode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}

export interface VendorLoginInputs {
    email: string;
    password: string;

}

export interface VendorPayload{
    _id: string;
    email: string;
    name: string;
    foodTypes: [string];
}

export interface EditVendorInput {
    phone: string;
    address: string;
    name: string;
    foodTypes: [string];
}

export interface CreateOfferInputs {
    offerType: string;
    vendors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date,
    endValidity: Date;
    promoCode: string;
    promoType: string; //USER / ALL / BANK / CREDIT CARD  
    bins: [any],
    bank: [any];
    pinCode: string;
    isActive: boolean;
}
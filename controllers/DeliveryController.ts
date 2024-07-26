import { plainToClass } from "class-transformer";
import { CreateDeliveryUserInputs, CustomerLoginInputs } from "../dto/Customer.dto";
import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { GenerateOTP, GenerateSignature, onRequestOTP } from "../utility";
import { DeliveryUser } from "../models/Delivery";

export const DeliveryUserSignup = async (req: Request, res: Response, next: NextFunction) => {
    const deliveryInputs = plainToClass(CreateDeliveryUserInputs, req.body)
    const inputErrors = await validate(deliveryInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password, address, firstName, lastName, pincode } = req.body;

    const isExistingDeliveryUser = await DeliveryUser.findOne({ email });

    if (isExistingDeliveryUser) {
        return res.status(400).json({ "message": "Email Id already Exist" })
    }

    const { otp, expiry } = await GenerateOTP()
    console.log(otp, 'otp')
    console.log(expiry, 'expiry')

    const deliveryUser = await DeliveryUser.create({
        email,
        phone,
        password,
        firstName,
        lastName,
        address,
        pincode,
        verified: false,
        salt: "temp",
        isAvailable: false,
    })

    if (!deliveryUser) {
        return res.status(401).json({ "message": "Not Created" })
    }

    const signature = await GenerateSignature({
        // @ts-expect-error wil fix later
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified
    })
    return res.status(201).json({
        "message": "User Creted SuccesFully", signature, email: deliveryUser.email,
        verified: deliveryUser.verified
    })

}

export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(CustomerLoginInputs, req.body)
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, password } = req.body;

    const deliveryUser = await DeliveryUser.findOne({ email })

    if (!deliveryUser) {
        return res.status(401).json({ "message": "Invalid email" })
    }
    const isAuthentic = await DeliveryUser.matchPassword(email, password);

    if (!isAuthentic) {
        return res.status(400).json({ "message": "Invalid Password" })
    }

    const signature = await GenerateSignature({
        // @ts-expect-error will fix later
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified
    })

    return res.status(201).json({
        "message": "User Creted SuccesFully", signature, email: deliveryUser.email,
        verified: deliveryUser.verified
    })

}

export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => { }
export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => { }
export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => { }
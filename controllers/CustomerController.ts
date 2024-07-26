import { plainToClass } from "class-transformer"
import { NextFunction, Request, Response } from "express"
import { cartItem, CreateCustomerInputs, CustomerLoginInputs, OrderInputs } from "../dto/Customer.dto"
import { validate, ValidationError } from "class-validator"
import { Customer } from "../models/Customer"
import { GenerateOTP, GenerateSignature, onRequestOTP } from "../utility"
import { Food, Transaction, Vendor } from "../models"
import { Order } from "../models/Order"
import { Offer } from "../models/Offers"

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body;
    const customer = req.user;

    if (!customer) {
        return res.status(401).json({ "message": "User Not Authorized" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
        return res.status(401).json({ "message": "Profile not Present" });
    }

    if (profile.otp == otp && profile.otp_expiry >= new Date()) {
        profile.verified = true
        const updateCustomerProfile = await profile.save()
        const signature = await GenerateSignature({
            // @ts-expect-error wil fix later
            _id: updateCustomerProfile._id,
            email: updateCustomerProfile.email,
            verified: updateCustomerProfile.verified
        })
        res.status(201).json({
            signature,
            email: updateCustomerProfile.email,
            verified: updateCustomerProfile.verified
        })
    }

}

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body)
    const inputErrors = await validate(customerInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = req.body;

    const isExistingCustomer = await Customer.findOne({ email });

    if (isExistingCustomer) {
        return res.status(400).json({ "message": "Email Id already Exist" })
    }

    const { otp, expiry } = await GenerateOTP()
    console.log(otp, 'otp')
    console.log(expiry, 'expiry')

    const customer = await Customer.create({
        email,
        phone,
        password,
        otp,
        otp_expiry: expiry,
        verified: false,
        salt: "temp",
        orders: []
    })

    if (!customer) {
        return res.status(401).json({ "message": "Not Created" })
    }
    await onRequestOTP(otp, phone)

    const signature = await GenerateSignature({
        // @ts-expect-error wil fix later
        _id: customer._id,
        email: customer.email,
        verified: customer.verified
    })
    return res.status(201).json({
        "message": "User Creted SuccesFully", signature, email: customer.email,
        verified: customer.verified
    })

}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToClass(CustomerLoginInputs, req.body)
    const inputErrors = await validate(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, password } = req.body;

    const customer = await Customer.findOne({ email })

    if (!customer) {
        return res.status(401).json({ "message": "Invalid email" })
    }
    const isAuthentic = await Customer.matchPassword(email, password);

    if (!isAuthentic) {
        return res.status(400).json({ "message": "Invalid Password" })
    }

    const signature = await GenerateSignature({
        // @ts-expect-error will fix later
        _id: customer._id,
        email: customer.email,
        verified: customer.verified
    })

    return res.status(201).json({
        "message": "User Creted SuccesFully", signature, email: customer.email,
        verified: customer.verified
    })

}


export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id);

        if (profile) {
            const { otp, expiry } = await GenerateOTP();
            profile.otp = otp;
            profile.otp_expiry = expiry

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            res.status(200).json({ "message": `Otp sent to You Registered Number  ` })
        }
    }
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;

    if (customer) {
        const profile = await Customer.findById(customer._id);
        if (profile) {
            res.status(200).json(profile)
        }
    }
}

//-------------------> Delivery Notification

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
    //Find the Vendor 
    const vendor = await Vendor.findById(vendorId);
    if (vendor) {
        
    }

}

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    const { transactionId, amount, items } = <OrderInputs>req.body
    if (customer) {

        const currentTransaction = await Transaction.findById(transactionId)
        if (currentTransaction) {
            if (currentTransaction.status.toLowerCase() == 'failed') {

                const orderId = `${Math.floor(Math.random() * 89999) + 1000}`
                const profile = await Customer.findById(customer._id);

                if (!profile) {
                    return res.status(400).json({ "message": "Invalid Profile For Custoemr" })

                }
                let cartItems = Array(), netAmounts = 0, vendorId;
                //Calculate Order Amounts
                const foods = await Food.find().where('_id').in(items.map((item) => item._id)).exec();
                foods.map(food => {
                    items.map(({ _id, unit }) => {
                        if (food._id === _id) {
                            vendorId = food.vendorId
                            netAmounts += food.price * unit;
                            cartItems.push({ food, unit })

                        }
                    })
                })

                if (cartItems) {

                    //Create Order
                    const curentOrder = await Order.create({
                        vendorId: vendorId,
                        orderId: orderId,
                        items: cartItems,
                        totalAmount: netAmounts,
                        paidAmount: amount,
                        orderDate: new Date(),
                        orderStatus: 'waiting',
                        remarks: '',
                        deliveryId: '',
                        readyTime: 45
                    })

                    if (curentOrder) {
                        profile.cart = [] as any
                        profile?.orders.push(curentOrder);

                        currentTransaction.vendorId = vendorId || ''
                        currentTransaction.orderId = orderId;
                        currentTransaction.status = "CONFIRMED"

                        // assignOrderForDelivery(curentOrder._id, vendorId || '')
                        await currentTransaction.save();
                        await profile?.save();
                        return res.status(201).json(curentOrder)
                    }
                }
            } else {
                return res.status(400).json({ "message": "Eroor with Create Order" })

            }
        }
    }

}
export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    if (orderId) {
        const order = await Order.findById(orderId).populate('items.food')
        res.status(200).json(order)

    }
}
export const GetAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id);
        if (profile) {
            res.status(200).json(profile.orders)
        }
    }
}


export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user
    if (customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food')
        if (profile) {
            return res.status(200).json(profile.cart)
        }

    }
    return res.status(400).json({ "message": "cart is Empty" })

}
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if (customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();

        const { _id, unit } = <cartItem>req.body
        const food = await Food.findById(_id)

        if (food) {

            if (profile != null) {
                //check for cart items  
                cartItems = profile.cart

                if (cartItems.length > 0) {
                    //update the cart unit 
                    let existFoodIem = cartItems.filter((item) => item.food._id.toString() === _id);
                    if (existFoodIem.length > 0) {
                        const index = cartItems.indexOf(existFoodIem[0]);
                        if (unit > 0) {
                            cartItems[index] = { food, unit }
                        } else {
                            cartItems.splice(index, 1)
                        }

                    }
                    else {
                        cartItems.push({ food, unit })
                    }
                } else {
                    //add new items to cart

                    cartItems.push({ food, unit })
                }
                if (cartItems) {
                    profile.cart = cartItems as any;
                    const cartRes = await profile.save();
                    return res.status(200).json(cartRes.cart)

                }
            }
        }
    }

    return res.status(401).json({ "message": "Unable To Create Cart!" })
}
export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user
    if (customer) {
        const profile = await Customer.findById(customer._id).populate('cart.food')
        if (profile != null) {
            profile.cart = [] as any
            const cartResult = await profile.save();
            return res.status(200).json(cartResult)
        }

    }
    return res.status(400).json({ "message": "cart is Already  Empty" })
}


export const ApplyOffers = async (req: Request, res: Response, next: NextFunction) => {
    const offerId = req.params.id;
    const customer = req.user
    if (customer) {
        const profile = await Customer.findById(customer._id)
        if (profile != null) {
            const appliedOffer = await Offer.findById(offerId)
            if (appliedOffer && appliedOffer.isActive) {
                return res.status(200).json({ "message": "Offer is Valid", offer: appliedOffer })

            }
        }

    }
    return res.status(400).json({ "message": "Offer is  not Valid" })
}


export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {
    const { amount, paymentMode, offerId } = req.body;
    const customer = req.user
    let payableAmount = Number(amount);

    if (offerId) {
        const appliedOffer = await Offer.findById(offerId)
        if (appliedOffer && appliedOffer.isActive) {
            payableAmount = (payableAmount - appliedOffer.offerAmount)
            //Perform Payment Gateway Charge Api Call


            //Create Record Transaction

            const transaction = await Transaction.create({
                customer: customer?._id,
                vendorId: '',
                orderId: '',
                orderValue: payableAmount,
                offerUsed: offerId || '',
                status: "OPEN",
                paymentMode: paymentMode,
                paymentResponse: ''
            })
            //Return Transaction Id
            return res.status(200).json(transaction)

        }
    }

    return res.status(400).json({ "message": "Offer is  not Valid" })
}

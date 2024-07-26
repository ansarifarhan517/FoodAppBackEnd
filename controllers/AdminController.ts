import { Request, Response, NextFunction } from 'express'
import { CreateVendorInput } from '../dto'
import { Transaction, Vendor } from '../models'
import { Customer } from '../models/Customer'
export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name,
            ownerName,
            foodType,
            pincode,
            address,
            phone,
            email,
            password, } = <CreateVendorInput>req.body

        const isExistingVendor = await Vendor.findOne({ email });

        if (isExistingVendor !== null) {
            return res.status(500).json({ message: "Vendor Already Exist " })
        }

        const createVendor = await Vendor.create({
            name,
            address,
            pincode,
            foodType,
            email,
            password,
            ownerName,
            phone,
            ratings: 0,
            serviceAvailable: true,
            coverImages: [],
            foods: [],
            salt: 'asasa',
            lat: 0,
            lng: 0
        })

        if (Object.keys(createVendor).length > 0) {
            res.status(201).json(createVendor);
        }
    } catch (error) {
        res.status(500).json(error)
    }

}

export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendors = await Vendor.find({});
        if (vendors !== null) {
            return res.status(200).json(vendors)
        }
        res.status(200).json("message: No Vendors Present ")
    } catch (error) {
        res.status(500).json({ "error": error })

    }
}

export const GetVendorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        const vendors = await Vendor.findById(id);
        if (vendors !== null) {
            return res.status(200).json(vendors)
        }
        res.status(200).json("message: No Vendors Present for this ID ")
    } catch (error) {
        res.status(500).json({ "error": error })

    }
}


export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {lat, lng} = req.body
    if (user) {
        const existingVendor = await Vendor.findById(user._id);
        if (existingVendor!== null) {
            if (lat && lng) {
                existingVendor.lat = lat ;
                existingVendor.lng = lng ;

            }
            let updatedVEndor = await existingVendor.save()
            res.status(200).json(updatedVEndor)
        }
    }
}

export const GetTransaction = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer._id)
        if (profile != null) {
            const transaction = await Transaction.find();
            if (transaction) {
                return res.status(200).json(transaction)

            }
        }

    }
    return res.status(400).json({ "message": "Error in Get" })
}

export const GetTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    const transactionId = req.params.id;

    if (customer) {
        const profile = await Customer.findById(customer._id)
        if (profile != null) {
            const transaction = await Transaction.findById(transactionId);
            if (transaction) {
                return res.status(200).json(transaction)

            }
        }

    }
    return res.status(400).json({ "message": "Error in Get" })
}
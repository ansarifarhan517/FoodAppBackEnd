import { Request, Response, NextFunction } from 'express'
import { CreateVendorInput } from '../dto'
import { Vendor } from '../models'
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
            salt: 'asasa'
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
import { NextFunction, Request, Response } from "express";
import { FoodDoc, Vendor } from "../models";
import { Offer } from "../models/Offers";

export const GetTopRestraunts = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode
    const result = await Vendor.find({ pincode, serviceAvailable: true })
        .sort([['ratings', 'descending']])
        .limit(5)
    if (result.length > 0) {
        return res.status(200).json(result)
    }

    return res.status(400).json({ message: "Data not Found" })
}

export const GetRestrauntsById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const result = await Vendor.find({ id, serviceAvailable: true }).populate('foods')

    if (result) {
        return res.status(200).json(result)
    }

    return res.status(400).json({ message: "Data not Found" })
}
export const SearchFood = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode
    const result = await Vendor.find({ pincode, serviceAvailable: true }).populate('foods')
    if (result.length > 0) {
        let foodResult: any = []
        result.map(vendor => {
            const foods = vendor.foods as [FoodDoc]
            foodResult.push(vendor.foods)
        })
        return res.status(200).json(foodResult)
    }

    return res.status(400).json({ message: "Data not Found" })
}


export const GetFoodIn30Min = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode
    const result = await Vendor.find({ pincode, serviceAvailable: true, }).populate('foods')

    if (result.length > 0) {
        let foodResult: any = []
        result.map(vendor => {
            const foods = vendor.foods as [FoodDoc]
            foodResult.push(...foods.filter(food => food.readyTime <= 30))
        })
        return res.status(200).json(foodResult)
    }

    return res.status(400).json({ message: "Data not Found" })
}

export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pincode = req.params.pincode
        console.log("pin", pincode)
        const result = await Vendor.find({ pincode, serviceAvailable: true })
            .sort([['ratings', 'descending']])
            .populate('foods')
        console.log(result)
        if (result.length > 0) {
            return res.status(200).json(result)
        }

        return res.status(400).json({ message: "Data not Found" })
    } catch (error) {
        res.status(500).json({ "error": error });
    }

}
export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    const offers = await Offer.find({ pincode, isActive: true })
    if (offers) {
        return res.status(200).json(offers);
    }
    return res.status(400).json({ message: "Offer not Found" })

}
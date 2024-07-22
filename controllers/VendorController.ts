import { Request, Response, NextFunction } from 'express'
import { EditVendorInput, VendorLoginInputs } from '../dto'
import { Food, Vendor } from '../models';
import { AddFoodInput } from '../dto/Food.dto';

interface MatchPasswordResponse {
    success: boolean;
    signature?: string;
}

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = <VendorLoginInputs>req.body;
        //@ts-expect-error will fix later
        const { success, signature }: MatchPasswordResponse = await Vendor.matchPassword(email, password);
        if (success) {
            return res.status(200).json(signature);
        }
        res.status(401).json({ error: 'Invalid Credentials' }); // Use 401 (Unauthorized) for login failures
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle unexpected errors gracefully
    }

}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (user) {
        const vendor = await Vendor.findById(user._id);
        return res.status(200).json(vendor);
    }
    return res.status(404).json({ "message": "Vendor Information Not Found" });

}



export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { foodTypes, name, address, phone } = <EditVendorInput>req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendor = await Vendor.findById(user._id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor Information Not Found" });
        }
        // Update vendor information
        vendor.foodType = foodTypes || vendor.foodType;
        vendor.name = name || vendor.name;
        vendor.address = address || vendor.address;
        vendor.phone = phone || vendor.phone;

        console.log("Updating vendor with:", { foodTypes, name, address, phone });

        const saved = await vendor.save();
        return res.json(saved);
    } catch (error: any) {
        console.error("Error updating vendor profile:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });

        }
        const vendor = await Vendor.findById(user._id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor Information Not Found" });
        }

        const files = req?.files as [Express.Multer.File];
        const images = files?.map((file: Express.Multer.File) => file.filename);

        vendor.coverImages = images;

        const result = await vendor.save();

        return res.status(200).json(result);

    } catch (error: any) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendor = await Vendor.findById(user._id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor Information Not Found" });
        }

        vendor.serviceAvailable = !vendor.serviceAvailable

        vendor.markModified('vendors');
        const saved = await vendor.save();
        return res.json(saved)
    } catch (error: any) {
        console.error("Error updating vendor profile:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { name,
            description,
            category,
            foodType,
            readyTime,
            price } = <AddFoodInput>req.body
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendor = await Vendor.findById(user._id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor Information Not Found" });
        }
        const files = req.files as [Express.Multer.File]

        const images = files.map(file => file.filename)
        const createFood = await Food.create({
            vendor: vendor.id,
            name,
            description,
            category,
            foodType,
            readyTime,
            price,
            images: images,
            rating: 0
        })

        if (!createFood) {
            return res.status(404).json({ message: "Food Not Added" });
        }

        vendor.foods.push(createFood)
        const result = await vendor.save()

        if (!result) {
            return res.status(404).json({ message: "Food Not Added" });
        }

        return res.status(200).json(result)


    } catch (error: any) {
        console.error("Error updating vendor profile:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "User not authenticated" })
    }

    const vendor = await Vendor.findById(user?._id).populate('foods')

    if (!vendor) {
        return res.status(404).json({ "message": "Vendor not Found" })
    }
    return res.status(200).json(vendor.foods)
}
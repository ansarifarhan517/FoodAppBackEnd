import { Request, Response, NextFunction } from 'express'
import { CreateOfferInputs, EditVendorInput, VendorLoginInputs } from '../dto'
import { Food, Vendor } from '../models';
import { AddFoodInput } from '../dto/Food.dto';
import { Order } from '../models/Order';
import { Offer } from '../models/Offers';

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
// export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = req.user;

//         if (!user) {
//             return res.status(401).json({ message: "User not authenticated" });
//         }

//         const vendor = await Vendor.findById(user._id);

//         if (!vendor) {
//             return res.status(404).json({ message: "Vendor Information Not Found" });
//         }

//         vendor.serviceAvailable = !vendor.serviceAvailable

//         vendor.markModified('vendors');
//         const saved = await vendor.save();
//         return res.json(saved)
//     } catch (error: any) {
//         console.error("Error updating vendor profile:", error);
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }

// }

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

export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user
    if (!user) {
        return res.status(401).json({ message: "User not authenticated" })
    }

    const orders = await Order.find({ vendorId: user._id }).populate('items.food')

    if (!orders) {
        return res.status(404).json({ message: "No Orders Information" });
    }

    res.status(200).json(orders)


}
export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    const orderID = req?.params.id
    if (!orderID) {
        return res.status(401).json({ message: "OrderId not Mandatory" })
    }

    const order = await Order.find({ orderId: orderID }).populate('items.food')

    if (!order) {
        return res.status(404).json({ message: "No Orders Information" });
    }

    res.status(200).json(order)
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id
    const { status, remarks, time } = req.body  //ACCEPT /REJECT/ UNDERPROCESS / READY

    if (!orderId) {
        return res.status(401).json({ message: "OrderId not Mandatory" })
    }

    const order = await Order.findById(orderId)

    if (!order) {
        return res.status(404).json({ message: "No Orders Information" });
    }

    order.orderStatus = status
    order.remarks = remarks

    if (time) {
        order.readyTime = time
    }

    const orderResult = await order.save()

    if (!orderResult) {
        return res.status(401).json({ message: "OrderId not PRocessed" })

    }
    res.status(200).json(orderResult)

}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(400).json({ message: "User not authenticated" })
    }

    const offers = await Offer.find().populate('vendors');

    if (!offers) {
        return res.status(400).json({ message: "Offer not Found" })

    }
    let currentOffers = Array();

    offers.map(obj => {
        if (obj.vendors) {
            obj.vendors.map(vendor => {
                if (vendor._id == user._id) {
                    currentOffers.push(obj)
                }

                if (obj.offerType == "GENERIC") {
                    currentOffers.push(obj)
                }
            })
        }
    })

    res.status(200).json(currentOffers)
}
export const CreateOffer = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "User not authenticated" })
    }
    const { offerType,
        vendors,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promoCode,
        promoType,
        bins,
        bank,
        pinCode,
        isActive } = <CreateOfferInputs>req.body

    const vendor = await Vendor.findById(user._id);
    if (!vendor) {
        return res.status(404).json({ "message": "Vendor Information Not Found" });
    }

    const offers = await Offer.create({
        offerType,
        vendors: [vendor],
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promoCode,
        promoType,
        bins,
        bank,
        pinCode,
        isActive
    })

    if (!offers) {
        return res.status(401).json({ "message": "Offer Not Created" });

    }
    return res.status(200).json(offers)
}
export const EditOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    const offerId = req.params.id;

    if (!user) {
        return res.status(400).json({ message: "User not authenticated" })
    }
    const { offerType,
        vendors,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promoCode,
        promoType,
        bins,
        bank,
        pinCode,
        isActive } = <CreateOfferInputs>req.body

    const currentOffers = await Offer.findById(offerId).populate('vendors');

    if (!currentOffers) {
        return res.status(400).json({ message: "Offer not Found" })

    }

    const vendor = await Vendor.findById(user._id);
    if (!vendor) {
        return res.status(404).json({ "message": "Vendor Information Not Found" });
    }

    currentOffers.offerType = offerType;
    currentOffers.vendors = vendors;
    currentOffers.title = title;
    currentOffers.description = description;
    currentOffers.minValue = minValue;
    currentOffers.offerAmount = offerAmount;
    currentOffers.startValidity = startValidity;
    currentOffers.endValidity = endValidity;
    currentOffers.promoCode = promoCode;
    currentOffers.promoType = promoType;
    currentOffers.bins = bins;
    currentOffers.bank = bank;
    currentOffers.pinCode = pinCode;
    currentOffers.isActive = isActive;

    await currentOffers.save()



    res.status(200).json(currentOffers)
}
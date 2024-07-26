import mongoose, { Document, Model } from 'mongoose'
import { createHmac, randomBytes } from 'node:crypto'
import { GenerateSignature } from '../utility';

interface VendorDoc extends Document {
    name: string;
    ownerName: string;
    foodType: string[];
    pincode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
    salt: string;
    serviceAvailable: boolean;
    coverImages: string[];
    ratings: number;
    foods: any;
    lat: number;
    lng: number;
}

interface VendorModel extends Model<VendorDoc> {
    matchPassword(email: string, password: string): Promise<boolean>;
}

export interface MatchPasswordResponse {
    success: boolean;
    signature?: string;
}


const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailable: { type: Boolean, },
    coverImages: { type: [String], },
    ratings: { type: Number, },
    foods: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'food' }],
    lat: {type: Number},
    lng: {type: Number}
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.createdAt;
            delete ret.__v;
        },
    },
    timestamps: true
})



//Creating Mongoose Function and it runs when the every doc is created 
VendorSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    const salt = randomBytes(16).toString();

    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest("hex")

    this.salt = salt;
    this.password = hashedPassword;
    next();
})

//Creating Mongoose Static Functions
VendorSchema.static('matchPassword', async function (email, password) {
    const user = await this.findOne({ email })
    const response: MatchPasswordResponse  = { success: false}

    if (user === null) {
        return response.success = false;
    }
    const salt = user.salt;
    const hashedPassword = createHmac('sha256', salt)
        .update(password)
        .digest("hex");
    if (hashedPassword === user.password) {

        response.success = true;
        response.signature = await GenerateSignature({
            _id: user.id,
            email: user.email,
            name: user.name,
            foodTypes: user.foodTypes,
        })
    }
    else {
        response.success = false;
    }
    return response;


})

const Vendor = mongoose.model<VendorDoc, VendorModel>('vendor', VendorSchema);

export {
    Vendor
}
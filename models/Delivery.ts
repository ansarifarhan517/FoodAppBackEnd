import mongoose, { Document, Model } from 'mongoose'
import { MatchPasswordResponse } from './Vendor';
import { createHmac, randomBytes } from 'node:crypto'
import { GenerateSignature } from '../utility';


export interface DeliveryUserDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    verified: boolean;
    lat: number;
    lng: number
    isAvailable: boolean;
}

interface DeliveryUserModel extends Model<DeliveryUserDoc> {
    matchPassword(email: string, password: string): Promise<boolean>;
}

const DeliveryUserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String, },
    lastName: { type: String, },
    address: { type: String, },
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true },
    lat: { type: Number, },
    lng: { type: Number, },
    isAvailable: { type: Boolean, },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.createdAt;
            delete ret.__v;
        }
    },
    timestamps: true
})
//Creating Mongoose Static Functions
DeliveryUserSchema.static('matchPassword', async function (email, password) {
    const user = await this.findOne({ email })
    const response: MatchPasswordResponse = { success: false }

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
            verified: user.verified,
        })
    }
    else {
        response.success = false;
    }
    return response;


})

const DeliveryUser = mongoose.model<DeliveryUserDoc, DeliveryUserModel>('delivery', DeliveryUserSchema)

export { DeliveryUser }
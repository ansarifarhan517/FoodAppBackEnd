import mongoose, { Document, Model } from 'mongoose'
import { createHmac, randomBytes } from 'node:crypto'
import { MatchPasswordResponse } from './Vendor';
import { GenerateSignature } from '../utility';
import { OrderDoc } from './Order';

interface CustomerDoc extends Document {
    name: string;
    address: string;
    phone: string;
    email: string;
    password: string;
    salt: string;
    verified: boolean;
    otp: number;
    otp_expiry: Date;
    lat: number;
    lng: number
    orders: [OrderDoc]
    cart: [any]

}

interface CustomerModel extends Model<CustomerDoc> {
    matchPassword(email: string, password: string): Promise<boolean>;
}

const CustomerSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    verified: { type: Boolean, required: true },
    otp: { type: Number, required: true },
    otp_expiry: { type: Date, required: true },
    lat: { type: Number },
    lng: { type: Number },
    cart: [{
        food: { type: mongoose.Schema.ObjectId, ref: 'food', require: true },
        unit: { type: Number, require: true }
    }],
    orders: [{
        type: mongoose.Schema.ObjectId,
        ref: 'order'
    }]
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
CustomerSchema.pre('save', function (next) {
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
CustomerSchema.static('matchPassword', async function (email, password) {
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

const Customer = mongoose.model<CustomerDoc, CustomerModel>('customer', CustomerSchema)
export { Customer }
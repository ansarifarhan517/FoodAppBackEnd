import mongoose, { Document, Schema } from "mongoose";

interface OfferDoc extends Document {
    offerType: string;
    vendors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date,
    endValidity: Date;
    promoCode: string;
    promoType: string; //USER / ALL / BANK / CREDIT CARD  
    bins: [any],
    bank: [any];
    pinCode: string;
    isActive: boolean;

}


const OfferSchema = new mongoose.Schema({
    offerType: { type: String, required: true },
    vendors: [
        { type: Schema.Types.ObjectId, ref: 'vendor', }
    ],
    title: { type: String, required: true },
    description: { type: String, required: true },
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: { type: Date,  },
    endValidity: { type: Date,  },
    promoCode: { type: String, required: true },
    promoType: { type: String, required: true },
    bins: [
        { type: String }
    ],
    bank: [
        { type: Number }
    ],
    pinCode: { type: String },
    isActive: { type: Boolean, required: true },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
})

const Offer = mongoose.model<OfferDoc>('offer', OfferSchema)
export { Offer }
import mongoose, { Document } from 'mongoose'


export interface OrderDoc extends Document {
    orderId: string;
    items: [any]
    totalAmount: number;
    orderDate: Date;
    paidThrough: string; //COD / Credit Card, Wallet
    paymentResponse: string; //{status: true, respponse : some bank response}
    OrderStatus: string
}

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    items: [{
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
        unit: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrough: { type: String, required: true },
    paymentResponse: { type: String },
    OrderStatus: { type: Number, required: true },

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

const Order = mongoose.model<OrderDoc>('order', OrderSchema)

export { Order }
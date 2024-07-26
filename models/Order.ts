import mongoose, { Document } from 'mongoose'


export interface OrderDoc extends Document {
    orderId: string;
    vendorId: string;
    items: [any]
    totalAmount: number;
    orderDate: Date;
    paidAmount: Number;
    orderStatus: string  //WAITING / FAILED / ACCEPT /REJECT/ UNDERPROCESS / READY
    remarks: string; //in case of cancel this is reason
    deliveryId: string; //delivery Boys id
   
    readyTime: number;

}

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    vendorId: { type: String, required: true },
    items: [{
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
        unit: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidAmount: { type: Number },
    orderStatus: { type: Number, required: true },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },

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
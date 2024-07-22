import express from 'express';
import { ConnectOptions, connect } from 'mongoose';
import { MONGO_URI } from '../configs'


type ConnectionOptionsExtend = {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
};

const options: ConnectOptions & ConnectionOptionsExtend = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};


export default async () => {
    try {
        await connect(MONGO_URI, options)
        console.log('DB Connected')

    } catch (error) {
        console.log(error)
    }

}

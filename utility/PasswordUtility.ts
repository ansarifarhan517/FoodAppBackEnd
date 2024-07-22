import { Request } from "express"
import { APP_SECRET_KEY } from "../configs"
import jwt from 'jsonwebtoken'
import { AuthPayload } from "../dto/Auth.dto"

export const GenerateSignature = async (payload: AuthPayload) => {
    return jwt.sign(payload, APP_SECRET_KEY, {
        expiresIn: '1d'
    })
}

export const ValidateSignature = async (req: Request) => {
    const signature = req.get('Authorization')
    if (signature) {

       const payload = jwt.verify(signature.split(' ')[1], APP_SECRET_KEY) as AuthPayload
       req["user"] = payload;
       return true;
    }
}
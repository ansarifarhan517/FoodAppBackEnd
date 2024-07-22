import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { ValidateSignature } from "../utility";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {  
    const validate = await ValidateSignature(req)

    if ( validate) {
        console.log("validate")
        next()
    }else {
        res.status(401).json({'message': "User Not Authorize" })
    }

}
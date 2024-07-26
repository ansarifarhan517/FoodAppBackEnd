import { Router, Request, Response, NextFunction } from "express";
import {
    CustomerSignUp, CustomerLogin, CustomerVerify, RequestOtp, GetCustomerProfile, CreateOrder,
    GetOrderById,
    GetAllOrders,
    GetCart,
AddToCart,
DeleteCart,
ApplyOffers,
CreatePayment,
DeliveryUserSignup,
DeliveryUserLogin,
GetDeliveryUserProfile,
EditDeliveryUserProfile,
UpdateDeliveryUserStatus,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = Router();

// -----------------------> SignUp Customer
router.post('/signup', DeliveryUserSignup)
// -----------------------> Login Customer
router.post('/login', DeliveryUserLogin);
// -----------------------> Verify Customer Account

//------------------------> Change Service Status

router.put('change-status', UpdateDeliveryUserStatus)


// -----------------------> Profile  
router.get('/profile', GetDeliveryUserProfile);
router.patch('/profile', EditDeliveryUserProfile);



export { router as DeliveryRoute };

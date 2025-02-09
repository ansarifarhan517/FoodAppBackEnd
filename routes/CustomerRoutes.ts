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
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = Router();

// -----------------------> SignUp Customer
router.post('/signup', CustomerSignUp)
// -----------------------> Login Customer
router.post('/login', CustomerLogin);
// -----------------------> Verify Customer Account
router.patch('/verify', Authenticate, CustomerVerify);
// -----------------------> Otp / Requesting  OTP  
router.get('/otp', RequestOtp);
// -----------------------> Profile  
router.get('/profile', GetCustomerProfile);


//Orders
router.post('/create-order', CreateOrder);
router.get('/order/:id', GetOrderById);
router.get('/orders', GetAllOrders);

//Cart
router.get('/cart', GetCart);
router.post('/cart', AddToCart);
router.delete('/cart', DeleteCart);


//Apply Offers 
router.get('/offer/verify/:id',Authenticate ,ApplyOffers)


//Creeate Payment 
router.post('/create-payment', Authenticate , CreatePayment)
export { router as CustomerRoutes };

import express, { Request, Response } from 'express';
import { AddFood, CreateOffer, EditOffers, GetCurrentOrders, GetFoods, GetOffers, GetOrderDetails, GetVendorProfile, ProcessOrder, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer'
import path from 'path'

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'images'));
    },
    filename(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname);
    },
})

const images = multer({ storage: imageStorage })
router.post('/login', VendorLogin);
router.use(Authenticate)
router.get('/profile', GetVendorProfile)
router.patch('/profile', UpdateVendorProfile)
router.patch('/service', UpdateVendorService)
router.patch('/coverImage', images.array('images'), UpdateVendorCoverImage)

router.post('/food', images.single('images'), AddFood)
router.get('/foods', GetFoods)


//Orders
router.get('/orders', GetCurrentOrders)
router.put('/order/:id/process', ProcessOrder)
router.get('/order/:id', GetOrderDetails)

//Offers
router.get('/offers', GetOffers)
router.post('/offer', CreateOffer)
router.put('/offer/:id', EditOffers)


export { router as VendorRoutes };
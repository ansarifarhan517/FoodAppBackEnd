import express, { Request, Response } from 'express';
import { AddFood, GetFoods, GetVendorProfile, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from '../controllers';
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

router.get('/profile', Authenticate, GetVendorProfile)
router.patch('/profile', Authenticate, UpdateVendorProfile)
router.patch('/service', Authenticate, UpdateVendorService)
router.patch('/coverImage', Authenticate , images.array('images'), UpdateVendorCoverImage)

router.post('/food', images.single('images'), Authenticate, AddFood)
router.get('/foods', Authenticate, GetFoods)

export { router as VendorRoutes };
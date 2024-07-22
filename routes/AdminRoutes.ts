import { Router, Request, Response, NextFunction } from "express";
import { CreateVendor, GetVendors, GetVendorById } from "../controllers";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json("Hello From Admin Route");
});


router.post('/vendors', CreateVendor)
router.get('/vendors', GetVendors);
router.get('/vendors/:id', GetVendorById);
export { router as AdminRoutes };

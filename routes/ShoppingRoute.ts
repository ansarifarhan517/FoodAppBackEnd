import { Router } from 'express'
import { GetFoodAvailability, GetFoodIn30Min, GetRestrauntsById, GetTopRestraunts, SearchFood , GetAvailableOffers} from '../controllers';
const router = Router();
// ----------------------------> Top Restraunts 
router.get('/top-restraunts/:pincode', GetTopRestraunts)
// ----------------------------> Food Available in 30 minutes
router.get('/food-in-30-min/:pincode', GetFoodIn30Min)
// ----------------------------> Food Availaiblity
router.get('/:pincode', GetFoodAvailability )


// -------------------------------> Search Foods
router.get('/search/:pincode', SearchFood)

// ----------------------------> Get Offers 
router.get('/offers/:pincode', GetAvailableOffers)


// ----------------------------> Find Restraunts By Id
router.get('/restraunts/:id', GetRestrauntsById)

export {router as ShoppingRouter};
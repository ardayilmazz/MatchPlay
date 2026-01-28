import express from 'express';
import { searchVenues, getCities } from '../controllers/locationController';

const router = express.Router();

router.get('/search', searchVenues);
router.get('/cities', getCities);

export default router;

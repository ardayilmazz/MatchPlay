import { Request, Response } from 'express';
import { City } from '../models/Location';

/**
 * @swagger
 * /api/locations/search:
 *   get:
 *     summary: Search for venues by name
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for venue name
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing query parameter
 */
export const searchVenues = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = q.toLowerCase().trim();

    // Tüm şehirleri al
    const cities = await City.find();

    // Arama sonuçları
    const results: any[] = [];

    cities.forEach((city) => {
      city.districts.forEach((district) => {
        district.venues.forEach((venue) => {
          if (venue.name.toLowerCase().includes(searchQuery)) {
            results.push({
              cityId: city._id,
              cityName: city.name,
              districtId: district._id,
              districtName: district.name,
              venueId: venue._id,
              venueName: venue.name,
              venueAddress: venue.address,
            });
          }
        });
      });
    });

    res.json(results);
  } catch (error: any) {
    console.error('Error searching venues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/locations/cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of cities
 */
export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

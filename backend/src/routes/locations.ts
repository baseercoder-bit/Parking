import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location by ID
router.get('/:locationId', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        zones: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location stats
router.get('/:locationId/stats', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        zones: true,
      },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const totalSpots = location.zones.reduce((sum, zone) => sum + zone.totalSpots, 0);
    const occupiedSpots = location.zones.reduce((sum, zone) => sum + zone.occupiedSpots, 0);
    const availableSpots = totalSpots - occupiedSpots;

    res.json({
      locationId: location.id,
      locationName: location.name,
      totalSpots,
      occupiedSpots,
      availableSpots,
      zones: location.zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        totalSpots: zone.totalSpots,
        occupiedSpots: zone.occupiedSpots,
        availableSpots: zone.totalSpots - zone.occupiedSpots,
      })),
    });
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload parking lot image (admin only)
router.put('/:locationId/image', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { locationId } = req.params;
    const { imageUrl } = req.body;

    // Verify admin has access to this location
    if (req.locationId !== locationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate imageUrl is a valid base64 data URL or URL
    if (imageUrl && !imageUrl.match(/^(data:image\/(jpeg|jpg|png|gif|webp);base64,|https?:\/\/)/)) {
      return res.status(400).json({ error: 'Invalid image URL format' });
    }

    const location = await prisma.location.update({
      where: { id: locationId },
      data: {
        imageUrl: imageUrl || null,
      },
    });

    res.json(location);
  } catch (error) {
    console.error('Update location image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


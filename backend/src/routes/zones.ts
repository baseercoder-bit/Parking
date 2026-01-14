import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all zones for a location (public)
router.get('/:locationId', async (req: AuthRequest, res: Response) => {
  try {
    const { locationId } = req.params;

    const zones = await prisma.zone.findMany({
      where: { locationId },
      orderBy: { name: 'asc' },
    });

    res.json(zones);
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new zone (admin only)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, totalSpots, locationId } = req.body;

    if (!name || !totalSpots || totalSpots < 0) {
      return res.status(400).json({ error: 'Name and totalSpots are required' });
    }

    const locationIdToUse = locationId || req.locationId;

    if (!locationIdToUse) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    const zone = await prisma.zone.create({
      data: {
        name,
        description: description || null,
        totalSpots: parseInt(totalSpots),
        occupiedSpots: 0,
        locationId: locationIdToUse,
      },
    });

    // Broadcast update to location room
    const io = req.app.get('io');
    if (io) {
      io.to(`location:${locationIdToUse}`).emit('parking-update', { zone, type: 'create' });
    }

    res.status(201).json(zone);
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update zone (admin only)
router.put('/:zoneId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { name, description, totalSpots } = req.body;

    const updateData: {
      name?: string;
      description?: string | null;
      totalSpots?: number;
      occupiedSpots?: number;
    } = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (totalSpots !== undefined) {
      const total = parseInt(totalSpots);
      if (total < 0) {
        return res.status(400).json({ error: 'totalSpots must be non-negative' });
      }
      updateData.totalSpots = total;
      
      // Ensure occupiedSpots doesn't exceed totalSpots
      const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
      if (zone && zone.occupiedSpots > total) {
        updateData.occupiedSpots = total;
      }
    }

    const zone = await prisma.zone.update({
      where: { id: zoneId },
      data: updateData,
    });

    // Broadcast update to location room
    const io = req.app.get('io');
    if (io) {
      io.to(`location:${zone.locationId}`).emit('parking-update', { zone, type: 'update' });
    }

    res.json(zone);
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update occupied spots (admin only)
router.put('/:zoneId/spots', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { occupiedSpots } = req.body;

    console.log(`[Update Spots] Zone ID: ${zoneId}, Occupied Spots: ${occupiedSpots}`);

    if (occupiedSpots === undefined || occupiedSpots < 0) {
      return res.status(400).json({ error: 'occupiedSpots is required and must be non-negative' });
    }

    const occupied = parseInt(occupiedSpots);

    if (isNaN(occupied)) {
      return res.status(400).json({ error: 'occupiedSpots must be a valid number' });
    }

    // Get current zone to check totalSpots
    const currentZone = await prisma.zone.findUnique({
      where: { id: zoneId },
    });

    if (!currentZone) {
      console.error(`[Update Spots] Zone not found: ${zoneId}`);
      return res.status(404).json({ error: 'Zone not found' });
    }

    console.log(`[Update Spots] Current zone: ${JSON.stringify(currentZone)}`);

    if (occupied > currentZone.totalSpots) {
      return res.status(400).json({ 
        error: `occupiedSpots cannot exceed totalSpots (${currentZone.totalSpots})` 
      });
    }

    // Use transaction to ensure data consistency
    const zone = await prisma.$transaction(async (tx) => {
      const updatedZone = await tx.zone.update({
        where: { id: zoneId },
        data: { occupiedSpots: occupied },
      });
      
      console.log(`[Update Spots] Updated zone: ${JSON.stringify(updatedZone)}`);
      return updatedZone;
    });

    // Verify the update was successful by fetching again
    const verifiedZone = await prisma.zone.findUnique({
      where: { id: zoneId },
    });

    console.log(`[Update Spots] Verified zone: ${JSON.stringify(verifiedZone)}`);

    if (!verifiedZone || verifiedZone.occupiedSpots !== occupied) {
      console.error(`[Update Spots] Verification failed! Expected: ${occupied}, Got: ${verifiedZone?.occupiedSpots}`);
      return res.status(500).json({ error: 'Update verification failed. Please try again.' });
    }

    // Broadcast update to location room
    const io = req.app.get('io');
    if (io) {
      io.to(`location:${zone.locationId}`).emit('parking-update', { zone: verifiedZone, type: 'spots-update' });
    }

    res.json(verifiedZone);
  } catch (error: any) {
    console.error('[Update Spots] Error details:', error);
    console.error('[Update Spots] Error message:', error?.message);
    console.error('[Update Spots] Error code:', error?.code);
    console.error('[Update Spots] Error meta:', error?.meta);
    
    // Provide more specific error messages
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Zone not found' });
    }
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Conflict: Zone already exists' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
});

// Delete zone (admin only)
router.delete('/:zoneId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { zoneId } = req.params;

    const zone = await prisma.zone.delete({
      where: { id: zoneId },
    });

    // Broadcast update to location room
    const io = req.app.get('io');
    if (io) {
      io.to(`location:${zone.locationId}`).emit('parking-update', { zone, type: 'delete' });
    }

    res.json({ message: 'Zone deleted successfully', zone });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


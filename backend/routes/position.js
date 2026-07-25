const { Router } = require('express');
const { prisma } = require('../db/client.js');
const { executeRealPositionTracking } = require('../services/realSerpTracker.js');

const router = Router();

router.post('/track', async (req, res) => {
  const { url, location, timeframe, keywords } = req.body;

  if (!url) {
    return res.status(400).json({ detail: "Url is required." });
  }

  console.info(`[PositionRouter] Initiating real SERP tracking for URL: ${url} | Location: ${location}`);

  try {
    const dataBlock = await executeRealPositionTracking(url, keywords, location, timeframe);

    const newTrack = await prisma.keywordTrack.create({
      data: {
        url,
        location: location || "India (Google) • English",
        timeframe: timeframe || "last 7 days",
        data: dataBlock
      }
    });

    console.info(`[PositionRouter] Saved real keyword tracker record: ${newTrack.id} for domain: ${dataBlock.url}`);
    res.json({
      id: newTrack.id,
      url: newTrack.url,
      location: newTrack.location,
      timeframe: newTrack.timeframe,
      created_at: newTrack.createdAt.toISOString(),
      data: newTrack.data
    });
  } catch (err) {
    console.error(`[PositionRouter] Failed to execute real keyword tracking:`, err);
    res.status(500).json({ detail: `Real position tracking failed: ${err.message}` });
  }
});

router.get('/history', async (req, res) => {
  try {
    const tracks = await prisma.keywordTrack.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(tracks.map(t => ({
      id: t.id,
      url: t.url,
      location: t.location,
      timeframe: t.timeframe,
      created_at: t.createdAt.toISOString(),
      data: t.data
    })));
  } catch (err) {
    console.error(`[PositionRouter] Failed to query keyword tracks:`, err);
    res.status(500).json({ detail: "Could not retrieve keyword track history." });
  }
});

router.get('/track/:track_id', async (req, res) => {
  const { track_id } = req.params;

  try {
    const track = await prisma.keywordTrack.findUnique({
      where: { id: track_id }
    });

    if (!track) {
      return res.status(404).json({ detail: "Tracker record not found." });
    }

    res.json({
      id: track.id,
      url: track.url,
      location: track.location,
      timeframe: track.timeframe,
      created_at: track.createdAt.toISOString(),
      data: track.data
    });
  } catch (err) {
    console.error(`[PositionRouter] Failed to retrieve keyword track ${track_id}:`, err);
    res.status(400).json({ detail: "Invalid tracker ID format or query failed." });
  }
});

router.delete('/track/:track_id', async (req, res) => {
  const { track_id } = req.params;

  try {
    await prisma.keywordTrack.delete({
      where: { id: track_id }
    });

    res.json({ success: true, message: `Keyword track ${track_id} deleted successfully.` });
  } catch (err) {
    console.error(`[PositionRouter] Failed to delete keyword track ${track_id}:`, err);
    res.status(404).json({ detail: "Tracker record not found." });
  }
});

module.exports = router;

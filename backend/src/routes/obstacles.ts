import express from "express";
import { Obstacle, IObstacle } from "../models/Obstacle";

const router = express.Router();

// GET all obstacles
router.get("/", async (req, res) => {
  try {
    const obstacles = await Obstacle.find().sort({ id: 1 });
    res.json(obstacles);
  } catch (error) {
    console.error("Error fetching obstacles:", error);
    res.status(500).json({ error: "Failed to fetch obstacles" });
  }
});

// GET obstacle by ID
router.get("/:id", async (req, res) => {
  try {
    const obstacle = await Obstacle.findOne({ id: req.params.id });
    if (!obstacle) {
      return res.status(404).json({ error: "Obstacle not found" });
    }
    return res.json(obstacle);
  } catch (error) {
    console.error("Error fetching obstacle:", error);
    return res.status(500).json({ error: "Failed to fetch obstacle" });
  }
});

// POST new obstacle
router.post("/", async (req, res) => {
  try {
    const { id, name, lat, lng, restricted_for } = req.body;

    // Validate required fields
    if (
      !id ||
      !name ||
      lat === undefined ||
      lng === undefined ||
      !restricted_for
    ) {
      return res.status(400).json({
        error: "Missing required fields: id, name, lat, lng, restricted_for",
      });
    }

    // Validate restricted_for array
    if (!Array.isArray(restricted_for) || restricted_for.length === 0) {
      return res.status(400).json({
        error: "restricted_for must be a non-empty array",
      });
    }

    // Validate restriction values
    const validRestrictions = ["walk", "cycle", "disabled"];
    for (const restriction of restricted_for) {
      if (!validRestrictions.includes(restriction)) {
        return res.status(400).json({
          error: `Invalid restriction: ${restriction}. Must be one of: ${validRestrictions.join(
            ", "
          )}`,
        });
      }
    }

    // Check if obstacle with this ID already exists
    const existingObstacle = await Obstacle.findOne({ id });
    if (existingObstacle) {
      return res
        .status(409)
        .json({ error: "Obstacle with this ID already exists" });
    }

    const obstacle = new Obstacle({
      id,
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      restricted_for,
    });

    await obstacle.save();
    return res.status(201).json(obstacle);
  } catch (error) {
    console.error("Error creating obstacle:", error);
    return res.status(500).json({ error: "Failed to create obstacle" });
  }
});

// PUT update obstacle
router.put("/:id", async (req, res) => {
  try {
    const { name, lat, lng, restricted_for } = req.body;

    const updateData: Partial<IObstacle> = {};
    if (name !== undefined) updateData.name = name;
    if (lat !== undefined) updateData.lat = parseFloat(lat);
    if (lng !== undefined) updateData.lng = parseFloat(lng);
    if (restricted_for !== undefined) {
      if (!Array.isArray(restricted_for) || restricted_for.length === 0) {
        return res.status(400).json({
          error: "restricted_for must be a non-empty array",
        });
      }

      // Validate restriction values
      const validRestrictions = ["walk", "cycle", "disabled"];
      for (const restriction of restricted_for) {
        if (!validRestrictions.includes(restriction)) {
          return res.status(400).json({
            error: `Invalid restriction: ${restriction}. Must be one of: ${validRestrictions.join(
              ", "
            )}`,
          });
        }
      }
      updateData.restricted_for = restricted_for;
    }

    const obstacle = await Obstacle.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!obstacle) {
      return res.status(404).json({ error: "Obstacle not found" });
    }

    return res.json(obstacle);
  } catch (error) {
    console.error("Error updating obstacle:", error);
    return res.status(500).json({ error: "Failed to update obstacle" });
  }
});

// DELETE obstacle
router.delete("/:id", async (req, res) => {
  try {
    const obstacle = await Obstacle.findOneAndDelete({ id: req.params.id });
    if (!obstacle) {
      return res.status(404).json({ error: "Obstacle not found" });
    }
    return res.json({ message: "Obstacle deleted successfully" });
  } catch (error) {
    console.error("Error deleting obstacle:", error);
    return res.status(500).json({ error: "Failed to delete obstacle" });
  }
});

export default router;

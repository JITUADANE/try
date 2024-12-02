const express = require("express");
const router = express.Router();
const Event = require("../models/Event"); // Path to your Event model
const Joi = require("joi"); // Joi for validation

// Validation schema
const eventSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  date: Joi.date().required(),
  time: Joi.string().required().trim(),
  location: Joi.string().required().trim(),
  organizerId: Joi.string().required(),
  ticketDetails: Joi.object({
    price: Joi.number().required(),
    availableTickets: Joi.number().required(),
    soldTickets: Joi.number().default(0),
  }).required(),
});



// CREATE new event
router.post("/", async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ: Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ: Get a single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE: Update an event by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // `new` returns the updated document
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete an event by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

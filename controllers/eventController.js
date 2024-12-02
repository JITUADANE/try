const Event = require('../models/eventModel'); // Adjust path as needed

// CREATE an event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, organizerId, ticketDetails } = req.body;

        // Create a new event
        const newEvent = new Event({
            title,
            description,
            date,
            time,
            location,
            organizerId,
            ticketDetails,
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (err) {
        res.status(500).json({ message: 'Error creating event', error: err.message });
    }
};

// READ all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving events', error: err.message });
    }
};

// READ a single event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving event', error: err.message });
    }
};

// UPDATE an event
const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Error updating event', error: err.message });
    }
};

// DELETE an event
const deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting event', error: err.message });
    }
};

// RSVP to an event
const rsvpEvent = async (req, res) => {
    try {
        const { userId } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if user has already RSVP'd
        if (!event.rsvpList) event.rsvpList = [];
        if (event.rsvpList.includes(userId)) {
            return res.status(400).json({ message: 'User has already RSVP\'d' });
        }

        // Add user to RSVP list
        event.rsvpList.push(userId);
        await event.save();

        res.status(200).json({ message: 'RSVP successful', event });
    } catch (err) {
        res.status(500).json({ message: 'Error handling RSVP', error: err.message });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    rsvpEvent,
};

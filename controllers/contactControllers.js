const Contact = require('../models/contacts'); 

// Function to add a new contact
exports.addContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body; 

    // Create a new contact
    const newContact = new Contact({ name, email, phone });
    await newContact.save();

    res.status(201).json({ message: 'Contact added successfully!', contact: newContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
};

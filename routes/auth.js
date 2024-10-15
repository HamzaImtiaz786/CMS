const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const auth = require("../middleware/auth");
const { validatecontact, Contact } = require("../models/Contact");
const mongoose = require("mongoose"); // Ensure you import your auth middleware

// Registration route
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password)
        return res.status(400).json({ error: "Please fill the required fields" });

    // Name validation
    if (name.length > 25)
        return res.status(400).json({ error: "Name can only be less than 25 characters" });

    // Email validation
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailReg.test(email))
        return res.status(400).json({ error: "Please enter a valid email address" });

    // Password validation
    if (password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters long" });

    try {
        // Check if the user already exists
        const doesUserAlreadyExist = await User.findOne({ email });
        if (doesUserAlreadyExist)
            return res.status(400).json({ error: `A user with the email [${email}] already exists. Please try another one.` });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 16);

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        const result = await newUser.save();

        // Remove password from the response
        result._doc.password = undefined;

        // Send success response
        return res.status(201).json({ ...result._doc });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
});

// Login route
router.post("/login", async (req, res) => {

   
    const { email, password } = req.body;
    console.log('req....body', req.body)

    if (!email || !password) return res.status(400).json({ error: "Please enter all the required fields!" });

    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailReg.test(email))
        return res.status(400).json({ error: "Please enter a valid email address" });

    try {
        // Check if user exists
        const doesUserExists = await User.findOne({ email });
        console.log('User found:', doesUserExists); // Log user for debugging
        if (!doesUserExists) return res.status(400).json({ error: "Invalid email or password" });

        // Compare passwords
        const doesPasswordMatch = await bcrypt.compare(password, doesUserExists.password);
        console.log('Password match:', doesPasswordMatch); // Log password match result
        if (!doesPasswordMatch) return res.status(400).json({ error: "Invalid email or password" });

        // Create JWT token
        const payload = { _id: doesUserExists._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({ token });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
});

router.post("/contact", auth, async (req, res) => {
    console.log("req.body>>>>",req.body);
    const { error } = validatecontact(req.body);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { name, address, email, phone } = req.body;
  
    try {
      const newContact = new Contact({
        name,
        address,
        email,
        phone,
        postedBy: req.user._id,
      });
      const result = await newContact.save();
  
      return res.status(201).json({ ...result._doc });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error, contact not created" });
    }
  });
  
  // Fetch contacts
  router.get("/mycontacts", auth, async (req, res) => {
    try {
      const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
        "postedBy",
        "-password"
      );
  
      return res.status(200).json({ contacts: myContacts.reverse() });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error, couldn't fetch contacts" });
    }
  });
  
  // Update contact
  router.put("/contact/:id", auth, async (req, res) => {
    const id  = req.params.id;
  console.log("id>>",id);
    if (!id) return res.status(400).json({ error: "No ID specified." });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Please enter a valid ID" });
    try {
      const contact = await Contact.findOne({ _id: id });
  
      if (req.user._id.toString() !== contact.postedBy._id.toString())
        return res
          .status(401)
          .json({ error: "You cannot edit other people's contacts!" });
  
      const updatedData = { ...req.body, id: undefined };
      const result = await Contact.findByIdAndUpdate(id, updatedData, {
        new: true,
      });
  
      return res.status(200).json({ ...result._doc });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error, contact not updated" });
    }
  });
  
  // Delete contact
  router.delete("/delete/:id", auth, async (req, res) => {
    const { id } = req.params;
  
    if (!id) return res.status(400).json({ error: "No ID specified." });
  
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Please enter a valid ID" });
    try {
      const contact = await Contact.findOne({ _id: id });
      if (!contact) return res.status(400).json({ error: "No contact found" });
  
      if (req.user._id.toString() !== contact.postedBy._id.toString())
        return res
          .status(401)
          .json({ error: "You cannot delete other people's contacts!" });
  
      const result = await Contact.deleteOne({ _id: id });
      const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
        "postedBy",
        "-password"
      );
  
      return res
        .status(200)
        .json({ ...contact._doc, myContacts: myContacts.reverse() });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error, contact not deleted" });
    }
  });
  
  // Get a single contact
  router.get("/contact/:id", auth, async (req, res) => {
    const { id } = req.params;
  
    if (!id) return res.status(400).json({ error: "No ID specified." });
  
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ error: "Please enter a valid ID" });
  
    try {
      const contact = await Contact.findOne({ _id: id });
      return res.status(200).json({ ...contact._doc });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error, could not get contact" });
    }
  });


// Get user data (Protected route)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Exclude password from the response
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
// const connectDB = require("./config/db"); 

const mongoURI = "mongodb://localhost:27017/myDatabase";



const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(morgan("tiny"));

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Ensure this is the correct URL for your frontend
}));







app.get("/protected", auth, (req, res) => {
    return res.status(200).json({ ...req.user._doc }); // Send only the user data
});

app.use("/api",require("./routes/auth"));






mongoose.connect(mongoURI).then(()=>{
  console.log(`connection to database established...`)
}).catch((err)=>{
  console.log('errrr>>',err)
})



const PORT = process.env.PORT || 8001;  
app.listen(PORT, async () => {
    try {
        // await connectDB();
        console.log(`Server listening on port: ${PORT}`);
    } catch (err) {
        console.log(err);
    }
 
});

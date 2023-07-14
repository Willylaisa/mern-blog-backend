const mongoose = require('mongoose')

// Define the User schema for MongoDB using Mongoose
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    decscription: {
        type: String,
    },
    profileImage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }        
})

module.exports = mongoose.model("User", userSchema, "credentials")
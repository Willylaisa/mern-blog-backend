// REQUIREMENTS
const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
const newUser = require('./models/newUser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
dotenv.config()

// MIDDLEWARE MOSTLY FOR GETTING THE FORM DATA FROM THE LOGIN AND SIGNUP PAGES
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(expressValidator())
app.use(bodyParser.json())

// MONGOOSE... FOR CREATING A SCHEMA
mongoose.connect(process.env.URL)
mongoose.connection.on("error", err => {
    console.log(err)
})

// CONNECT TO DATABASE
let database; // global variable to store the MongoDB connection object
function connectDB (callback) {    
    MongoClient.connect(process.env.URL)
    .then((connected)=>{
        database = connected.db()
        return callback()
    })
    .catch(err => {
        console.log(err)
        return callback(err)
    })
}

// SERVER LISTEN
connectDB((err)=> {
    if (!err) {
        const port= process.env.PORT
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    }
})

// ROUTES
// 1. LOGIN
app.post('/login', (req, res) => {
    const email = req.body['email']
    const password = req.body['password']

    let secretInfo = []
    database.collection('credentials')
        .find()
        .forEach(credential => secretInfo.push(credential)) 
        .then(() => {
            for (let i = 0; i < secretInfo.length; i++) {
                if (secretInfo[i].email === email && secretInfo[i].password === password) {
                    return res.redirect('https://mern-blog-y6oh.onrender.com/')
                }                
            }
            res.send('<h1>Error: Email and password don\'t match</h1> <h3>Please go back and sign up if you do not have an account</h3>')
        })  
})

// VALIDATOR MIDDLEWARE
const signUpValidator = (req, res, next) => {
    req.check("username", "Add username").notEmpty()
    req.check("email","Enter a valid Email Address").isEmail()
    req.check("password", "Password must be at least 6 characters long").isLength({min: 6})
    const errors = req.validationErrors()
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0]
        return res.status(400).send(`<h1>error: ${firstError}</h1>`);
    }
    next()
}

// 2. SIGN UP
app.post('/signup', signUpValidator, (req, res)=> {
    const username = req.body['username']
    const email = req.body['email']
    const password = req.body['password']
    const Confirm_password = req.body['confirmPassword'] 

    if (password === Confirm_password) {
        let newuser = new newUser({username, email, password})
        newuser.save()
        .then(res.redirect('https://mern-blog-y6oh.onrender.com/'))
    }
    else {
        res.send('<h1>Passwords do not match!</h1> <h3>Please go back and sign up again<h3>')
    }
})

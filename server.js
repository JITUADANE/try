require('dotenv').config(); // Load environment variables
const express = require('express'); // Import Express
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import JSON Web Token for authentication
const cookieParser = require('cookie-parser'); // Import Cookie Parser
const methodOverride = require('method-override'); // Import Method Override for supporting HTTP verbs like DELETE
const crypto = require('crypto'); // Import Crypto for secure token generation
const { dbConnect, User } = require('./config/dbConnect'); // Import database connection and User model
const authRoutes = require('./routers/authRoutes'); // Import authentication routes
const userRoutes = require('./routers/userRoutes'); // Import user management routes
const nodemailer = require('nodemailer');

const app = express(); // Initialize Express app

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from requests
app.use(methodOverride('_method')); // Support DELETE via `_method` query

// Route setup
app.use('/api/auth', authRoutes); // Use authentication routes
app.use('/api/users', userRoutes); // Use user management routes (different prefix)


console.log(dbConnect); // Log the dbConnect function definition to check if it’s imported correctly

// Check if dbConnect is a function
if (typeof dbConnect === 'function') {
    dbConnect(); // Call the dbConnect function if it's correctly imported
} else {
    console.error('dbConnect is not a function');
}

// to define the structer (blue print) in our mongodb mongoose.Schema


// Create transporter
const transporter  = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'your_email@gmail.com',
        pass: 'generated_app_password' // You should use an app-specific password here
    }
});

// Send email
transporter.sendMail({
    to: 'who_to_send_to@your_domain.com',
    subject: 'My subject',
    html: '<h1>Hello, how are you? You have successfully logged in to Spotlink Event!</h1>'
})
.then(() => {
    console.log("Email sent");  // Corrected to use parentheses
})
.catch((err) => {
    console.error(err);  // Corrected to handle errors properly
});

/////


// So i can see on the browser i will use  view engine to EJS

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
// Middleware for authenticating JWT tokens
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Token missing, please log in'); // so you have a save web so ppl cant asscess it with out the password

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log('JWT Secret:', process.env.ACCESS_TOKEN_SECRET); 
        if (err) return res.status(403).send('Invalid token');
        req.user = user; // Attach decoded user info to request
        next();
    });
}

function authorizeRoles(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('Access Denied');
        }
        next();
    };
}

// to print registration page
app.get('/register', (req, res) => {
    res.render('register');
});

// print  login page
app.get('/login', (req, res) => {
    res.render('login', { messages: {} });
});

app.get('/index', authenticateToken, (req, res) => {
    res.render('index', { user: req.user });
});

// to accept or register a new user based on role
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const role = req.body.role || 'Attendee';

        // Save user to MongoDB
        const user = new User({ 
            name: req.body.name, 
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            role: role
        });

        await user.save();

        // this will send us to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error registering user: ' + error.message);
    }
});

// login route to authenticate user from MongoDB
app.post('/login', async (req, res) => {
    try {
        // Find the user in MongoDB by email
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).render('login', { messages: { error: 'Cannot find user' } });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(403).render('login', { messages: { error: 'Invalid credentials' } });
        }

        // Generate JWT token
        const accessToken = jwt.sign({ 
            id: user._id, 
            name: user.name, 
            role: user.role 
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
        console.log("Generated JWT Token:", accessToken);

        // Set the token in a cookie
        res.cookie('token', accessToken, { httpOnly: true });

        // now we get to the index page depending on our role and password
        res.redirect('/index');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});

// creat a new user but with a role
app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role || 'Attendee',
        });

        // to save on our db
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/// read 
app.get('/users', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const users = await User.find(); // find from mdb
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//update by id 
app.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // find by id
        if (!user) return res.status(404).send('User not found');

        user.name = req.body.name || user.name; // update
        user.email = req.body.email || user.email;
        user.username = req.body.email || user.username;
        user.role = req.body.role || user.role;
        await user.save(); // until save wait

        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// delete 
app.delete('/users/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.send('User deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.listen(5003, () => {
    console.log('Server is running on port 5003');
});

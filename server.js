require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');


app.use(methodOverride('_method')); // This enables support for `DELETE` via the `_method` query
app.use(express.json());
app.use(cookieParser());


// So i can see on the browser i will use  view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); 

// for now store In-memory user storage (i will do mongoos  database 
const users = []; 

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


// Middleware for role-based authorization
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


// Protected route for index
app.get('/index', authenticateToken, (req, res) => {
    res.render('index', { user: req.user });
});


// to accept or register a new user based on role
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const role = req.body.role || 'Attendee'; 

        const user = { 
            id: Date.now().toString(),
            name: req.body.name, 
            email: req.body.email,
            password: hashedPassword, 
            role: role 
        };
        users.push(user); 

        // this will send us to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = users.find(u => u.email === req.body.email);
        if (!user) {
            return res.status(400).render('login', { messages: { error: 'Cannot find user' } });
        }
        
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(403).render('login', { messages: { error: 'Invalid credentials' } });
        }
// here is jwt
        const accessToken = jwt.sign({ 
            name: user.name, 
            role: user.role 
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });

        // Set the token in a cookie
        res.cookie('token', accessToken, { httpOnly: true });

        // now we get to the index page depending on our role and password 
        res.redirect('/index');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});
app.delete('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login'); 
});



app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

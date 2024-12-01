const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
    try {
        const { userName, password, role } = req.body;
        if (!userName || !password) return res.status(400).json({ message: 'Username and password are required' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ userName, password: hashedPassword, role });
        await newUser.save();

        // Respond with success
        res.status(201).json({ message: `User registered with userName: ${userName}` });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong during registration." });
    }
};

const login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        // Find user by userName
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).render('login', { messages: { error: `Cannot find user with userName: ${userName}` } });
        }

        const duplicate = await User.findOne({ userName: user.userName }).exec();
        if (duplicate) return res.sendStatus(409);

        try {
            const hashedPwd = await bcrypt.hash(password, 10);

            const result = await User.create({
                "userName": userName,
                // "role": {"user": 2001}, you don't need to have a role because you have done that previously
                "password": hashedPwd
            });
            console.log(result);
            res.status(201).json({ success: `New user ${userName} created!` });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).render('login', { messages: { error: 'Invalid credentials' } });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong during login." });
    }
};

// Export the functions for use in routes
module.exports = { registerUser, login };

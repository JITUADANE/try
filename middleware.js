// Define `authPage` first
const authPage = (PERMISSION) => {
    return (req, res, next) => {
        const userRole = req.headers.role;
        if (PERMISSION.includes(userRole)) {
            next();
        } else {
            return res.status(401).json("You don't have permission!");
        }
    };
};

// Define `authcourse after `authPage`
const authcourse = (req, res, next) => {
    // Your logic for authcourse, if any
    next();
};

// Export both functions
module.exports = { authPage, authcourse };

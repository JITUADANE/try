const User = require('../models/user');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // find from mdb
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
module.exports={getAllUsers };

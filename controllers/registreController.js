const User = require('../model/user');
const bcrypt = require('bcrypt');
const {create} = require('../modules/user');

const handleNewUser = async(req, res)=> {
    const{ user, pwd} =req.body;
    if (!user || !pwd) return res.status(400).jason ({'message': 'Username and password are required'});
    
    
    const duplicate = await User.findone({username: user }).exec();
    if (duplicate) return res.sendStatus(409);

    try {
        const hashedPwd = await bcrypt.hash(pwd, 10);
        
        const result = await user.create({
            "username": usser,
           // "role": {"user": 2001}, u dont need to have a role because you have done that preveiously 
            "password": hashedPwd
        });
        console.log(result);
        res.status(201).jason({ 'success': 'New user ${user} created!' });
        catch (err){
            res.status (500).json({ 'message': err.message });
        }
    }
    module.exports = {handleNewUser};

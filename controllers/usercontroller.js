const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();

exports.register = async (req, res) => {
    const { name, email, password, role, branch } = req.body;

    // Check if current user is admin
    if (!isAdmin(req)) {
        return res.status(403).json({ msg: 'Unauthorized' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role,
            branch,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.registerAdmin = async (req, res) => {
    const { name, email, password, role, branch } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Admin already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role: 'admin',
            branch,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ msg: 'Admin registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { name, password } = req.body;

    try {
        let user = await User.findOne({ name });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role : user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginAdmin = async (req, res) => {
    const { name, password } = req.body;

    try {
        let user = await User.findOne({ name });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const payload = {
            user: {
                id: user.id,
                role : user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAllUsers = async (req, res) => {
    // Check if current user is admin
    // console.log(req.name);
    // if (!isAdmin(req)) {
    //     return res.status(403).json({ msg: 'kon ho  ' });
    // }


    

    const bearer = req.headers['authorization'];
    // console.log("bea verify", bearer)
    const arrayToken = bearer.split(" ");
    const token = arrayToken[2];
    // console.log("Verification token", token)
    jwt.verify(token, process.env.JWT_SECRET, (err,authData) =>{
        if(err){
           return res.send({msg:'Invalid Token',err})
        }
        else{
           return res.json({
                msg:"Profile Accessed",
                authData
            })
        }
    })
        // Implement your logic to check if the current user is an admin
        // For example, you might check the user role stored in JWT token or session
        // This function should return true if the user is admin, otherwise false
       
    



    try {
        const users = await User.find().select('-password');
       return res.json(users);
    } catch (err) {
        console.error(err.message);
       return res.status(500).send('Server error');
    }
};

// Helper function to check if user is admin (example implementation)
// function isAdmin(req,res) {

//     jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
        
//         console.log("odd token",req.token);
//         if (err) {
//             console.error(err); // Log the error for debugging purposes
//             return res.status(403).json({ msg: 'Authentication failed' });
//         } else {
//             // AuthData contains the decoded JWT payload
//             console.log(authData);
    
//             // Assuming req.user is set elsewhere in your middleware or authentication process
//             if (req.user && req.user.role === 'admin') {
//                 // Proceed with admin-only logic
//                 return res.json({ msg: 'Admin authenticated successfully', authData });
//             } else {
//                 return res.status(403).json({ msg: 'Unauthorized access' });
//             }
//         }
//     });
//     // Implement your logic to check if the current user is an admin
//     // For example, you might check the user role stored in JWT token or session
//     // This function should return true if the user is admin, otherwise false
   
// }


// function isAdmin(req, res, next) {

//     const bearerHeader = req.headers['authorization'];
//     // Implement your logic to check if the current user is an admin
//     // For example, you might check the user role stored in JWT token or session
//     if (typeof bearerHeader !== 'undefined') {
//         const bearer = bearerHeader.split(" ");
//         const token = bearer[2];
//         // req.token = token;
//         // console.log(bearer[2]);
//         console.log(token);

//         // return next(); // User is admin, proceed to next middleware/route handler
//     } else {
//         return res.status(403).json({ msg: 'U' });
//     }
// }
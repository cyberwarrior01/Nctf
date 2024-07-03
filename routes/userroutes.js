const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');

const dotenv = require('dotenv');
dotenv.config();

// Register a new user (only accessible to admins)
router.post('/register', verification, userController.register);

// Register a new admin
router.post('/register/admin', userController.registerAdmin);

// Login a user
router.post('/login', userController.login);

// Login an admin
router.post('/login/admin', userController.loginAdmin);

// Get all users (only accessible to admins)
//router.get('/', verification, userController.getAllUsers);


router.get('/', verification, userController.getAllUsers);




// Helper function to check if user is admin (middleware)
function verification(req, res, next) {
    // console.log("Headers", req.headers)
    const bearerHeader = req.headers['authorization'];
    // Implement your logic to check if the current user is an admin
    // For example, you might check the user role stored in JWT token or session
    // console.log("Bearer", bearerHeader);

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");

        // console.log("Bearer", bearer);
        const token = bearer[2];
        // console.log("Token", token);
        req.token = token;  
        // console.log(bearer[2]);
        // console.log("Verification Token", token);

        return next(); // User is admin, proceed to next middleware/route handler
    } else {
        return res.status(403).json({ msg: 'U' });
    }
}

module.exports = router;


// router.get('/', verification, (req, res) =>{
//     // console.log("secret", process.env.JWT_SECRET)
//     // console.log("Request token", req)

//     const bearer = req.headers['authorization'];
//     console.log("bea verify", bearer)
//     const arrayToken = bearer.split(" ");
//     const token = arrayToken[2];
//     console.log("Verification token", token)
//     jwt.verify(token, process.env.JWT_SECRET, (err,authData) =>{
//         if(err){
//             res.send({msg:'Invalid Token',err})
//         }
//         else{
//             res.json({
//                 msg:"Profile Accessed",
//                 authData
//             })
//         }
//     })
// });

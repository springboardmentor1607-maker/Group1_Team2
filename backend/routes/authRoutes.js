const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
console.log("AUTH ROUTES WORKING");
router.post('/register', register);
router.post('/login', login);
router.get('/test', (req,res)=>{
   res.send("AUTH OK");
});

module.exports = router;
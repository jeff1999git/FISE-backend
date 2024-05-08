const express = require("express")
const userModel = require("../models/userModel")
const validateModel=require("../models/validateModel")
const mailerModel=require("../models/mailerModel")
const bcrypt = require("bcryptjs")

const router = express.Router()

hashPasswordgenerator = async (pass) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(pass, salt)
}

router.post('/signup', async (req, res) => {
    try {
        let { data } = { "data": req.body };
        let password = data.user_password;
        let email = data.user_email;
        const { isValid, message } = await validateModel.validateAndCheckEmail(email);
        if (!isValid) {
            return res.status(400).json({ message });
        }
        // if (!validateModel.validatePassword(password)) {
        //     return res.status(400).send('Password should be 8 character long with atleast one uppercase,lowercase,special character and a digit');
        // }
        const hashedPassword = await hashPasswordgenerator(password);
        data.user_password = hashedPassword;

        // Insert the user into the database
        userModel.insertUser(data, async(error, results) => {
            if (error) {
                res.status(500).send('Error inserting user data: ' + error);
                return;
            }
            return res.json({ status: "success"})
            // try {
            //     let user_name=data.user_name;
            //     let textsend = `Dear ${user_name},\n\nYou have successfully registered.`;
            //     let subjectheading = 'Successfully Registered'
            //     // Send password reset email
            //     await mailerModel.sendEmail(email, subjectheading, textsend);
            //     return res.json({ status: "success", message: "Message has been sent to your email" });
            // } catch (error) {
            //     return res.status(500).json({ error: error.message });
            // }
        });
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', (req, res) => {
    const { user_email, user_password } = req.body;

    userModel.userLogin(user_email, (error, user) => { 
        if (error) {
            return res.json({
                status: "Error"
            });
        }
        if (!user) {
            return res.json({
                status: "invalid emailID"
            });
        }
        // Compare the password retrieved from the database with the provided password
        bcrypt.compare(user_password, user.user_password, (err, isMatch) => {
            if (err) {
                return res.json({
                    status: "Error"
                });
            }
            if (!isMatch) {
                return res.json({
                    status: "incorrect password"
                });
            }
            return res.json({
                status: "Success",
                userData: user,
            });
        })
    });
});

module.exports = router
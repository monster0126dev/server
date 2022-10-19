const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const config = require("../config/keys");
const isEmpty = require("../utils/is-Empty");
const ValidateSignUp = require("../utils/validateSignUp").validateSignUp;
const ValidateSignIn = require("../utils/validateSignIn").validateSignIn;

// @API    POST /signup
// @DESC   Sign up new user
// @PARAM  User data
router.post("/signup", async (req, res) => {
    const { errors, isValid } = ValidateSignUp(req.body);

    // validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // check email already exist
    const user = await prisma.user.findFirst({
        where: {
            email: req.body.email,
        },
    });

    if (user) {
        errors.email = "Email already exist";
        return res.status(400).json(errors);
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);

    const newUser = await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            password: hash
        },
    });

    return res.status(200).json(newUser);
});

// @API     POST /signin
// @DESC    Sign in
// @PARAMS  User email & password
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const { errors, isValid } = ValidateSignIn(req.body);

    // validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    if (!user) {
        errors.email = "User not found";
        return res.status(400).json(errors);
    }

    // check password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
        errors.password = "Password incorrect";
        res.status(400).json(errors);
    }

    // User matched
    const payload = {
        id: user.id,
    };

    // jsonwebtoken generate
    jwt.sign(payload, config.secretOrKey, { expiresIn: 3600 }, (error, token) => {
        if (error) {
            errors.token = "Error generating token";
            return res.status(400).json(errors);
        }

        return res.status(200).json({
            success: true,
            token: token,
        });
    });
});

//API     POST /verify
//@DESC   Verify token
//@PARAMS Token data
router.post("/verify", async (req, res) => {
    const { token } = req.body;

    if(isEmpty(token)) {
        res.status(301).json({
            verify: false,
            error: "Empty token",
        });
    } else {
        try {
            const decoded = jwt.verify(token, config.secretOrKey);
            const {id} = decoded;
            const user = await prisma.user.findUnique({
                where: {
                    id: id,
                },
            })
            
            if(user) res.status(200).json(user);
            else
                res.status(301).json({
                    verify: false,
                    error: "User not found",
                })

        } catch(error) {
            res.status(301).json({
                verify: false,
                error: error,
            })
        }
    }
})

module.exports = router;
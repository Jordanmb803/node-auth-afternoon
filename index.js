require('dotenv').config()
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const students = require('./students.json');

const {
    SECRET,
    DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    CALLBACK_URL
} = process.env

const app = express();
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: '/login',
    scope: 'openid email profile'
},
    function (accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile)
    }
))
passport.serializeUser(function (user, done) {
    return done(null, { clientID: user.id, email: user._json.email, name: user._json.name })
})
passport.deserializeUser(function (obj, done) {
    return done(null, obj)
})

app.get('/auth', passport.authenticate('auth0'))
app.get('/login', passport.authenticate('auth0',
    {
        successRedirect: '/students',
        failureRedirect: 'http://localhost:3000/#/fail',
        connection: 'github'
    }
)
)

function authenticated(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.sendStatus(401)
    }
}
app.get('/students', authenticated, (req, res) => {
    res.status(200).send(students)
})

const port = 3005;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// Home page route (Simple Kitchen main page)
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

// Registration form route
router.get('/register', (req, res) => {
  res.render('form', { title: 'Register to subscribe' });
});

// Thank you page route
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank you for your registration!' });
});

// View registrations route (protected)
router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

// Handle registration form submission
router.post('/register', 
    [
        check('name')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
        check('email')
        .isLength({ min: 1 })
        .withMessage('Please enter an email'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          const registration = new Registration(req.body);
          registration.save()
            .then(() => {
              res.redirect('/thankyou');
            })
            .catch((err) => {
              console.log(err);
              res.send('Sorry! Something went wrong.');
            });
          } else {
            res.render('form', { 
                title: 'Register to subscribe',
                errors: errors.array(),
                data: req.body,
             });
          }
    });

module.exports = router;
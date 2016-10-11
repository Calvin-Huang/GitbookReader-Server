var express = require('express');
var passport = require('passport');
var router = express.Router();

import { User } from '../models';
// import { authenticate } from '../middlewares';
import { authenticate } from '../middlewares/authenticate';

/* GET users listing. */
router.get('/', authenticate, async (req, res, next) => {
  res.json(req.user)
});

router.get('/auth/gitbook', passport.authenticate('gitbook'));

router.all('/auth/gitbook/callback',
  passport.authenticate('gitbook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(`/users?token=${req.user.token}`);
  });

module.exports = router;
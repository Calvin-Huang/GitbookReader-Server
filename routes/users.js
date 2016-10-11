var express = require('express');
var passport = require('passport');
var router = express.Router();

import { User } from '../models';

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const user = await User.findOne({ token: req.query.token })
  res.send(JSON.stringfy(user));
});

router.get('/auth/gitbook', passport.authenticate('gitbook'));

router.all('/auth/gitbook/callback',
  passport.authenticate('gitbook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(`/users?token=${req.user.token}`);
  });

module.exports = router;

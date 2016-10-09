var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.redirect('/');
});

router.get('/auth/gitbook', passport.authenticate('gitbook'));

router.get('/auth/gitbook/callback',
  passport.authenticate('gitbook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = router;

var express = require('express');
var passport = require('passport');
var fetch = require('node-fetch');
var cheerio = require('cheerio');
var router = express.Router();

import { User } from '../models';
// import { authenticate } from '../middlewares';
import { authenticate } from '../middlewares/authenticate';

/* GET users listing. */
router.get('/', authenticate, async (req, res, next) => {
  res.json(req.user)
});

router.get('/:username/starred', async (req, res, next) => {
  const html = await fetch(`https://www.gitbook.com/@${req.params.username}/starred`)
    .then((response) => {
      return response.text()
    });

  const $ = cheerio.load(html);

  const result = $('#AuthorProfile .Books:first-child .Book')
    .map((i, book) => {
      const anchor = $(book).find('h4.title > a');
      const bookInfos = anchor.attr('href').split('/');
      return {
        bid: bookInfos[bookInfos.length - 1],
        author: bookInfos[bookInfos.length - 2],
        title: anchor.text(),
        description: $(book).find('p.description').text(),
      };
    })
    .get();

  res.json(result);
});

router.get('/auth/gitbook', passport.authenticate('gitbook'));

router.all('/auth/gitbook/callback',
  passport.authenticate('gitbook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(`/users?token=${req.user.token}`);
  });

module.exports = router;
var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();

import { User, Book } from '../models';
import { authenticate } from '../middlewares/authenticate';

router.get('/', authenticate, async (req, res, next) => {
  const books = await Book.findAll({
    where: {
      id: req.user.books
    }
  })
  res.json(books)
});

router.put('/', authenticate, async (req, res, next) => {
  const bookIds = req.body.bookIds;
  if (bookIds !== undefined) {
    try {
      await User.update({
        books: bookIds
      }, {
        where: {
          id: req.user.id
        }
      });

      const renewUser = await User.findOne({
        where: {
          id: req.user.id
        }
      });

      req.login(renewUser, function(err) {
        if (err) return next(err)
      })

      const books = await Book.findAll({
        where: {
          id: req.user.books
        }
      })

      res.json({books: books});

      // existsBooks.map((book) => { book.id })
      //
      // const books = Book.findOrCeate
    } catch (err) {
      res.json({ success: false, message: err.message })
    }
  } else {
    res.json({ success: false, message: 'Parameter not found.' })
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const html = await fetch(`https://www.gitbook.com/search?q=${req.query.q}`)
      .then((response) => {
        return response.text();
      });

    const searchResultRawJSON = $.text()
      .replace(/[.\s\S]*window\.Pages\.Search,\sprops:\s(.*)/i, "$1")
      .replace(/(.*)\s}\),document\.getElementById[.\s\S]*/i, "$1")
      .replace(/(\n|\r)/, '');

    if (searchResultRawJSON == '') {
      throw Error('empty response');
    }

    if (!searchResultRawJSON.match(/^\{\"total\":\{\"books\":\d+,\"authors\":\d+},\"results\":{\"list\":\[[.\s\S]*\],\"total\":\d+,\"limit\":\d+,\"page\":\d+,\"pages\":\d+\},\"type\":\"\w+\",\"sort\":\"\w+\",\"config\":\{\"version\":\"[.\s\S]+\",\"hasBlog\":(true|false),\"isEnterprise\":(true|false),\"apiHost\":\"[.\s\S]+\",\"mainHost\":\"[.\s\S]+\",\"stripePublicKey\":\"[.\s\S]+\",\"gaToken\":\"[.\s\S]+\"\},\"req\":\{\"date\":\"[.\s\S]+\",\"csrfToken\":\"[.\s\S]+\",\"query\":\{\"q\":\"\w+\"\},\"url\":\"[.\s\S]+\",\"duration\":\d+\}\}/i)) {
      throw Error(searchResultRawJSON);
    } else {

    }

    res.status(200).send(searchResultRawJSON);
  } catch (err) {
    res.status(403).json({ message: err.message })
  }
});

module.exports = router;
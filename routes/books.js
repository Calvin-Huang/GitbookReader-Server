var express = require('express');
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

module.exports = router;
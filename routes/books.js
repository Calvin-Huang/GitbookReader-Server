var express = require('express');
var router = express.Router();

import { Book } from '../models';
import { authenticate } from '../middlewares/authenticate';

router.get('/', authenticate, async (req, res, next) => {
  const books = await Book.findAll({
    where: {
      userId: req.user.id
    }
  })
  res.json(books)
});

module.exports = router;
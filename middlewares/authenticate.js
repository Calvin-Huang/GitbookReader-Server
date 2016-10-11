import { User } from '../models'

var util = require('util');

const authenticate = async (req, res, next) => {
  if (res.user === undefined) {
    const authenticateToken = req.headers['authentication-token'] || req.query.token;

    if (authenticateToken !== undefined) {
      const user = await User
        .findOne({
            where: {
              token: authenticateToken
            }
        })

      if (user !== undefined) {
        req.login(user, (error) => {
          if (error) {
            return next(error);
          }

          next();
        })
      } else {
        return res.status(403).json({ success: false, message: 'Failed to authenticate token.' })
      }
    } else {
      return res.status(403).json({ success: false, message: 'No token provided.' })
    }
  } else {
    next()
  }
}

export { authenticate };
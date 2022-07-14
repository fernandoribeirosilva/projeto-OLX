const User = require('../models/User');

module.exports = {
   private: async (req, res, next) => {
      if (!req.query.token && !req.body.token) return res.status(401).json({ notAllowed: true });

      const token = req.query.token || req.body.token;

      if (token === '') return res.status(401).json({ notAllowed: true });

      const user = await User.findOne({ token });

      if (!user) return res.status(401).json({ notAllowed: true });

      next();
   }
}
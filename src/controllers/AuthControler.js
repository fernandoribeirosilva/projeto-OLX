const { validationResult, matchedData } = require('express-validator');

module.exports = {
   signin: async (req, res) => {

   },

   signup: async (req, res) => {
      const erros = validationResult(req);

      if (!erros.isEmpty()) {
         res.status(400).json({ error: erros.mapped() });
         return;
      }

      const data = matchedData(req);

      res.status(200).json({ ok: true, data });
   },
}
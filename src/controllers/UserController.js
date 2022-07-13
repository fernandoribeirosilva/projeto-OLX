const State = require('../models/State');

module.exports = {
   getStates: async (req, res) => {
      try {
         const states = await State.find();

         if (!states) throw new Error('States not found');

         return res.json({ states });
      } catch (error) {
         return res.json({ msg: 'Não tem estados cadastrados!' });
      }
   },

   info: async (req, res) => {

   },

   editAction: async (req, res) => {

   },

}
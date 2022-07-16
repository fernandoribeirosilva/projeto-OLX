const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');

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
      let { token } = req.query;

      const user = await User.findOne({ token });
      const state = await State.findById(user.state);
      const ads = await Ad.find({ idUser: String(user._id) });

      let adList = [];
      for (let i in ads) {
         const category = await Category.findById(ads[i].category);
         adList.push({ ...ads[i], category: category.slug });
      }

      res.json({
         name: user.name,
         email: user.email,
         state: state.name,
         ads: adList
      });
   },

   editAction: async (req, res) => {

   },

}
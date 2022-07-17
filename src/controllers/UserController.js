const { validationResult, matchedData } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
      const erros = validationResult(req);

      if (!erros.isEmpty()) {
         res.status(400).json({ error: erros.mapped() });
         return;
      }
      const data = matchedData(req);

      let updates = {};


      if (data.name) updates.name = data.name;

      if (data.email) {
         const emailCheck = await User.findOne({ email: data.email });
         if (emailCheck) {
            res.json({ error: 'E-mail já existe.' });
            return;
         }
         updates.email = data.email;
      }

      if (data.state) {
         if (mongoose.Types.ObjectId.isValid(data.state)) {
            const stateCheck = await State.findById(data.state);
            if (!stateCheck) {
               res.json({ error: 'Estado não existe.' });
               return;
            }
            updates.state = data.state;
         } else {
            res.json({
               error: { state: { msg: 'Código de estado inválido.' } }
            });
            return;
         }
      }

      if (data.password) {
         updates.passwordHash = await bcrypt.hash(data.password, 10);
      }

      await User.findOneAndUpdate({ token: data.token }, updates, { new: true });

      res.json({});
   },
}
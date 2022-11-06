const express = require('express')
const router = express.Router()
const Player = require('../models/player')

router.get('/', async (req, res) => {
  let players
  try {
    players = await Player.find().sort({ selectedAt: 'desc' }).limit(10).exec()
  } catch {
    players = []
  }
  res.render('index', { players: players })
})

module.exports = router
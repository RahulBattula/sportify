const mongoose = require('mongoose')
const Player = require('./player')

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

tournamentSchema.pre('remove', function(next) {
  Player.find({ tournament: this.id }, (err, players) => {
    if (err) {
      next(err)
    } else if (players.length > 0) {
      next(new Error('This tournament has players still'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Tournament', tournamentSchema)
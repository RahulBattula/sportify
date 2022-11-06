const express = require('express')
const router = express.Router()
const Tournament = require('../models/tournament')
const Player = require('../models/player')

// All Tournaments Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const tournaments = await Tournament.find(searchOptions)
    res.render('tournaments/index', {
      tournaments: tournaments,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New tournament Route
router.get('/new', (req, res) => {
  res.render('tournaments/new', { tournament: new Tournament() })
})

// Create Tournament Route
router.post('/', async (req, res) => {
  const tournament = new Tournament({
    name: req.body.name
  })
  try {
    const newTournament = await tournament.save()
    res.redirect(`tournaments/${newTournament.id}`)
  } catch {
    res.render('tournaments/new', {
      tournament: tournament,
      errorMessage: 'Error creating Tournament'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    const players = await Player.find({ tournament: tournament.id }).limit(6).exec()
    res.render('tournaments/show', {
      tournament: tournament,
      playersByTournament: players
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
    res.render('tournaments/edit', { tournament: tournament })
  } catch {
    res.redirect('/tournaments')
  }
})

router.put('/:id', async (req, res) => {
  let tournament
  try {
    tournament = await Tournament.findById(req.params.id)
    tournament.name = req.body.name
    await tournament.save()
    res.redirect(`/tournaments/${tournament.id}`)
  } catch {
    if (tournament == null) {
      res.redirect('/')
    } else {
      res.render('tournaments/edit', {
        tournament: tournament,
        errorMessage: 'Error updating Tournament'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let tournament
  try {
    tournament = await Tournament.findById(req.params.id)
    await tournament.remove()
    res.redirect('/tournaments')
  } catch {
    if (tournament == null) {
      res.redirect('/')
    } else {
      res.redirect(`/tournaments/${tournament.id}`)
    }
  }
})

module.exports = router
const express = require('express')
const router = express.Router()
const Player = require('../models/player')
const Tournament = require('../models/tournament')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// All Players Route
router.get('/', async (req, res) => {
  let query = Player.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.selectedBefore != null && req.query.selectedBefore != '') {
    query = query.lte('selectDate', req.query.selectedBefore)
  }
  if (req.query.selectedAfter != null && req.query.selectedAfter != '') {
    query = query.gte('selectDate', req.query.selectedAfter)
  }
  try {
    const players = await query.exec()
    res.render('players/index', {
      players: players,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Player Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Player())
})

// Create Player Route
router.post('/', async (req, res) => {
  const player = new Player({
    title: req.body.title,
    tournament: req.body.tournament,
    selectDate: new Date(req.body.selectDate),
    prizesWon: req.body.prizesWon,
    description: req.body.description
  })
  saveCover(player, req.body.cover)

  try {
    const newPlayer = await player.save()
    res.redirect(`players/${newPlayer.id}`)
  } catch {
    renderNewPage(res, player, true)
  }
})

// Show Player Route
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
                           .populate('tournament')
                           .exec()
    res.render('players/show', { player: player })
  } catch {
    res.redirect('/')
  }
})

// Edit Player Route
router.get('/:id/edit', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
    renderEditPage(res, player)
  } catch {
    res.redirect('/')
  }
})

// Update Player Route
router.put('/:id', async (req, res) => {
  let player

  try {
    player = await Player.findById(req.params.id)
    player.title = req.body.title
    player.tournament = req.body.tournament
    player.selectDate = new Date(req.body.selectDate)
    player.pageCount = req.body.prizesWon
    player.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(player, req.body.cover)
    }
    await player.save()
    res.redirect(`/players/${player.id}`)
  } catch {
    if (player != null) {
      renderEditPage(res, player, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Player 
router.delete('/:id', async (req, res) => {
  let player
  try {
    player = await Player.findById(req.params.id)
    await player.remove()
    res.redirect('/players')
  } catch {
    if (player != null) {
      res.render('players/show', {
        player: player,
        errorMessage: 'Could not remove Player'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, player, hasError = false) {
  renderFormPage(res, player, 'new', hasError)
}

async function renderEditPage(res, player, hasError = false) {
  renderFormPage(res, player, 'edit', hasError)
}

async function renderFormPage(res, player, form, hasError = false) {
  try {
    const tournaments = await Tournament.find({})
    const params = {
      tournaments: tournaments,
      player: player
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Player'
      } else {
        params.errorMessage = 'Error Creating Player'
      }
    }
    res.render(`players/${form}`, params)
  } catch {
    res.redirect('/players')
  }
}

function saveCover(player, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    player.coverImage = new Buffer.from(cover.data, 'base64')
    player.coverImageType = cover.type
  }
}

module.exports = router
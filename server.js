if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const tournamentRouter = require('./routes/tournaments')
const playerRouter = require('./routes/players')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.DATABASE_URL, { useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to MongoDb'))

app.use('/', indexRouter)
app.use('/tournaments', tournamentRouter)
app.use('/players', playerRouter)

app.listen(process.env.PORT || 3000)
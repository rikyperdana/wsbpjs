var
dotenv = require('dotenv').config(),
express = require('express'),
bodyParser = require('body-parser'),
fkrtl = require('./fkrtl')['fkrtl'],
kamar = require('./kamar')['kamar'],

app = express()
.use((req, res, next) => [
  // karena secara default bpjs api tidak memberikannya
  req.headers['content-type'] = 'application/json',
  next()
])
.use(bodyParser.json())
.post('/fkrtl/:api', fkrtl)
.post('/kamar/:api', kamar)
.use(express.static('public'))

var server = require('http').Server(app).listen(
  process.env.port || 3000
)
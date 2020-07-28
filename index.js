var express = require('express'),
bodyParser = require('body-parser'),
fkrtl = require('./fkrtl')['fkrtl'],
kamar = require('./kamar')['kamar'],

app = express()
.use((req, res, next) => [
  req.headers['content-type'] = 'application/json',
  next()
])
.use(bodyParser.json())
.post('/fkrtl/:api', fkrtl)
.post('/kamar/:api', kamar)
.use(express.static('public'))

var server = require('http').Server(app).listen(3000)

var
mongoDB = require("mongodb"),
_ = require('lodash'),
moment = require('moment'),
lastToken = '',
cekToken = token => token === lastToken,
kodepoli = require('./kodepoli')['kodepoli'],
tindakan = require('./tindakan')['tindakan'],
refpoli = ['INT', 'ANA', 'OBG', 'BED', 'GIG'],
withThis = (obj, cb) => cb(obj),

startOfTheDay = timestamp => +moment(
  moment(timestamp).format('YYYY-MM-DD')
),

randomId = () =>
  [1, 1].map(() =>
    Math.random().toString(36).slice(2)
  ).join(''),

dbCall = action => mongoDB.MongoClient.connect(
  process.env.atlas,
  {useNewUrlParser: true, useUnifiedTopology: true},
  (err, client) => [action(client.db(process.env.dbname))]
),

response = obj => ({
  response: obj, metadata: {message: 'Ok', code: 200}
}),

errorResponder = (cb, text) => cb.send(response({
  error: text || 'data atau token tidak valid, perbaiki'
})),

validityCheck = array => array.filter(i => !i[0]).map(i => i[1]),

jadwalOperasi = (pasien, rawat, item) =>
({
  kodebooking: item.idtindakan.substring(0, 8),
  tanggaloperasi: moment(item.jadwal).format('YYYY-MM-DD'),
  jenistindakan: tindakan.find(
    v => v._id === item.idtindakan
  ).nama,
  kodepoli: refpoli[rawat.klinik-1],
  namapoli: kodepoli[refpoli[rawat.klinik-1]],
  terlaksana: 0,
  nopeserta: pasien.identitas.bpjs,
  lastupdate: +moment()
}),

fkrtl = (req, res) => ({
  getToken: () => withThis(validityCheck([
    [req.body.username === process.env.username, 'username salah'],
    [req.body.password === process.env.password, 'password salah']
  ]), errors => !errors.length ? withThis(
    randomId(), token => [
      lastToken = token,
      res.send(response({token: token}))
    ]
  ) : errorResponder(res, errors.join())),

  getNoAntrean: () => withThis(validityCheck([
    [cekToken(req.headers['x-token']), 'token salah'],
    [req.body.nomorkartu, 'nomor kartu salah'],
    [+moment(req.body.tanggalperiksa) > startOfTheDay(+moment()), 'tanggal periksa harus pada hari lain'],
    [+moment(req.body.tanggalperiksa).day(), 'hanya hari kerja saja'],
    [kodepoli[req.body.kodepoli], 'kode poli salah'],
    [[1, 2].includes(req.body.jenisreferensi), 'jenis referensi salah'],
    [[1, 2].includes(req.body.jenisrequest), 'jenis request salah']
  ]), errors => !errors.length ? withThis(
    randomId(), kodebooking =>
    dbCall(db =>
      db.collection('queue').find({
        nomorkartu: req.body.nomorkartu,
        tanggalperiksa: req.body.tanggalperiksa
      }).toArray((err, arr) => arr.length === 0 ? dbCall(
          db => db.collection('queue').countDocuments({
            tanggalperiksa: req.body.tanggalperiksa
          })
          .then(number => db.collection('queue').insertOne({
            _id: kodebooking,
            no_antrian: 'R'+(number+1),
            nomorkartu: req.body.nomorkartu,// 0000000000000123
            nik: req.body.nik, // 1471071611890001
            notelp: req.body.notelp, // 08117696000
            tanggalperiksa: req.body.tanggalperiksa, // "2019-12-11"
            kodepoli: req.body.kodepoli, // "001", panduan ada di gSheets
            nomorreferensi: req.body.nomorreferensi, // "0001R0040116A000001"
            jenisreferensi: req.body.jenisreferensi, // 1, {1: rujukan, 2: kontrol}
            jenisrequest: req.body.jenisrequest, // 2, {1: pendaftaran, 2: poli}
            polieksekutif: req.body.polieksekutif, // 2, {1: eksekutif, 2: reguler}
            timestamp: Date.now()
          }, (fail, ok) => res.send(response({
            nomorantrean: 'R'+(number+1), kodebooking,
            jenisantrean: +req.body.jenisrequest,
            estimasidilayani: +moment(req.body.tanggalperiksa),
            namapoli: kodepoli[req.body.kodepoli],
            namadokter: ''
          }))))
        ) : errorResponder(res, 'sudah booking pada hari tersebut')
      )
    )
  ) : errorResponder(res, errors.join())),

  getRekapAntrean: () =>
  withThis(validityCheck([
    [cekToken(req.headers['x-token']), 'token salah'],
    [kodepoli[req.body.kodepoli], 'kode poli salah'],
    [+moment(req.body.tanggalperiksa), 'tanggal periksa salah']
  ]), errors => !errors.length ? withThis([
    {timestamp: {$gt: startOfTheDay(
      +moment(req.body.tanggalperiksa)
    )}},
    {kodepoli: req.body.kodepoli}
  ], conds => dbCall(
    db => db.collection('queue').countDocuments({$and: conds})
    .then(totalantrean => db.collection('queue').countDocuments(
      {$and: conds.concat([{done: true}])}
    ).then(jumlahterlayani => res.send(response({
      namapoli: kodepoli[req.body.kodepoli],
      totalantrean, jumlahterlayani,
      lastupdate: !moment()
    }))))
  )) : errorResponder(res, errors.join())),

  getKodeBookingOperasi: () =>
  withThis(validityCheck([
    [cekToken(req.headers['x-token']), 'token salah'],
    [req.body.nopeserta, 'nomor peserta kosong']
  ]), errors => !errors.length ? dbCall(
    db => db.collection('patients')
    .findOne({'identitas.bpjs': req.body.nopeserta})
    .then(i => res.send(response({list:
      _.flattenDeep(([]).concat(
        i.rawatJalan || [],
        i.emergency || []
      ).map(
        j => j.soapDokter && j.soapDokter.tindakan &&
        j.soapDokter.tindakan.map(
          k => k.jadwal && jadwalOperasi(i, j, k)
        )
      )).filter(l => l)
    })))
  ) : errorResponder(res, errors.join())),

  getJadwalOperasi: () =>
  withThis(validityCheck([
    [cekToken(req.headers['x-token']), 'token salah'],
    [
      +moment(req.body.tanggalawal) < +moment(req.body.tanggalakhir),
      'tanggal awal harus lebih kecil dari tanggal akhir'
    ]
  ]), errors => !errors.length ? dbCall(
    db => db.collection('patients').find({}).toArray()
    .then(array => res.send(response({list:
      _.flattenDeep(array.map(i => ([]).concat(
        i.rawatJalan || [],
        i.emergency || [],
      ).map(
        j => j.soapDokter && j.soapDokter.tindakan &&
        j.soapDokter.tindakan.map(k =>
          k.jadwal && [
            k.jadwal > +moment(req.body.tanggalawal),
            k.jadwal < +moment(req.body.tanggalakhir)
          ].every(Boolean) &&
          jadwalOperasi(i, j, k)
        ).filter(l => l)
      ).filter(l => l)))
    })))
  ) : errorResponder(res, errors.join()))

}[req.params.api]())

exports.fkrtl = fkrtl
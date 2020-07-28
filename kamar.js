var mongoDB = require("mongodb"),
_ = require('lodash'),
CronJob = require('cron').CronJob,
CryptoJS = require('crypto-js'),
fetch = require('node-fetch'),
withThis = (obj, cb) => cb(obj),
base_url = process.env.stage === 'production' ?
  process.env.base_url_prod
  : process.env.base_url_dev,

timestamp = () =>
  Math.floor(Date.now()/1000).toString(),

encrypt = (data, secret) =>
  CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(data, secret)
  ),

signature = () => encrypt(
  [process.env.cons_id, '&', timestamp()].join(''),
  process.env.secret_key
),

dbCall = action => mongoDB.MongoClient.connect(
  process.env.atlas,
  {useNewUrlParser: true, useUnifiedTopology: true},
  (err, client) => err ? console.log(err)
    : action(client.db(process.env.dbname))
),

beds = {
  vip: {tarif: 350, kamar: {tulip: 1, bougenvil: 1, sakura: 1}},
  kl3: {tarif: 200, kamar: {kenanga: 2, cempaka: 2, claudia: 2, ferbia: 2, yasmin: 2, edelwise: 2}},
  kl2: {tarif: 150, kamar: {seroja: 4, mawar: 2, dahlia: 2, lili: 2, zahara: 2, matahari: 4}},
  kl1: {tarif: 100, kamar: {anggrek: 4, teratai: 8, kertas: 4, melati: 4}}
},

headers = () => ({
  'Content-Type': 'application/json',
  'X-cons-id': process.env.cons_id,
  'X-timestamp': timestamp(),
  'X-signature': signature()
}),

autoUpdateKamar = (new CronJob(
  '0 0 */3 * * *', // per 3 jam
  () => dbCall(db =>
    db.collection('patients').find({
      rawatInap: {$elemMatch: {
        keluar: {$exists: false}
      }}
    }).toArray().then(res =>
      withThis(
        {
          used: _.flattenDeep(res.map(
            i => i.rawatInap
            .filter(j => !j.keluar)
            .map(j => j.bed)
          )).filter(Boolean)
          .reduce((res, inc) => _.assign(res, {
            [inc.kamar]: (res[inc.kamar] || 0) + 1
          }), {}),
          bedList: _.flattenDepth(
            _.map(beds, (a, b) =>
              _.map(a, c => _.map(c, (d, e) =>
                ({kelas: b, kamar: e, kapasitas: c[e]})
              ))
            )
          , 2)
        },
      ({used, bedList}) =>
        bedList.reduce((res, inc) =>
          [
            ...res,
            _.includes(_.keys(used), inc.kamar) ? {
              kodekelas: inc.kelas,
              koderuang: inc.kamar,
              namaruang: _.startCase(inc.kamar),
              kapasitas: inc.kapasitas,
              tersedia: (inc.kapasitas - used[inc.kamar])
            } : {}
          ]
        , []).filter(i => _.keys(i).length)
        .map(i =>
          fetch(
            [base_url, 'bed/update/', process.env.kode_ppk].join(''),
            {
              method: 'post',
              body: JSON.stringify(i),
              headers: headers()
            }
          )
          .then(res => res.json())
          .then(res => res && console.log(res))
          .catch(console.log))
      )
    )
  )
)).start(),

kamar = (req, res) => ({
  referensi_kelas: () =>
    fetch(base_url+'ref/kelas/')
    .then(data => data.json())
    .then(data => data && res.send(data)),
  update_ketersediaan: () =>
    fetch(
      [base_url, 'bed/update/', process.env.kode_ppk].join(''),
      {
        method: 'post',
        body: JSON.stringify(req.body),
        headers: headers()
      }
    )
    .then(data => data.json())
    .then(data => data && res.send(data)),
  ketersediaan_kamar: () =>
    fetch(
      [base_url, 'bed/read/', process.env.kode_ppk, '/1/100'].join(''),
      {headers: headers()}
    )
    .then(data => data.json())
    .then(data => data && res.send(data)),
  ruangan_baru: () =>
    fetch(
      [base_url, 'bed/create/', process.env.kode_ppk].join(''),
      {
        method: 'post', headers: headers(),
        body: JSON.stringify(req.body)
      }
    )
    .then(data => data.json())
    .then(data => data && res.send(data)),
  hapus_ruangan: () =>
    fetch(
      [base_url, 'bed/delete/', process.env.kode_ppk].join(''),
      {
        method: 'post', headers: headers(),
        body: JSON.stringify(req.body)
      }
    )
    .then(res => res.json())
    .then(data => data && res.send(data)),
})[req.params.api]()

exports.kamar = kamar
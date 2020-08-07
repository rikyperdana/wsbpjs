/*global _ m*/

var state = {},
menus = ['referensi_kelas', 'update_ketersediaan', 'ruangan_baru', 'ketersediaan_kamar', 'hapus_ruangan', 'panduan'],
fieldsRuangan = ['namakelas', 'kodekelas', 'koderuang', 'namaruang', 'kapasitas', 'tersedia'],

poster = (url, obj, cb) => fetch(url, {
  method: 'POST', body: JSON.stringify(obj),
  headers: {'Content-Type': 'application/json'}
}).then(res => res.json()).then(cb),

comp = {
  'referensi_kelas': function(){return m('.content',
    {oncreate: () => poster(
      '/kamar/referensi_kelas', {},
      res => [
        state.referensi_kelas = res.response.list,
        m.redraw()
      ]
    )},
    m('h3', 'Referensi Kelas'),
    m('table',
      m('thead', m('tr', m('th', 'Nama Kelas'), m('th', 'Kode Kelas'))),
      m('tbody', state.referensi_kelas && state.referensi_kelas.map(function(i){
        return m('tr', m('td', i.namakelas), m('td', i.kodekelas))
      }))
    )
  )},

  'update_ketersediaan': function(){return m('.content',
    m('h3', 'Update Ketersediaan Kamar'),
    m('form',
      {onsubmit: function(e){
        e.preventDefault()
        poster(
          '/kamar/update_ketersediaan',
          _.filter(e.target, function(i){return i.name})
          .map(function(field){return _.fromPairs([[field.name, field.value]])})
          .reduce(function(res, inc){return _.merge(res, inc)}, {}),
          res => res && alert(_.get(res, 'metadata.message'))
        )
      }},
      ['kodekelas', 'namaruang', 'koderuang', 'kapasitas', 'tersedia']
      .map(function(field){return m('.field',
        m('.label', _.startCase(field)),
        m('.control', m('input.input', {
          type: 'text', name: field,
          value: _.get(state, ['update_doc', field])
        }))
      )}),
      m('.field', m('.control',
        m('input.button.is-warning', {type: 'submit', value: 'Update'})
      ))
    )
  )},

  'ruangan_baru': function(){return m('.content',
    m('h3', 'Ruangan Baru'),
    m('form',
      {onsubmit: function(e){
        e.preventDefault();
        poster(
          '/kamar/ruangan_baru',
          _.filter(e.target, function(i){return i.name})
          .map(function(field){return _.fromPairs([[field.name, field.value]])})
          .reduce(function(res, inc){return _.merge(res, inc)}, {}),
          res => res && alert(_.get(res, 'metadata.message'))
        )
      }},
      fieldsRuangan.map(function(field){return m('.field',
        m('.label', _.startCase(field)),
        m('.control', m('input.input', {type: 'text', name: field}))
      )}),
      m('.field', m('.control',
        m('input.button.is-info', {type: 'submit', value: 'Tambahkan'})
      ))
    )
  )},

  'ketersediaan_kamar': function(){return m('.content',
    m('h3', 'Ketersediaan Kamar'),
    m('table',
      {onupdate: function(){
        poster(
          '/kamar/ketersediaan_kamar',
          {}, res => res && [
            state.ketersediaan_kamar = res.response.list,
            m.redraw()
          ]
        )
      }},
      m('thead', m('tr', fieldsRuangan.map(function(i){return m('th', _.startCase(i))}))),
      m('tbody', state.ketersediaan_kamar && state.ketersediaan_kamar.map(function(kamar){
        return m('tr',
          {ondblclick: function(e){_.assign(state, {
            route: 'update_ketersediaan',
            update_doc: kamar
          })}},
          fieldsRuangan.map(function(field){
            return m('td', kamar[field])
          })
        )
      }))
    )
  )},

  'hapus_ruangan': function(){return m('.content',
    m('h3', 'Hapus Ruangan'),
    m('form',
      {onsubmit: function(e){
        e.preventDefault();
        poster(
          '/kamar/hapus_ruangan',
          {
            kodekelas: e.target[0].value,
            koderuang: e.target[1].value
          },
          res => res && alert(_.get(res, 'metadata.message'))
        )
      }},
      ['kodekelas', 'koderuang'].map(function(i){return m('.field',
        m('.label', _.startCase(i)),
        m('.control', m('input.input', {type: 'text', name: i}))
      )}),
      m('.field', m('.control',
        m('input.button.is-danger', {type: 'submit', value: 'Hapus'})
      ))
    )
  )},
  'navbar': function(){return m('nav.navbar.is-primary',
    {role: 'navigation', 'aria-label': 'main navigation'},
    m('.navbar-brand',
      m('a.navbar-item', 'BPJS Bridge'),
      m('a.navbar-burger.burger',
        {role: 'button', 'aria-label': 'menu', 'aria-expanded': 'false', 'data-target': 'navbarBasicExample'},
        _.range(3).map(function(i){return m('span', {'aria-hidden': true})})
      )
    ),
    m('.navbar-menu', {id: 'navbarBasicExample'},
      m('.navbar-start', menus.map(function(i){
        return m('a.navbar-item', {onclick: function(){state.route = i}}, _.startCase(i))
      })),
      m('.navbar-end')
    ),
  )},
  'panduan': function(){return m('.content',
    m('h3', 'Panduan Penggunaan Aplicare'),
    m('h4', 'Referensi Kelas'),
    m('p', 'Berisi referensi kode kelas yang dapat digunakan user untuk membuat ruangan baru atau mengupdate yang sudah ada. Kesalahan dalam penggunaan kode dapat berakibat fatal. Jika masih ragu, silahkan konsultasi kepada pihak BPJS terdekat.'),
    m('h4', 'Update Ketersediaan'),
    m('p', 'Form yang dapat digunakan untuk memperbaharui data ruangan yang sudah tersedia pada sistem (cek menu Ketersediaan Kamar). Pembaharuan dilakukan minimal 1x sehari untuk menjaga aktualitas. Double-klik pada baris kamar yang akan diupdate.'),
    m('h4', 'Ruangan Baru'),
    m('p', 'Form yang dapat digunakan untuk menambah ruangan baru yang ada di Faskes. Nama Kelas dan Kode Kelas harus sesuai referensi, Kode Ruang dan Nama Ruang boleh ditentukan sendiri dengan syarat harus konsisten.'),
    m('h4', 'Ketersediaan Kamar'),
    m('p', 'Adalah daftar nama ruangan berikut rinciannya sesuai dengan yang terekam pada server BPJS.'),
    m('h4', 'Hapus Ruangan'),
    m('p', 'Adalah form untuk menghapus ruangan tertentu. Pastikan sebelum mengambil keputusan.')
  )}
};

m.mount(document.body, {view: function(){return m('div',
  comp.navbar(), m('.container', m('br'), comp[state.route || 'referensi_kelas']())
)}})
/* eslint-disable no-unused-vars */
/**
 * @ Author: SeroBot Team
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import _ from 'lodash'
import dotenv from 'dotenv'
dotenv.config()

const prefix = process.env.PREFIX
const id = {}
const en = {}

id.error = {
  norm: '❌ Maaf, Ada yang error! Coba lagi beberapa menit kemudian.',
  admin: '⛔ Perintah ini hanya untuk admin group!',
  owner: '⛔ Perintah ini hanya untuk owner bot!',
  group: '⛔ Maaf, perintah ini hanya dapat dipakai didalam group!',
  botAdm: '⛔ Perintah ini hanya bisa di gunakan ketika bot menjadi admin',
  join: '💣 Gagal! Sepertinya Bot pernah dikick dari group itu ya? Yah, Bot gabisa masuk lagi dong'
}
id.success = {
  join: '✅ Berhasil join group via link!',
  sticker: 'Here\'s your sticker 🎉',
  greeting: 'Hai guys 👋 perkenalkan saya SeroBot 🤖' +
  `Untuk melihat perintah atau menu yang tersedia pada bot, kirim *${prefix}menu*. Tapi sebelumnya pahami dulu *${prefix}tnc*`
}

id.wait = () => _.sample([
  '⏳ Okey siap, sedang diproses!',
  '⏳ Okey tenang tunggu bentar!',
  '⏳ Okey, tunggu sebentar...',
  '⏳ Shap, silakan tunggu!',
  '⏳ Baiklah, sabar ya!',
  '⏳ Sedang diproses!',
  '⏳ Otw!'
])

id.menu = {
  hint: 'Menampilkan menu'
}
id.pinterest = {
  hint: 'Search gambar dari pinterest',
  hintLong: `Untuk mencari gambar dari pinterest\nketik: ${prefix}pinterest [search]\ncontoh: ${prefix}pinterest naruto`
}

// Change this to en to use English
export default id

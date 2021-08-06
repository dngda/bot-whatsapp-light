/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-05 17:23:09
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import { MessageType, WAMessageProto, WAConnection, Mimetype, Presence } from '@adiwajshing/baileys'
import PhoneNumber from 'awesome-phonenumber'
import lang from '../libs/lang.js'
import dotenv from 'dotenv'
import axios from 'axios'
import fs from 'fs'
const { readFileSync } = fs
dotenv.config()

class MyWAConnection extends WAConnection {
  sendText(from, text) {
    return this.sendMessage(from, text, MessageType.text)
  }

  reply(from, text, msg) {
    return this.sendMessage(from, text, MessageType.text, { quoted: msg })
  }

  async sendFileFromUrl(from, url, caption, msg = null, jid = []) {
    const res = await axios.head(url)
    let mime = res.headers['content-type']
    let type = mime.split('/')[0] + 'Message'
    if (mime === 'image/gif') {
      type = MessageType.video
      mime = Mimetype.gif
    }
    if (mime === 'application/pdf') {
      type = MessageType.document
      mime = Mimetype.pdf
    }
    if (mime.split('/')[0] === 'audio') {
      mime = Mimetype.mp4Audio
    }
    return this.sendMessage(from, await getBuffer(url), type, { caption: caption, quoted: msg, mimetype: mime, contextInfo: { mentionedJid: jid || [] } })
  }

  async sendContact(jid, number, name, quoted, options) {
    // TODO: Business Vcard
    number = number.replace(/[^0-9]/g, '')
    const njid = number + '@s.whatsapp.net'
    // eslint-disable-next-line no-unused-vars
    const { isBusiness } = await this.isOnWhatsApp(njid) || { isBusiness: false }
    const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'.trim()
    return await this.sendMessage(jid, {
      displayName: name,
      vcard
    }, MessageType.contact, { quoted, ...options })
  }

  async sendGroupInvite(jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', options = {}) {
    const msg = WAMessageProto.Message.fromObject({
      groupInviteMessage: WAMessageProto.GroupInviteMessage.fromObject({
        inviteCode,
        inviteExpiration: parseInt(inviteExpiration) || +new Date(new Date() + (3 * 86400000)),
        groupJid: jid,
        groupName: groupName || this.getName(jid),
        caption
      })
    })
    const message = this.prepareMessageFromContent(participant, msg, options)
    await this.relayWAMessage(message)
    return message
  }

  sendImage(from, buffer, capt = '', quotedMsg = '', men = []) {
    return this.sendMessage(from, buffer, MessageType.image, { caption: capt, quoted: quotedMsg, contextInfo: { mentionedJid: men } })
  }

  sendVideo(from, buffer, capt = '', quotedMsg = '', men = []) {
    return this.sendMessage(from, buffer, MessageType.video, { caption: capt, quoted: quotedMsg, contextInfo: { mentionedJid: men } })
  }

  textImg(from, teks, quotedMsg = '', buffer = readFileSync(process.env.FAKE_THUMB_PATH)) {
    return this.sendMessage(from, teks, MessageType.text, { quoted: quotedMsg, thumbnail: buffer })
  }

  fakeThumb(from, buffer, capt = '', quotedMsg = '', fakethumb = readFileSync(process.env.FAKE_THUMB_PATH), men = []) {
    const ai = {
      thumbnail: fakethumb,
      quoted: quotedMsg,
      caption: capt,
      contextInfo: {
        mentionedJid: men
      }
    }
    return this.sendMessage(from, buffer, MessageType.image, { quoted: ai })
  }

  cekInviteCode(code) {
    return this.query({ json: ['query', 'invite', code] })
  }

  async getQuotedMsg(msg) {
    if (!msg.isQuotedMsg) return false
    const qi = await this.loadMessage(msg.key.remoteJid, msg.quotedMsg.id)
    return await serialize(this, qi)
  }

  /**
   * Get name from jid
   * @param {String} jid
   * @param {Boolean} withoutContact
   */
  getName(jid, withoutContact = false) {
    withoutContact = this.withoutContact || withoutContact
    const v = jid === '0@s.whatsapp.net'
      ? {
          jid,
          vname: 'WhatsApp'
        }
      : jid === this.user.jid
        ? this.user
        : this.contactAddOrGet(jid)
    return (withoutContact ? '' : v.name) || v.vname || v.notify || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
  }
}

// serialize msg by Xinz-Team and Nurutomo
const serialize = (msg, client = new MyWAConnection()) => {
  if (msg.message.ephemeralMessage) {
    msg.message = msg.message.ephemeralMessage.message
    msg.ephemeralMessage = true
  } else {
    msg.ephemeralMessage = false
  }
  msg.isGroup = msg.key.remoteJid.endsWith('@g.us')
  try {
    const berak = Object.keys(msg.message)[0]
    msg.type = berak
  } catch {
    msg.type = null
  }
  try {
    const context = msg.message[msg.type].contextInfo.quotedMessage
    if (context.ephemeralMessage) {
      msg.quotedMsg = context.ephemeralMessage.message
    } else {
      msg.quotedMsg = context
    }
    msg.isQuotedMsg = true
    msg.quotedMsg.sender = msg.message[msg.type].contextInfo.participant
    msg.quotedMsg.fromMe = msg.quotedMsg.sender === client.user.jid
    msg.quotedMsg.type = Object.keys(msg.quotedMsg)[0]
    const qMsg = msg.quotedMsg
    msg.quotedMsg.chats = (qMsg.type === 'conversation' && qMsg.conversation)
      ? qMsg.conversation
      : (qMsg.type === 'imageMessage') && qMsg.imageMessage.caption
          ? qMsg.imageMessage.caption
          : (qMsg.type === 'documentMessage') && qMsg.documentMessage.caption
              ? qMsg.documentMessage.caption
              : (qMsg.type === 'videoMessage') && qMsg.videoMessage.caption
                  ? qMsg.videoMessage.caption
                  : (qMsg.type === 'extendedTextMessage') && qMsg.extendedTextMessage.text
                      ? qMsg.extendedTextMessage.text
                      : ''
    msg.quotedMsg.id = msg.message[msg.type].contextInfo.stanzaId
    msg.quotedMsg.isBaileys = msg.quotedMsg.id.startsWith('3EB0') && msg.quotedMsg.id.length === 12
    msg.quotedMsg.toBuffer = () => client.downloadMediaMessage(msg.quotedMsg)
    msg.quotedMsg.saveToFile = () => client.downloadAndSaveMediaMessage(msg.quotedMsg)
  } catch {
    msg.quotedMsg = null
    msg.isQuotedMsg = false
  }

  try {
    const mention = msg.message[msg.type].contextInfo.mentionedJid
    msg.mentioned = mention
  } catch {
    msg.mentioned = []
  }

  if (msg.isGroup) {
    msg.sender = msg.participant
  } else {
    msg.sender = msg.key.remoteJid
  }
  if (msg.key.fromMe) {
    msg.sender = client.user.jid
  }

  msg.from = msg.key.remoteJid
  msg.fromMe = msg.key.fromMe
  msg.isBaileys = msg.key.id.startsWith('3EB0') && msg.key.id.length === 12

  const usr = msg.key.fromMe ? client.user.jid : client.contacts[msg.sender]
  msg.pushname = msg.key.fromMe ? client.user.name : !usr ? '-' : usr.notify || usr.vname || usr.name || '-'

  msg.chats = (msg.type === 'conversation' && msg.message.conversation)
    ? msg.message.conversation
    : (msg.type === 'imageMessage') && msg.message.imageMessage.caption
        ? msg.message.imageMessage.caption
        : (msg.type === 'documentMessage') && msg.message.documentMessage.caption
            ? msg.message.documentMessage.caption
            : (msg.type === 'videoMessage') && msg.message.videoMessage.caption
                ? msg.message.videoMessage.caption
                : (msg.type === 'extendedTextMessage') && msg.message.extendedTextMessage.text
                    ? msg.message.extendedTextMessage.text
                    : ''

  msg.prefix = msg.chats.slice(0, 1)
  msg.arg = msg.chats.trim().substring(msg.chats.indexOf(' ') + 1)
  msg.arg1 = msg.arg.trim().substring(msg.arg.indexOf(' ') + 1)
  msg.args = msg.chats.split(/\s/).slice(1)
  msg.cmd = msg.chats.split(/\s/).shift()
  msg.t = msg.messageTimestamp.low
  msg.toBuffer = () => client.downloadMediaMessage(msg)
  msg.saveToFile = () => client.downloadAndSaveMediaMessage(msg)
  msg.read = () => client.chatRead(msg.from)
  msg.sendTyping = () => client.updatePresence(msg.from, Presence.composing)
  msg.reply = (txt) => client.reply(msg.from, txt, msg)
  msg.sendWait = () => client.sendText(msg.from, lang.wait())
  msg.replyWait = () => client.reply(msg.from, lang.wait(), msg)
  return msg
}

const getBuffer = async (url, options) => {
  options || (options = {})
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        DNT: 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (e) {
    log('[ERR!]', e.toString())
  }
}

export {
  serialize,
  MyWAConnection
}

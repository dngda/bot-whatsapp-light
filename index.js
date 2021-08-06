/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-05 17:13:25
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */
import { MyWAConnection, serialize } from './utils/base.js'
import { initGlobalVariable } from './utils/index.js'
import { EventEmitter } from 'events'
import commands from './commands/_index.js'
import aliases from './commands/_menu.js'
import moment from 'moment-timezone'
import dotenv from 'dotenv'
import figlet from 'figlet'
import fs from 'fs'
moment.tz.setDefault('Asia/Jakarta').locale('id')
dotenv.config()

const { existsSync, writeFileSync, readdirSync } = fs

initGlobalVariable()
const client = new MyWAConnection()
const sessionPath = './session.data.json'

client.logger.level = 'warn'
client.on('qr', () => {
  log('[CONN]', 'SCAN QR code to Authenticate and continue!')
})
existsSync(sessionPath) && client.loadAuthInfo(sessionPath)
client.on('connecting', () => {
  log('[CONN]', 'Connecting...')
})
client.on('open', () => {
  log('[CONN]', 'Connected!')
  log(null, figlet.textSync('----------------', { horizontalLayout: 'default' }))
  log(null, figlet.textSync('  SeroBot', { font: 'Ghost', horizontalLayout: 'default' }))
  log(null, figlet.textSync('----------------', { horizontalLayout: 'default' }))
  log('[DEV]', 'Danang', null, 'yellow')
  log('[~>>]', 'BOT Started!', null, 'green')
  log('[>..]', 'Owner Commands: /menuowner', null, 'blue')
})
client.connect({ timeoutMs: 30 * 1000 }).then(() => {
  writeFileSync(sessionPath, JSON.stringify(client.base64EncodedAuthInfo(), null, 2))
})
const cmd = new EventEmitter()
const cmds = readdirSync('./commands').map(c => {
  return c.replace('.js', '')
})
for (const c of cmds) {
  if (c && !c.startsWith('_')) cmd.on(c, commands[c])
}
log('[LOGS]', 'Commands listener loaded!')

global.prefix = '/'

client.on('chat-update', async (chatUpdate) => {
  try {
    let msg
    if (chatUpdate.messages && chatUpdate.count) {
      msg = chatUpdate.messages.all()[0]
    } else {
      return
    }
    msg = serialize(msg, client)
    const isCmd = msg.chats.startsWith(prefix)
    const command = isCmd ? aliases(msg.cmd.replace(prefix, '')) : ''
    const { from, arg, args, pushname, isGroup, t } = msg
    if (isCmd) {
      msg.read()
      msg.sendTyping()

      // Log Commands
      let argsLog = ''
      if (msg.args.length === 0) argsLog = color('with no args', 'grey')
      else argsLog = (msg.arg.length > 30) ? `${arg.substring(0, 30)}...` : arg

      if (isCmd && !isGroup) {
        console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
          color(`${command}[${args.length}]`), ':', color(argsLog, 'magenta'), 'from', color(pushname))
      }
      if (isCmd && isGroup) {
        const { subject } = await client.groupMetadata(from)
        console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'),
          color(`${command}[${args.length}]`), ':', color(argsLog, 'magenta'), 'from', color(pushname), 'in', color(subject))
      }

      cmd.emit(command, msg, client)
    }
  } catch (error) {
    log('[ERR!]', error)
  }
})

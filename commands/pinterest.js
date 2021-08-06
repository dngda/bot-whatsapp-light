/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-06 16:29:19
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import { MyWAConnection } from '../utils/base.js'
import { pinterest } from '../libs/api.js'
import _ from 'lodash'
import lang from '../libs/lang.js'

export default async(msg, client = new MyWAConnection()) => {
  const { args, from, arg, arg1 } = msg
  if (args.length === 0) return client.reply(from, lang.pinterest.hintLong, msg)
  try {
    msg.sendWait()
    if (args[0] === '+') {
      await pinterest(arg1)
        .then(res => {
          const img = _.sampleSize(res, 10)
          img.forEach(async i => {
            if (i != null) await client.sendFileFromUrl(from, i, '')
          })
        })
    } else {
      await pinterest(arg)
        .then(async res => {
          const img = _.sample(res)
          if (img === null || img === undefined) return msg.reply(lang.error.norm)
          await client.sendFileFromUrl(from, img, '', '', msg)
        })
    }
  } catch (err) {
    log('[ERR!]', err)
    msg.reply(lang.error.norm)
  }
}

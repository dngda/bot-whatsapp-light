/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-06 14:49:10
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import { getMenu } from './_menu.js'
export default (msg, client) => {
  const m = (namaMenu) => `*${msg.prefix}${namaMenu}*`

  let menuMsg = 'List Menu\n'
  const menus = getMenu()
  const menuTypes = menus.map(menu => {
    return menu.type
  })
  for (const type of menuTypes) {
    menuMsg += `\n╔══✪〘 ${type.replace(/^\w/, c => c.toUpperCase())} 〙✪`
    for (const sub of menus.filter(menu => menu.type === type)) {
      const alias = sub.alias.concat(sub.command).map(a => {
        return m(a)
      })
      menuMsg += `\n╠> ${alias.join(' atau ')}\n`
      menuMsg += `║   ${sub.usage}`
    }
    menuMsg += '\n╚══✪\n'
  }
  client.sendText(msg.from, menuMsg)
}

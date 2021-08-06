/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-06 16:30:51
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import lang from '../libs/lang.js'

const menu = [
  {
    command: 'menu',
    usage: lang.menu.hint,
    alias: ['help', 'start'],
    type: 'general'
  },
  {
    command: 'pinterest',
    usage: lang.pinterest.hint,
    alias: ['pin'],
    type: 'search'
  }
]

export default (cmd) => {
  return menu.find(m => m.alias.concat(m.command).indexOf(cmd) !== -1)?.command
}
export const getMenu = () => menu

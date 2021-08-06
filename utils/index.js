/**
 * @ Author: SeroBot Team
 * @ Create Time: 2021-08-05 19:23:23
 * @ Modified by: Danang Dwiyoga A (https://github.com/dngda/)
 * @ Description:
 */

import chalk from 'chalk'

const _color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const initGlobalVariable = () => {
  global.log = (prefix = null, txt = '', prefixColor = null, txtColor = null) => {
    if (prefix === null) console.log(_color(txt, txtColor))
    else if (prefix === '[LOGS]') console.log(_color(prefix, 'grey'), _color(txt, txtColor))
    else if (prefix === '[CONN]') console.log(_color(prefix, 'yellow'), _color(txt, txtColor))
    else if (prefix === '[ERR!]') console.log(_color(prefix, 'red'), txt)
    else if (prefix === '[EXEC]') console.log(_color(prefix, 'blue'), _color(txt, txtColor))
    else console.log(_color(prefix, prefixColor), _color(txt, txtColor))
  }
  global.color = (text, color) => _color(text, color)
}

export {
  initGlobalVariable
}

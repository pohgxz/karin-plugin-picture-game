import { AdapterType, karin, Plugin, segment } from 'node-karin'
import Game from './chinese_chess/game'
import Canvas from './chinese_chess/canvas'

const games = new Map<string, Game>()

// 认输
export const over = karin.command(/^认输$/, async (e) => {
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  const rival = game.getPlayerInfo(0) === qq ? 1 : 0
  const message = [
    segment.text('你觉得对方更胜一筹，自愿退出舞台\n'),
    segment.at(game.getPlayerInfo(rival)),
    segment.text(' 你赢了')
  ]
  games.delete(e.groupId)
  await e.reply(message, { reply: true })
  return true
}, { name: '认输', event: 'message.group' })

// 拒绝
export const refuse = karin.command(/^拒绝$/, async (e) => {
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  if (game.getPlayerInfo() !== qq) {
    return false
  }
  let msg
  if (game.getRetract() && !game.getRod('retract')) {
    game.setRod('retract')
    msg = '你的对手拒绝了你的重演请求\n'
  } else if (game.getSue() && !game.getRod('sue')) {
    game.setRod('sue')
    msg = '对方暂时不认可你的舞技\n'
  }
  if (msg !== undefined) {
    const rival = game.getPlayer() === 0 ? 1 : 0
    const message = [
      segment.at(game.getPlayerInfo(rival)),
      segment.text(msg),
      segment.at(qq),
      segment.text('\n请继续你的表演')
    ]
    await e.reply(message, { reply: true })
    return true
  }
  return false
}, { name: '拒绝', event: 'message.group' })

// 同意
export const agree = karin.command(/^同意$/, async (e) => {
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  if (game.getPlayerInfo() !== qq) {
    return false
  }
  if (game.getRetract() && !game.getRod('retract')) {
    game.regret()
    const message = [
      segment.text('你同意了对手的重赛请求\n'),
      segment.image(Canvas.draw(game.getBoard())),
      segment.text('\n'),
      segment.at(game.getPlayerInfo()),
      segment.text('\n'),
      segment.text('\n请开始你的表演')
    ]
    await e.reply(message, { reply: true })
    return true
  }
  if (game.getSue() && !game.getRod('sue')) {
    games.delete(e.groupId)
    await e.reply('你认可了对方，演出结束', { reply: true })
    return true
  }
  return false
}, { name: '同意', event: 'message.group' })

// 求和
export const sue = karin.command(/^求和$/, async (e) => {
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  if (game.getPlayerInfo() !== qq) {
    if (game.getSue()) {
      await e.reply('心急吃不了热豆腐，你已经向对手发起过请求了哦', { reply: true })
      return true
    }
    game.setSue()
    const message = [
      segment.at(game.getPlayerInfo()),
      segment.text('\n你的对手觉得你是一个旗鼓相当的对手，想要和解，是否同意？\n\n同意|拒绝'),
    ]
    await e.reply(message)
    return true
  }
  return false
}, { name: '求和', event: 'message.group' })

// 悔棋
export const regret = karin.command(/^悔棋$/, async (e) => {
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  if (game.getPlayerInfo() !== qq) {
    if (game.getRetract()) {
      await e.reply('心急吃不了热豆腐，你已经向对手发起过请求了哦', { reply: true })
      return true
    }
    game.setRetract()
    const message = [
      segment.at(game.getPlayerInfo()),
      segment.text('\n你的对手觉得刚刚的舞姿不够优雅，想要重新表演，是否同意？\n\n同意|拒绝'),
    ]
    await e.reply(message)
    return true
  }
  return false
}, { name: '悔棋', event: 'message.group' })

// 走棋
export const coordinatesMove = karin.command(/^([a-iA-I])([0-9])([a-iA-I])([0-9])$/, async (e) => {
  const msg = e.msg.toUpperCase()
  const game = games.get(e.groupId)
  const qq = e.userId
  if (!game || !game.getGameStatus() || !game.checkPlayer(qq)) {
    return false
  }
  if (game.getHistoryLength() === 1) { game.setRed(qq) }
  if (game.getPlayerInfo() !== qq) {
    await e.reply('心急吃不了热豆腐，现在不是你的表演时间哦', { reply: true })
    return true
  }
  if (game.getRetract() && !game.getRod('retract')) {
    await e.reply('你的对手觉得刚刚的舞姿不够优雅，想要重新表演，是否同意？\n\n同意|拒绝', { reply: true })
    return true
  }
  if (game.getSue() && !game.getRod('sue')) {
    await e.reply('你的对手觉得你是一个旗鼓相当的对手，想要和解，是否同意？\n\n同意|拒绝', { reply: true })
    return true
  }
  const y = msg.charCodeAt(0) - 'A'.charCodeAt(0)
  const x = Math.abs(msg.charCodeAt(1) - '0'.charCodeAt(0) - 9)
  const ty = msg.charCodeAt(2) - 'A'.charCodeAt(0) - y
  const tx = Math.abs(msg.charCodeAt(3) - '0'.charCodeAt(0) - 9) - x
  if (!game.move(qq, [x, y], [tx, ty])) {
    await e.reply('评委对你打出了0分，请重新表演', { reply: true })
    return true
  }
  const message = [
    segment.text('你过关！！\n'),
    segment.image(Canvas.draw(game.getBoard())),
    segment.text('\n'),
    segment.at(game.getPlayerInfo()),
    segment.text('\n'),
    segment.text('\n请开始你的表演')
  ]
  await e.reply(message, { reply: true })
  return true
}, { name: '走棋', event: 'message.group' })

// 加入
export const join = karin.command(/^加入中国象棋$/, async (e) => {
  const group = e.groupId
  let game = games.get(group)
  if (!game) {
    game = new Game()
    games.set(group, game)
    game.setLastTime(Date.now())
    countDown(group, e.bot)
  }
  if (game.getGameStatus()) {
    await e.reply('当前舞台已满人，请欣赏他们的表演', { reply: true })
    return true
  }
  if (game.getPlayerInfo(0) === e.userId) {
    await e.reply('您正在后台准备表演中', { reply: true })
    return true
  }
  game.addPlayer(e.userId)
  if (!game.getGameStatus()) {
    await e.reply([segment.text('欢迎 '), segment.at(e.userId), segment.text(' 加入舞台，请等待下一位加入')], { reply: true })
    return true
  }
  const msg = [
    segment.text('欢迎 '),
    segment.at(e.userId),
    segment.text(' 加入舞台，舞台已就绪，请开始表演\n'),
    segment.image(Canvas.draw(game.getBoard())),
    segment.text('\n'),
    segment.at(game.getPlayerInfo(0)),
    segment.text('\n'),
    segment.at(game.getPlayerInfo(1)),
    segment.text('\n请自行决定谁先开始表演')
  ]
  await e.reply(msg)
  // 开始游戏
  return true
}, { name: '加入', event: 'message.group' })

// 菜单
export const menu = karin.command(/^中国象棋$/, async (e) => {
  const msg = `欢迎来到中国象棋
  象棋指令如下：
  加入中国象棋
  a1b1（走棋指令）
  求和
  认输`
  await e.reply(msg, { reply: true })
  return true
}, { name: '菜单', event: 'message.group' })

function countDown (group: string, bot: AdapterType) {
  setTimeout(async () => {
    const game = games.get(group)
    if (game) {
      const time = game.getLastTime()
      const differ = Date.now() - time
      const qq = game.getPlayerInfo()
      if (!game.getGameStatus()) {
        if (differ > 180000) {
          const contact = karin.contactGroup(group)
          await bot.sendMsg(contact, [segment.text('中国象棋匹配时间超时，对局已结束')])
        }
      } else if (differ > 60000 && differ < 61000) {
        const contact = karin.contactGroup(group)
        const elements = [
          segment.at(qq),
          segment.text(' 在本次中国象棋舞台中你的表演时间剩余2分钟')
        ]
        await bot.sendMsg(contact, elements)
      } else if (differ > 120000 && differ < 121000) {
        const contact = karin.contactGroup(group)
        const elements = [
          segment.at(qq),
          segment.text(' 在本次中国象棋舞台中你的表演时间剩余1分钟')
        ]
        await bot.sendMsg(contact, elements)
      } else if (differ > 150000 && differ < 151000) {
        const contact = karin.contactGroup(group)
        const elements = [
          segment.at(qq),
          segment.text(' 在本次中国象棋舞台中你的表演时间剩余30秒')
        ]
        await bot.sendMsg(contact, elements)
      } else if (differ > 170000 && differ < 171000) {
        const contact = karin.contactGroup(group)
        const elements = [
          segment.at(qq),
          segment.text(' 在本次中国象棋舞台中你的表演时间剩余10秒')
        ]
        await bot.sendMsg(contact, elements)
      } else if (differ > 180000) {
        const contact = karin.contactGroup(group)
        const elements = [
          segment.at(qq),
          segment.text(' 由于你灵感缺失无法做出对应舞步，表演结束')
        ]
        await bot.sendMsg(contact, elements)
        games.delete(group)
        return
      }
      countDown(group, bot)
    }
  }, 1000)
}

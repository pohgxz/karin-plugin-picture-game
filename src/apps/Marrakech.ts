import karin, { AdapterType, GroupMessage, Plugin, segment } from 'node-karin';
import Game from './Marrakech/Game';

const games = new Map<string, Game>();

export class Marrakech extends Plugin {
  constructor() {
    super({
      name: 'Marrakech',
      desc: '马拉喀什（地毯商人）',
      event: 'message.group',
      rule: [
        { reg: /^(马拉喀什|地毯商人)$/, fnc: 'menu' },
        { reg: /^加入(马拉喀什|地毯商人)$/, fnc: 'join' },
        { reg: /^退出(马拉喀什|地毯商人)$/, fnc: 'leave' },
        { reg: /^(上|下|左|右)$/, fnc: 'direction' },
        { reg: /^((上左|上右|下左|下右|左上|左下|右上|右下|上上|右右|下下|左左))$/, fnc: 'lay' },
      ],
    });

    // this.rule =
  }

  async lay() {}

  async direction() {}

  async leave(e: GroupMessage) {
    let game = games.get(e.groupId);
    if (game === undefined) {
      return false;
    }
    if (!game.checkPlayer(e.userId)) {
      return false;
    }
    if (game.getGameStatus()) {
      await this.reply('游戏已经开始了哦', { reply: true });
      return true;
    }
    game.removePlayer(e.userId);
    await this.reply('你已退出当前游戏', { reply: true });
    return true;
  }

  async join(e: GroupMessage) {
    let game = games.get(e.groupId);
    if (game === undefined) {
      game = new Game();
      games.set(e.groupId, game);
    }
    if (game.getGameStatus()) {
      await this.reply('游戏已经开始了', { reply: true });
      return true;
    }
    if (game.checkPlayer(e.userId)) {
      await this.reply('你已经加入了游戏', { reply: true });
      return true;
    }
    game.addPlayer(e.userId);
    const count = game.getPlayerNum();
    if (count === 4) {
      game.startGame();

      return true;
    }
    if (count === 1) this.countDown(e.groupId, e.bot);
    await this.reply('加入成功', { reply: true });
    return true;
  }

  async menu() {
    const msg = `欢迎来到地毯商人,指令如下：
    加入(马拉喀什|地毯商人)
    退出(马拉喀什|地毯商人)`;
    await this.reply(msg, { reply: true });
    return true;
  }

  private countDown(group: string, bot: AdapterType) {
    setTimeout(async () => {
      const game = games.get(group);
      if (game) {
        const time = game.getLastTime();
        const differ = Date.now() - time;
        const qq = game.getPlayerInfo();
        if (!game.getGameStatus()) {
          if (differ > 180000) {
            const contact = karin.contactGroup(group);
            await bot.sendMsg(contact, [
              segment.text('马拉喀什匹配时间超时，对局已结束'),
            ]);
          }
        } else if (differ > 60000 && differ < 61000) {
          const contact = karin.contactGroup(group);
          const elements = [
            segment.at(qq),
            segment.text(' 在本次马拉喀什舞台中你的表演时间剩余2分钟'),
          ];
          await bot.sendMsg(contact, elements);
        } else if (differ > 120000 && differ < 121000) {
          const contact = karin.contactGroup(group);
          const elements = [
            segment.at(qq),
            segment.text(' 在本次马拉喀什舞台中你的表演时间剩余1分钟'),
          ];
          await bot.sendMsg(contact, elements);
        } else if (differ > 150000 && differ < 151000) {
          const contact = karin.contactGroup(group);
          const elements = [
            segment.at(qq),
            segment.text(' 在本次马拉喀什舞台中你的表演时间剩余30秒'),
          ];
          await bot.sendMsg(contact, elements);
        } else if (differ > 170000 && differ < 171000) {
          const contact = karin.contactGroup(group);
          const elements = [
            segment.at(qq),
            segment.text(' 在本次马拉喀什舞台中你的表演时间剩余10秒'),
          ];
          await bot.sendMsg(contact, elements);
        } else if (differ > 180000) {
          const contact = karin.contactGroup(group);
          const elements = [
            segment.at(qq),
            segment.text(' 由于你灵感缺失无法做出对应舞步，表演结束'),
          ];
          await bot.sendMsg(contact, elements);
          games.delete(group);
          return;
        }
        this.countDown(group, bot);
      }
    }, 1000);
  }
}

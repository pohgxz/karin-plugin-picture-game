import { Plugin } from 'node-karin';

export class Marrakech extends Plugin {
  constructor() {
    super({
      name: 'Marrakech',
      desc: '马拉喀什（地毯商人）',
      event: 'message.group',
      rule: [],
    });

    this.rule = [
      { reg: '地毯商人', fnc: 'menu' }
    ]

  }

  async menu() {
    const msg = `欢迎来到地毯商人
    地毯商人指令如下：
    地毯商人`;
    await this.reply(msg, { reply: true });
    return true;
  }


}

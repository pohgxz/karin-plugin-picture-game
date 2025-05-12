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
      { reg: '地毯商人', fnc: 'menu' },
      { reg: /^加入(马拉喀什|地毯商人)$/, fnc: 'join'},
      { reg: /^离开(马拉喀什|地毯商人)$/, fnc: 'leave'},
      { reg: /^(上|下|左|右)$/, fnc: 'direction'},
      { reg: /^((上左|上右|下左|下右|左上|左下|右上|右下|上上|右右|下下|左左))$/, fnc: 'lay'},
    ];
  }

  async lay() {
    
  }

  async direction() {
    
  }

  async leave() {
    
  }

  async join() {
    
  }

  async menu() {
    const msg = `欢迎来到地毯商人
    地毯商人指令如下：
    地毯商人`;
    await this.reply(msg, { reply: true });
    return true;
  }
}

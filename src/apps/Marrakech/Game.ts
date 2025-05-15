import { randomInt } from 'crypto';

export default class Game {
  // 记录游戏状态
  private start: boolean = false;
  // 记录玩家QQ号
  private players: string[] = [];
  // 上次有效操作时间
  private time: number = 0;
  // 记录当前操作的玩家
  private player: number = 0;

  /*
  * 每位玩家初始30金币
  * 地毯拿取数量如下：
  * * 两位游玩：拿取两种颜色地毯各 12 张，共 24 张，地毯需洗牌
  * * 三位游玩：拿取单色地毯 15 张，共 15 张
  * * 四位游玩：拿取单色地毯 12 张，共 12 张
  */


  public getLastTime(): number {
    return this.time;
  }
  public getPlayerInfo(player: number = -1): string {
    return this.players[player === -1 ? this.player : player];
  }
  public addPlayer(qq: string) {
    this.players.push(qq);
    this.time = Date.now();
  }
  public removePlayer(qq: string) {
    this.players = this.players.filter((player) => player !== qq);
    this.time = Date.now();
  }
  public checkPlayer(qq: string): boolean {
    return this.players.includes(qq);
  }
  public getPlayerNum(): number {
    return this.players.length;
  }
  public startGame() {
    this.start = true;
    this.time = Date.now();
    const len = this.players.length;
    this.player = randomInt(0, len);
    
  }
  public getGameStatus(): boolean {
    return this.start;
  }
}

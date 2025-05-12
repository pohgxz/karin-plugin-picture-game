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

  public getLastTime(): number {
    return this.time;
  }
  public getPlayerInfo(player: number = -1): string {
    return this.players[player === -1? this.player : player];
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
    this.player = randomInt(0, this.players.length);
  }
  public getGameStatus(): boolean {
    return this.start;
  }
}

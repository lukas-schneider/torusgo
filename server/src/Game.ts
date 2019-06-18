import Debug          from 'debug';
import {EventEmitter} from 'events';
import {
  execMove,
  initGame,
  testMove,
  IRawGame,
  EColor,
  IRuleSet,
  TMove,
}                     from '../../src/shared/gameLogic';
import {
  IGameState,
  IColorMap,
  EGamePhase,
  EServerEvent,
  IPlayerInfo,
}                     from '../../src/shared/types';
import {enumValues}   from '../../src/shared/utils';
import GameServer     from './GameServer';
import Session        from './Session';

const debug = Debug('torusgo:game');

export default class Game extends EventEmitter {
  static ROOM_PREFIX = 'game/';

  public id: string;
  public room: string;

  // ---- game state ----
  public rawGame: IRawGame;

  public phase: EGamePhase = EGamePhase.Running;

  public moveNumber: number = 0;

  public players: Partial<IColorMap<Session>> = {};

  constructor(id: string, ruleSet: IRuleSet) {
    super();
    this.id = id;
    this.room = Game.ROOM_PREFIX + this.id;
    this.rawGame = initGame(ruleSet);

    debug('[%s] initialized with rule set %o', this.id, ruleSet);

    for (let event of enumValues<EServerEvent>(EServerEvent)) {
      this.on(event, (...args) => {
        debug('[%s] <= %s', this.id, event, ...args);
        GameServer.instance.emit(this.room, event, ...args);
      });
    }
  }

  public connect(session: Session, role: EColor) {
    this.players[role] = session;

    this.emit(EServerEvent.PlayerUpdate, this.getPlayerInfo());
  }

  public disconnect(role: EColor) {
    delete this.players[role];

    this.emit(EServerEvent.PlayerUpdate, this.getPlayerInfo());
  }

  public getState(): IGameState {
    return {
      rawGame: this.rawGame,
      phase: this.phase,
      moveNumber: this.moveNumber,
      players: this.getPlayerInfo(),
    };
  }

  public getPlayerInfo(): Partial<IColorMap<IPlayerInfo>> {
    const white = this.players[EColor.White];
    const black = this.players[EColor.Black];
    return {
      [EColor.White]: white && {
        name: white.name,
      },
      [EColor.Black]: black && {
        name: black.name,
      },
    };
  }

  public execMove(move: TMove): boolean {
    if (!testMove(this.rawGame, move)) return false;

    this.rawGame = execMove(this.rawGame, move);
    this.moveNumber++;

    this.emit(EServerEvent.Move, move);
    return true;
  }

  public resign(role: EColor) {
    switch (role) {
      case EColor.Black:
        this.phase = EGamePhase.WhiteVictory;
        break;
      case EColor.White:
        this.phase = EGamePhase.BlackVictory;
        break;
    }

    debug('[%s] finished with %s resignation', this.id, EColor[role]);
    this.emit(EServerEvent.PhaseUpdate, {phase: this.phase});
  }
}
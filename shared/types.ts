import {IRawGame, EColor} from './gameLogic';

export enum EServerEvent {
  Move         = 'move',
  PlayerUpdate = 'player_update',
  PhaseUpdate  = 'phase_update',
}

export enum EClientEvent {
  Create  = 'create',
  Watch   = 'watch',
  Join    = 'join',
  Leave   = 'leave',
  SetName = 'set_name',

  Move    = 'move',
  Resign  = 'resign',
}

export enum EStatus {
  Connected    = 'connect',
  Connecting   = 'disconnect',
  Disconnected = 'reconnecting',
}

export enum EGamePhase {
  Waiting,
  Running,
  Canceled,
  WhiteVictory,
  BlackVictory,
}

export interface IPlayerInfo {
  name: string,
  // this might have other properties in the future.
}

export interface IColorMap<T> {
  [EColor.Black]: T,
  [EColor.White]: T,
}

export interface IGameState {
  rawGame: IRawGame,
  phase: EGamePhase,
  moveNumber: number,
  players: Partial<IColorMap<IPlayerInfo>>,
  //moveHistory: TMove[],
}

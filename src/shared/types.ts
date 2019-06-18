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
  Connected,
  Connecting,
  Disconnected,
}

export enum EStatusEvent {
  Connect          = 'connect',
  ConnectError     = 'connect_error',
  ConnectTimeout   = 'connect_timeout',
  Connecting       = 'connecting',
  Disconnect       = 'disconnect',
  Error            = 'error',
  Reconnect        = 'reconnect',
  ReconnectAttempt = 'reconnect_attempt',
  ReconnectFailed  = 'reconnect_failed',
  ReconnectError   = 'reconnect_error',
  Reconnecting     = 'reconnecting',

}

export enum EGamePhase {
  Waiting,
  Running,
  Canceled,
  WhiteVictory,
  BlackVictory,
}

export interface IError {
  name: string,
  message: string,
  stack?: string;
  payload?: any,
}

export interface IPlayerInfo {
  name: string,
  // this might have other properties in the future.
}

export interface IExtendedPlayerInfo {
  name: string,
  isMoving: boolean,
  isClient: boolean,
  captured: number,

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
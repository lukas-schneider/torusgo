export interface IRegMove {
  type: 'Move',
  x: number,
  y: number,
}

export interface IPass {
  type: 'Pass',
}

export type TMove = IRegMove | IPass;

export enum EMoveRequestState { NoMove = 'NoMove', Unprocessed = 'Unprocessed', LocalLegal = 'LocalLegal', SentToServer = 'SentToServer', }

export interface IPosition {
  x: number,
  y: number,
}

export type TKo = IPosition | null;

export interface ISize {
  x: number,
  y: number,
}

export enum EGamePhase {
  Waiting,
  Running,
  Canceled,
  WhiteVictory,
  BlackVictory,
}

export enum EColor {
  Black = 1,
  White = 2,
}

export type TField = EColor | 0;

export type TGameBoard = TField[];

export interface IMeta {
  observers: string[],
  blackId: string,
  whiteId: string,
  id: string,
}

export interface IRuleSet {
  size: ISize,
  komi: number,
  handicap: number,
}

export interface IRawGame {
  ruleSet: IRuleSet,
  toMove: EColor,
  board: TGameBoard,
  koPosition: TKo,
  numPasses: number,
  capturedByBlack: number,
  capturedByWhite: number,
}


// player state shared between server and client
export interface IPlayer {
  name: string,
  isConnected: boolean,
}

// player state used by the client
export interface IPlayerWithInfo extends IPlayer {
  isClient: boolean,
  isMoving: boolean,
  captured: number,
}

// player state used by the server
export interface IPlayerWithId extends IPlayer {
  id: string,
}

export interface IColorMap<T> {
  [EColor.Black]?: T,
  [EColor.White]?: T,
}

export interface IGame {
  rawGame: IRawGame,
  phase: EGamePhase,
  moveNumber: number,
  players: IColorMap<IPlayer>,
  //moveHistory: TMove[],
}

export interface IGameWithInfo extends IGame {
  players: IColorMap<IPlayerWithInfo>,
}
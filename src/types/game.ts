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

export enum EGamePhase {Waiting = 'waiting', Running = 'running'}

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

export interface IGame {
  meta?: IMeta,
  phase: EGamePhase,
  moveNumber: number,
  moveHistory: TMove[],
  rawGame: IRawGame,
}

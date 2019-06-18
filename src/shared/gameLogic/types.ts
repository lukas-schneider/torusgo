import {IColorMap} from '../types';

export interface IRegMove {
  type: 'Move',
  x: number,
  y: number,
}

export interface IPass {
  type: 'Pass',
}

export type TMove = IRegMove | IPass;

export interface IPosition {
  x: number,
  y: number,
}

export type TKo = IPosition | null;


export enum EColor {
  Black = 1,
  White = 2,
}

export type TField = EColor | 0;

export type TGameBoard = TField[];

export interface ISize {
  x: number,
  y: number,
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
  captured: IColorMap<number>,
}




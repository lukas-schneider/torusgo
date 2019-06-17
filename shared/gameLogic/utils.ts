import {IRuleSet, IRawGame, EColor, TMove, IPass, IRegMove} from './types';

export function initGame(ruleSet: IRuleSet): IRawGame {
  return {
    ruleSet,
    toMove: EColor.Black,
    board: new Array(ruleSet.size.x * ruleSet.size.y).fill(0), // TODO handle handicap
    koPosition: null,
    numPasses: 0,
    capturedByBlack: 0,
    capturedByWhite: 0,
  };
}

export function isPass(move: TMove): move is IPass {
  return move.type === 'Pass';
}

export function isRegMove(move: TMove): move is IRegMove {
  return move.type === 'Move';
}

export function pass(): IPass {
  return {
    type: 'Pass',
  };
}

export function regMove(x: number, y: number): IRegMove {
  return {
    type: 'Move', x, y,
  };
}

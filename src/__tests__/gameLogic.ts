import {EColor, IPosition, TGameBoard, TKo} from '../types/game';

import {flipField, testPosition} from '../utils/gameLogic';

// NOTE: 0 is empty, 1 is black, 2 is white

describe('testPosition', () => {
  // test a position with the given board and the inverted board
  function testWhite(size: IPosition,
    board: TGameBoard,
    koPosition: TKo,
    pos: IPosition,
    truthValue: boolean) {
    expect(testPosition(
      size,
      board,
      koPosition,
      EColor.White,
      pos,
    )).toEqual(truthValue);
    expect(testPosition(
      size,
      board.map((field) => flipField(field)),
      koPosition,
      EColor.Black,
      pos,
    )).toEqual(truthValue);
  }

  function testBlack(size: IPosition,
    board: TGameBoard,
    koPosition: TKo,
    pos: IPosition,
    truthValue: boolean) {
    expect(testPosition(
      size,
      board,
      koPosition,
      EColor.Black,
      pos,
    )).toEqual(truthValue);
    expect(testPosition(
      size,
      board.map((field) => flipField(field)),
      koPosition,
      EColor.White,
      pos,
    )).toEqual(truthValue);
  }

  it('empty board', () => {
    const board = new Array(9).fill(0);
    const size = {x: 3, y: 3};

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (const c of [EColor.White, EColor.Black]) {
          testWhite(size, board, null, {x, y}, true);
          testBlack(size, board, null, {x, y}, true);
        }
      }
    }
  });

  it('not quite empty board', () => {
    const board = [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ];
    const size = {x: 3, y: 3};

    testWhite(size, board, null, {x: 1, y: 1}, false);
    testBlack(size, board, null, {x: 1, y: 1}, false);
  });

  it('no self kill', () => {
    const board = [
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ];
    const size = {x: 3, y: 3};

    // White can capture
    testWhite(size, board, null, {x: 1, y: 1}, true);

    // Black can't self kill
    testBlack(size, board, null, {x: 1, y: 1}, false);
  });

  it('no space', () => {
    const board = [
      0, 0, 0,
      1, 1, 1,
      1, 0, 1,
      1, 1, 1,
    ];
    const size = {x: 4, y: 3};

    // White can't move in the center of the eye
    testWhite(size, board, null, {x: 2, y: 1}, false);

    // Black can though
    testBlack(size, board, null, {x: 2, y: 1}, true);
  });

  it('ko inactive', () => {
    const board = [
      0, 1, 2, 0,
      1, 2, 0, 2,
      0, 1, 2, 0,
    ];
    const size = {x: 3, y: 4};

    testBlack(size, board, null, {x: 0, y: 0}, true);

    // Can capture and place
    testBlack(size, board, null, {x: 1, y: 2}, true);

    testWhite(size, board, null, {x: 1, y: 2}, true);
  });

  it('ko active', () => {
    const board = [
      0, 1, 2, 0,
      1, 2, 0, 2,
      0, 1, 2, 0,
    ];
    const size = {x: 3, y: 4};
    const koPosition = {x: 1, y: 2};

    // Black can't play in ko position
    testBlack(size, board, koPosition, {x: 1, y: 2}, false);

    // Note that this doesn't happen in a real game
    testBlack(size, board, koPosition, {x: 1, y: 2}, false);
  });
});
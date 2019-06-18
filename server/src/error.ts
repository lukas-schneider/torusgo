import {TMove} from '../../src/shared/gameLogic';

export class StateError extends Error {
  public name = 'StateError';
  public message: string;
  public payload: any;

  constructor(message: string, payload?: any) {
    super();
    this.message = message;
    this.payload = payload;
  }
}

export class GameNotFoundError extends Error {
  public name = 'GameNotFoundError';
  public message: string;
  public payload: any;

  constructor(payload?: any) {
    super();
    this.message = 'Could not find game with this id';
    this.payload = payload;
  }
}

export class PayloadError extends Error {
  public name = 'PayloadError';
  public message: string;
  public payload: any;

  constructor(payload?: any) {
    super();
    this.message = 'Received unexpected payload';
    this.payload = payload;
  }

}

export class MoveError extends Error {
  public name = 'MoveError';
  public message: string;
  public move: TMove;

  constructor(move: TMove) {
    super();
    this.message = 'Received illegal move';
    this.move = move;
  }
}
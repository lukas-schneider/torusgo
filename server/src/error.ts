import {TMove} from '../../shared/gameLogic';

export class StateError extends Error {
  public name = 'StateError';
  public payload: any;

  constructor(message?: string, payload?: any) {
    super(message);
    this.payload = payload;
  }
}

export class GameNotFoundError extends Error {
  public name = 'GameNotFoundError';
  public payload: any;

  constructor(payload?: any) {
    super();
    this.payload = payload;
  }
}

export class PayloadError extends Error {
  public name = 'PayloadError';
  public payload: any;

  constructor(payload?: any) {
    super();
    this.payload = payload;
  }

}

export class MoveError extends Error {
  public name = 'MoveError';
  public move: TMove;

  constructor(move: TMove) {
    super();
    this.move = move;
  }
}
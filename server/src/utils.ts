import Debug  from 'debug';
import {IMap} from '../../src/shared/utils';

const debug = Debug('torusgo:session');

export type TRes = (payload: any) => void;

// this is a 'method decorator'
// see https://www.typescriptlang.org/docs/handbook/decorators.html
export const messageHandler = (name: string) => (
  target: Object,
  propertyName: string,
  propertyDescriptor: PropertyDescriptor,
) => {
  const method = propertyDescriptor.value;

  propertyDescriptor.value = function (payload: any, res: TRes, ...args: any[]) {
    debug('%s %o', name, payload);

    let sent = false;
    try {
      return method.call(
        this,
        payload,
        (value: any) => {
          debug('=> %s %o', name, value);

          sent = true;
          res(value);
        },
        ...args,
      );
    } catch (err) {
      if (!sent) {
        debug('=> %s %o', name, err);

        res({error: err});
      }
    }
  };

  return propertyDescriptor;
};

export interface IUser {
  id: string,
  name: string,
}

export class Collection<T extends { readonly id: string }> {
  private _map: IMap<T> = {};
  private _ids: string[] = [];

  [Symbol.iterator]() {
    return this._ids.map((id) => this._map[id]);
  };

  public has(id: string): boolean {
    return !!this._map[id];
  }

  public add(item: T) {
    if (this.has(item.id)) return;

    this._map[item.id] = item;
    this._ids.push(item.id);
  }

  public get(id: string) {
    return this._map[id];
  }

  public remove(item: T | string) {
    if (typeof item === 'string') {
      if (!this.has(item)) return;
      delete this._map[item];
      this._ids.splice(this._ids.indexOf(item), 1);
    } else {
      if (!this.has(item.id)) return;

      delete this._map[item.id];
      this._ids.splice(this._ids.indexOf(item.id), 1);
    }
  }

  get length(): number {
    return this._ids.length;
  }
}

export enum ESessionState {
  Idle,           // connected, but not viewing any game
  Observing,      // viewing a game, but not participating
  Playing,        // playing in a game
}
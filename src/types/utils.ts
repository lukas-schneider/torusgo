export interface IMap<T> {
  [key: string]: T,
}

export function contains(type: any, value: any) {
  return Object.values(type).includes(value);
}

export function sign(x: boolean, y: boolean) {
  return x === y ? 0 : (x ? 1 : -1);
}

export interface IPlayer {
  name?: string,
  captured: number,
  isConnected: boolean,
  isClient: boolean,
  isMoving: boolean,
}
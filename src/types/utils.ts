export interface IMap<T> {
  [key: string]: T,
}

export function contains(type: any, value: any) {
  return Object.values(type).includes(value);
}

export function sign(x: boolean, y: boolean) {
  return x === y ? 0 : (x ? 1 : -1);
}

export enum EKeys {
  Up       = 'KeyW',
  Down     = 'KeyS',
  Left     = 'KeyA',
  Right    = 'KeyD',
  TwistIn  = 'KeyQ',
  TwistOut = 'KeyE',
}

export type TKeyState = {
  [key in EKeys]: boolean;
};

export enum EServerEvents {
  Move         = 'move',
  PlayerUpdate = 'player_update',
  FullUpdate   = 'full_update',
  RoleUpdate   = 'role_update',
  PhaseUpdate  = 'phase_update',
}

export enum EClientEvents {
  Move   = 'move',
  Join   = 'join',
  Resign = 'resign',
}

export enum EStatus {
  Connected    = 'connect',
  Connecting   = 'disconnect',
  Disconnected = 'reconnecting',
}

export const OK = {
  message: 'ok',
};
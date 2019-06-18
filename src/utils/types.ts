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

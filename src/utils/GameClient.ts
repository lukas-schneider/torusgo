import Debug                                               from 'debug';
import {EventEmitter}                                      from 'events';
import SocketIO                                            from 'socket.io-client';
import {EColor, TMove}                                     from '../shared/gameLogic';
import {EStatus, EClientEvent, EServerEvent, EStatusEvent} from '../shared/types';
import {enumValues}                                        from '../shared/utils';

const debug = Debug('torusgo:client');

const TIMEOUT = 10 * 1000;

function withTimeout(callback: (response: any) => void) {
  let called = false;

  const interval = setTimeout(() => {
    if (called) return;
    called = true;

    clearTimeout(interval);

    callback({error: {name: 'timeout_error', message: 'The request timed out'}});
  }, TIMEOUT);

  return (response: any) => {
    if (called) return;
    called = true;

    clearTimeout(interval);

    callback(response);
  };
}

export default class GameClient extends EventEmitter {
  static instance: GameClient;
  static options = {
    path: '/ws',
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 4,

  };

  public socket: typeof SocketIO.Socket;
  public status: EStatus;
  public reconnectAttempts = 0;

  public constructor() {
    super();

    this.status = EStatus.Connecting;
    this.socket = SocketIO.connect({...GameClient.options});

    debug('socket.io initialized with options %o', GameClient.options);

    for (let status of enumValues<EStatusEvent>(EStatusEvent)) {
      this.socket.on(status, (...args: any[]) => {
        debug('status event: %s', status, ...args);

        if (status === EStatusEvent.Connect) {
          this.status = EStatus.Connected;
          this.reconnectAttempts = 0;

          this.emit('status_change', this.status);
        } else if (status === EStatusEvent.Reconnecting) {
          this.status = EStatus.Connecting;
          this.reconnectAttempts = args[0];

          this.emit('status_change', this.status);
        } else if (
          status === EStatusEvent.Disconnect || (
            status === EStatusEvent.ReconnectFailed
            && this.reconnectAttempts >= GameClient.options.reconnectionAttempts
          )
        ) {
          this.status = EStatus.Disconnected;
          this.reconnectAttempts = 0;

          this.emit('status_change', this.status);
        }
      });
    }

    for (let event of enumValues<EServerEvent>(EServerEvent)) {
      this.socket.on(event, (payload?: any) => {
        debug('=> %s %o', event, payload);
        this.emit(event, payload);
      });
    }

    this.socket.on('pong', (latency: number) => {
      this.emit('latency', latency);
    });

    window.addEventListener('beforeunload', () => this.socket.close());
  }

  private send(event: EClientEvent, payload?: any) {
    if (this.status !== EStatus.Connected) return;

    debug('<= %s %O', event, payload);
    this.socket.emit(event, payload);
    return this;
  }

  private sendWithAck(event: EClientEvent, payload?: any) {
    if (this.status !== EStatus.Connected) return;

    debug('<= %s %O', event, payload);
    this.socket.emit(
      event,
      payload,
      withTimeout((response: any) => debug('=> %s %O', event, response)),
    );
    return this;
  }

  private sendWithPromise(event: EClientEvent, payload?: any) {
    if (this.status !== EStatus.Connected) return Promise.reject();

    debug('<= %s %O', event, payload);
    return new Promise((resolve, reject) => this.socket.emit(
      event,
      payload,
      withTimeout((response: any) => {
        debug('=> %s %O', event, response);
        if (response && response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }),
    ));
  }

  // ---- Client Event  API ----
  // https://github.com/lukas-schneider/torusgo/wiki/Torusgo-Network-Protocol-v1.0#client-events

  public watch(id: string) {
    return this.sendWithPromise(EClientEvent.Watch, {gameId: id});
  }

  public join(color: EColor) {
    return this.sendWithPromise(EClientEvent.Join, {role: color});
  }

  public leave() {
    this.sendWithAck(EClientEvent.Leave);
  }

  public setName(name: string) {
    this.sendWithAck(EClientEvent.SetName, {name: name});
  }

  public move(move: TMove) {
    this.sendWithAck(EClientEvent.Move, move);
  }

  public resign() {
    this.sendWithAck(EClientEvent.Resign);
  }
}

GameClient.instance = new GameClient();
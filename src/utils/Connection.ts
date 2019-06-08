import Debug from 'debug';

import EventEmitter                            from 'events';
import SocketIO                                from 'socket.io-client';
import {TMove, EColor}                         from '../types/game';
import {EServerEvents, EClientEvents, EStatus} from '../types/utils';

const debugStatus = Debug('torusgo:connection-status');
const debugReceive = Debug('torusgo:connection-recv');
const debugSend = Debug('torusgo:connection-send');

const TIMEOUT = 10 * 1000;

function withTimeout(callback: (response: any) => void) {
  let called = false;

  const interval = setTimeout(() => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback({error: 'timeout_error', message: 'The request timed out'});
  }, TIMEOUT);

  return (response: any) => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback(response);
  };
}

class Connection extends EventEmitter {
  static PREFIX = '/ws';

  protected socket: typeof SocketIO.Socket;
  protected status: EStatus;

  constructor(namespace: string) {
    super();
    debugStatus('opening connection...');

    this.socket = SocketIO.connect('/' + namespace, {
      path: Connection.PREFIX,
      transports: ['polling', 'websocket'],
      query: {
        id: 'asdf1234',
        name: 'lukas',
      },
    });

    //this.socket.on('reconnect_attempt', () => {
    //  this.socket.io.opts.transports = ['polling', 'websocket'];
    //});

    this.status = EStatus.Connecting;

    for (let key in EStatus) {
      this.socket.on(EStatus[key], () => {
        this.status = EStatus[key] as EStatus;
        debugStatus('status %s', this.status);
        this.emit('status', this.status);
      });
    }

    this.socket.on('pong', (latency: number) => {
      this.emit('latency', latency);
    });
  }

  protected sendWithAck(event: string, payload?: any) {
    debugSend('%s %O', event, payload);
    return new Promise((resolve, reject) => this.socket.emit(
      event,
      payload,
      withTimeout((response: any) => {
        debugSend('%s -> %O', event, response);
        if (response && response.error) {
          reject(response);
        } else {
          resolve(response);
        }
      }),
    ));
  }

  protected send(event: string, payload?: any) {
    this.socket.send(event, payload);
    return this;
  }

  public close() {
    debugStatus('closing connection...');
    this.removeAllListeners();
    this.socket.close();
  }
}

export default class GameConnection extends Connection {
  constructor(namespace: string) {
    super(namespace);

    for (let key in EServerEvents) {
      this.socket.on(EServerEvents[key], (payload: any) => {
        debugReceive('%s, %O', EServerEvents[key], payload);
        this.emit(EServerEvents[key], payload);
      });
    }
  }

  public resign() {
    this.sendWithAck(EClientEvents.Resign).finally();
  }

  public join(color: EColor) {
    this.sendWithAck(EClientEvents.Join, color).finally();
  }

  public move(move: TMove) {
    this.sendWithAck(EClientEvents.Move, move).finally();
  }
}
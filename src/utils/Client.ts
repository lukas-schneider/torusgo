import SocketIO from 'socket.io-client';

export enum EStatus {
  Connected    = 'CONNECTED',
  Connecting   = 'RECONNECTING',
  Disconnected = 'DISCONNECTED',
}


export class Client {
  static PREFIX = '/ws';

  private socket: typeof SocketIO.Socket;

  private statusChangeCallbacks: ((status: EStatus) => void)[] = [];

  public timeout: number = 10 * 1000;

  public status: EStatus;

  constructor(namespace: string) {
    this.socket = SocketIO.connect('/' + namespace, {
      path: Client.PREFIX,
      query: {
        id: 'asdf1234',
        name: 'lukas',
      },
    });
    this.status = EStatus.Connecting;

    this.socket.on('connect', () => {
      this.status = EStatus.Connected;
      this.statusChange();
    });

    this.socket.on('disconnect', () => {
      this.status = EStatus.Disconnected;
      this.statusChange();
    });

    this.socket.on('reconnecting', () => {
      this.status = EStatus.Connecting;
      this.statusChange();
    });

    ['connect', 'connect_error', 'connect_timeout', 'error', 'disconnect', 'reconnect',
      'reconnect_attempt', 'reconnecting', 'reconnect_error', 'reconnect_failed'].forEach(
      (name) => {
        this.socket.on(name, (...args: any[]) => {
          console.log(name + ': ' + args.join(' '));
        });
      });
  }

  private statusChange() {
    this.statusChangeCallbacks.forEach((callback) => callback(this.status));
  }

  private withTimeout(callback: (response: any) => void) {
    let called = false;

    const interval = setTimeout(() => {
      if (called) {
        return;
      }
      called = true;
      clearTimeout(interval);

      callback({error: 'timeout_error', message: 'The request timed out'});
    }, this.timeout);

    return (response: any) => {
      if (called) {
        return;
      }
      called = true;
      clearTimeout(interval);

      callback(response);
    };
  }

  public send(event: string, payload: any) {
    if (this.status !== EStatus.Connected) return null;

    this.socket.emit(event, payload);
    return this;
  }

  public sendWithAck(event: string, payload: any) {
    if (this.status !== EStatus.Connected) return null;

    return new Promise((resolve, reject) => this.socket.emit(
      event,
      payload,
      this.withTimeout((response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(response);
        }
      }),
    ));
  }

  public onStatusChange(callback: (status: EStatus) => void) {
    if (this.statusChangeCallbacks.indexOf(callback) !== -1) return;

    this.statusChangeCallbacks.push(callback);

    return this;
  }

  public onEvent(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  public close() {
    this.socket.close();

    return this;
  }
}
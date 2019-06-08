import {boundMethod}                            from 'autobind-decorator';
import debug                                    from 'debug';
import * as SocketIO                            from 'socket.io';
import {EColor, IPlayerWithId, EGamePhase}      from '../../src/types/game';
import {contains, EServerEvents, EClientEvents} from '../../src/types/utils';
import Game                                     from './Game';

type TRes = (response: any) => void;

const debugSend = debug('torusgo:connection-send');
const debugReceive = debug('torusgo:connection-recv');
const debugStatus = debug('torusgo:connection-status');

export default class Connection {
  public socket: SocketIO.Socket;
  public game: Game;

  public player: IPlayerWithId;
  private role?: EColor;

  constructor(socket: SocketIO.Socket, game: Game) {
    this.socket = socket;
    this.game = game;

    const id = socket.handshake.query.id;
    const name = socket.handshake.query.name;

    this.player = {id, name, isConnected: true};

    if (typeof id !== 'string' || typeof name !== 'string') {
      this.socket.disconnect(true);
      return;
    }

    debugStatus('new connection with id: %s, name: %s', id, name);

    this.game.connections.push(this);

    // check if this client was a player before
    [EColor.White, EColor.Black].forEach((color) => {
      if (this.game.players[color] && this.game.players[color]!.id === id) {
        debugStatus('assigning %s as %s player ', id, EColor[color]);
        this.game.assignPlayer(color, this.player);
        this.role = color;
      }
    });


    for (let key in EClientEvents) {
      this.socket.on(EClientEvents[key], (payload) => {
        debugReceive('%s %O', EClientEvents[key], payload);
      });
    }

    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('move', this.onMove);
    this.socket.on('join', this.onJoin);

    this.sendFullGame();
  }

  @boundMethod
  public onDisconnect(reason: string) {
    debugStatus('connection lost with %s', this.player.id);
    if (this.role) {
      this.game.players[this.role]!.isConnected = false;
      this.game.emitPlayerUpdate();
    }
    this.game.connections.splice(this.game.connections.indexOf(this), 1);
  }

  @boundMethod
  public onMove(payload: any, res: TRes) {
    if (!this.role) {
      return res({error: 'state_error', payload, message: 'not a player'});
    }

    if (this.game.rawGame.toMove !== this.role) {
      return res({error: 'state_error', payload, message: 'player not to move'});
    }

    if (!payload || !(payload.type === 'Move' || payload.type === 'Pass')) {
      return res({error: 'payload_error', payload, message: 'invalid move type'});
    }

    if (payload.type === 'move' && typeof payload.x !== 'number' && typeof payload.y !== 'number') {
      return res({error: 'payload_error', payload, message: 'invalid coordinate type'});
    }

    if (!this.game.execMove(payload)) {
      return res({error: 'move_error', payload, message: 'illegal move'});
    }

    res(null);
  }

  @boundMethod
  public onJoin(payload: any, res: TRes) {
    if (this.game.phase !== EGamePhase.Waiting) {
      return res({error: 'state_error', payload, message: 'game has already started'});
    }

    if (this.role) {
      return res({error: 'state_error', payload, message: 'user is already a player'});
    }

    if (!contains(EColor, payload)) {
      return res({error: 'payload_error', payload, message: 'payload is not a color'});
    }

    if (this.game.players[payload as EColor]) {
      return res({error: 'state_error', payload, message: 'color already taken'});
    }

    this.game.assignPlayer(payload as EColor, this.player);

    this.role = payload;
    this.sendRoleUpdate();

    res(null);
  }

  public sendFullGame() {
    this.socket.emit(EServerEvents.FullUpdate, {
      game: {
        rawGame: this.game.rawGame,
        phase: this.game.phase,
        players: this.game.getPlayersWithoutId(),
        moveNumber: this.game.moveNumber,
      },
      role: this.role,
    });
  }

  public sendRoleUpdate() {
    this.socket.emit(EServerEvents.RoleUpdate, {
      role: this.role,
    });
  }
}
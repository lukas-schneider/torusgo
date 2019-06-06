import * as SocketIO from 'socket.io';
import Game          from './Game';
import {boundMethod} from 'autobind-decorator';
import {EColor}      from '../../src/types/game';
import {contains}    from '../../src/types/utils';

export interface IPlayer {
  id: string,
  name: string,
  connected: boolean,
}

type TRes = (response: any) => void;

export default class Connection {
  public player: IPlayer;
  public socket: SocketIO.Socket;
  public game: Game;

  private color?: EColor;

  constructor(socket: SocketIO.Socket, game: Game) {
    this.socket = socket;
    this.game = game;

    const id = socket.handshake.query.id;
    const name = socket.handshake.query.name;

    this.player = {id, name, connected: true};

    if (typeof id !== 'string' || typeof name !== 'string') {
      this.socket.disconnect(true);
      return;
    }

    this.game.connections.push(this);

    console.log(socket.id + ' connected');

    // check if this is was a player before
    [EColor.White, EColor.Black].forEach((color) => {
      if (this.game.players[color] && this.game.players[color]!.id === id) {
        this.game.players[color] = this.player;
        this.color = color;
        this.game.emitPlayerUpdate();
      }
    });

    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('move', this.onMove);
    this.socket.on('join', this.onJoin);

    this.sendFullGame();
  }

  @boundMethod
  public onDisconnect(reason: string) {
    if (this.color) {
      this.game.players[this.color]!.connected = false;
      this.game.emitPlayerUpdate();
    }
    this.game.connections.splice(this.game.connections.indexOf(this), 1);
    console.log(this.socket.id + ' disconnected with reason ' + reason);
  }

  @boundMethod
  public onMove(payload: any, res: TRes) {
    if (!this.color) {
      return res({error: 'state_error', payload, message: 'not a player'});
    }

    if (this.game.state.toMove !== this.color) {
      return res({error: 'state_error', payload, message: 'player not to move'});
    }

    if (!payload || !(payload.type === 'move' || payload.type === 'pass')) {
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
    if (this.color) {
      return res({error: 'state_error', payload, message: 'user is already a player'});
    }

    if (!contains(EColor, payload)) {
      return res({error: 'payload_error', payload, message: 'payload is not a color'});
    }

    if (this.game.players[payload as EColor]) {
      return res({error: 'state_error', payload, message: 'color already taken'});
    }

    this.game.players[payload as EColor] = this.player;
    this.game.emitPlayerUpdate();

    res(null);
  }

  public sendFullGame() {
    this.socket.emit('update', {
      game: this.game.state,
      players: this.game.players,
      moveNumber: this.game.moveNumber,
    });
  }
}
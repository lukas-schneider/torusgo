import {boundMethod}                                            from 'autobind-decorator';
import * as SocketIO                                            from 'socket.io';
import {equals}                                                 from 'typescript-is';
import {EColor, TMove, IRuleSet}                                from '../../shared/gameLogic';
import {EClientEvent, EServerEvent}                             from '../../shared/types';
import {checkName}                                              from '../../shared/utils';
import {PayloadError, GameNotFoundError, StateError, MoveError} from './error';
import Game                                                     from './Game';
import GameServer                                               from './GameServer';
import {TRes, messageHandler, ESessionState}                    from './utils';

export default class Session {
  public readonly id: string;

  public name: string = '';

  public state: ESessionState = ESessionState.Idle;

  public game?: Game;
  public role?: EColor;

  private socket: SocketIO.Socket;
  private server: GameServer;

  constructor(socket: SocketIO.Socket, server: GameServer) {
    this.server = server;
    this.socket = socket;
    this.id = socket.id;

    this.socket.on(EClientEvent.Create, this.handleCreate);
    this.socket.on(EClientEvent.Watch, this.handleWatch);
    this.socket.on(EClientEvent.Join, this.handleJoin);
    this.socket.on(EClientEvent.Leave, this.handleLeave);
    this.socket.on(EClientEvent.Move, this.handleMove);
    this.socket.on('disconnect', this.handleDisconnect);
  }

  // ---- actions ----

  private watch(game: Game) {
    // no state assumptions
    if (this.state !== ESessionState.Idle) {
      this.socket.leave(Game.ROOM_PREFIX + this.game!.id);

      if (this.state === ESessionState.Playing) {
        this.game!.disconnect(this.role!);
        delete this.role;
      }
    }

    this.game = game;
    this.socket.join(Game.ROOM_PREFIX + game.id);
    this.state = ESessionState.Observing;
  }

  private leave() {
    // no state assumptions
    if (this.state === ESessionState.Idle) return;

    this.socket.leave(Game.ROOM_PREFIX + this.game!.id);

    if (this.state === ESessionState.Playing) {
      this.game!.disconnect(this.role!);
      delete this.role;
    }

    delete this.game;
    this.state = ESessionState.Idle;
  }

  private join(role: EColor) {
    // assumption: not idle
    if (this.state === ESessionState.Playing) {
      this.game!.disconnect(this.role!);
    }

    this.game!.connect(this, role);
    this.role = role;
    this.state = ESessionState.Playing;
  }

  // ---- event handlers ----

  @boundMethod
  @messageHandler
  private handleCreate(payload: any, res: TRes) {
    if (!equals<IRuleSet>(payload)) {
      throw new PayloadError(payload);
    }

    res({
      id: this.server.createGame(payload),
    });
  }

  @boundMethod
  @messageHandler
  private handleWatch(payload: any, res: TRes) {
    if (!equals<{ gameId: string }>(payload)) {
      throw new PayloadError(payload);
    }

    if (!this.server.games.has(payload.gameId)) {
      throw new GameNotFoundError(payload);
    }

    this.watch(this.server.games.get(payload.gameId));

    res(this.game!.getState());
  }

  @boundMethod
  @messageHandler
  private handleJoin(payload: any, res: TRes) {
    if (!equals<{ role: EColor }>(payload)) {
      throw new PayloadError(payload);
    }

    if (this.state === ESessionState.Idle) {
      throw new StateError('not observing a game', payload);
    }

    if (this.game!.players[payload.role]) {
      throw new StateError('role occupied by another player', payload);
    }

    this.join(payload.role);

    res(null);
  }

  @boundMethod
  @messageHandler
  private handleLeave(payload: any, res: TRes) {
    this.leave();

    res(null);
  }


  @boundMethod
  @messageHandler
  private handleMove(payload: any, res: TRes) {
    if (!equals<TMove>(payload)) {
      throw new PayloadError(payload);
    }

    if (this.state !== ESessionState.Playing) {
      throw new StateError('not playing', payload);
    }

    if (!this.game!.execMove(payload)) {
      throw new MoveError(payload);
    }

    res(null);
  }

  @boundMethod
  @messageHandler
  private handleSetName(payload: any, res: TRes) {
    if (!equals<{ name: string }>(payload)) {
      throw new PayloadError(payload);
    }

    const trimmed = payload.name.trim();
    if (!checkName(trimmed)) {
      throw new PayloadError(payload);
    }

    this.name = trimmed;

    if (this.state !== ESessionState.Idle) {
      this.game!.emit(EServerEvent.PlayerUpdate);
    }

    res(null);
  }

  @boundMethod
  private handleDisconnect() {
    this.leave();

    this.server.sessions.remove(this);
  }
}
import {boundMethod}                              from 'autobind-decorator';
import React, {Component}                         from 'react';
import {RouteComponentProps}                      from 'react-router';
import {EColor, IGame, TMove, IPlayer, IColorMap} from '../types/game';
import {EStatus, EServerEvents}                   from '../types/utils';
import GameConnection                             from '../utils/Connection';
import {execMove, regMove, testMove}              from '../utils/gameLogic';
import ScoreBoard                                 from './ScoreBoard';
import SideLayout                                 from './SideLayout';
import StatusPanel                                from './StatusPanel';
import ThreeAnimation                             from './ThreeAnimation';

interface IState {
  status: EStatus,
  latency: number,
  game?: IGame,
  role?: EColor,
}

export default class ServerGame extends Component<RouteComponentProps<{ id: string }>, IState> {

  private connection: GameConnection;

  constructor(props: Readonly<RouteComponentProps<{ id: string }>>) {
    super(props);
    this.state = {
      status: EStatus.Disconnected,
      latency: 0,
    };
  }

  public componentDidMount() {
    this.connect();

  }

  public componentWillUnmount() {
    this.disconnect();
  }

  public componentDidUpdate(prevProps: Readonly<RouteComponentProps<{ id: string }>>) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.disconnect();
      this.connect();
    }
  }

  public render() {
    const {status, game, role, latency} = this.state;

    const gameWithInfo = game && {
      ...game,
      players: {
        [EColor.White]: game.players[EColor.White] && {
          ...game.players[EColor.White]!,
          isClient: role === EColor.White,
          isMoving: game.rawGame.toMove === EColor.White,
          captured: game.rawGame.capturedByWhite,
        },
        [EColor.Black]: game.players[EColor.Black] && {
          ...game.players[EColor.Black]!,
          isClient: role === EColor.Black,
          isMoving: game.rawGame.toMove === EColor.Black,
          captured: game.rawGame.capturedByWhite,
        },
      },
    };

    return (
      <>
        {gameWithInfo &&
        <SideLayout>
          <StatusPanel status={status}
                       latency={latency}/>
          <ScoreBoard game={gameWithInfo}
                      onJoin={status === EStatus.Connected ? this.joinGame : undefined}/>
        </SideLayout>
        }
        {game &&
        <ThreeAnimation rawGame={game.rawGame}
                        onClick={(x, y) => this.testAndSendMove(regMove(x, y))}/>
        }
      </>
    );
  }

  private connect() {
    this.connection = new GameConnection(this.props.match.params.id);

    this.connection.on('status', (status) => this.setState({status}));

    this.connection.on('latency', (latency) => this.setState({latency}));

    this.connection.on(EServerEvents.FullUpdate, this.onUpdate);
    this.connection.on(EServerEvents.RoleUpdate, this.onUpdate);
    this.connection.on(EServerEvents.PlayerUpdate, this.onPlayerUpdate);
    this.connection.on(EServerEvents.Move, this.onMove);
  }

  private disconnect() {
    this.connection.close();
  }

  private testAndSendMove(move: TMove) {
    const {game, role} = this.state;
    if (!game) return;

    if (role !== game.rawGame.toMove) return;

    if (!testMove(game.rawGame, move)) return;

    this.sendMove(move);
  }

  @boundMethod
  private joinGame(color: EColor) {
    if (this.state.status !== EStatus.Connected) return;

    this.connection.join(color);
  }

  private sendMove(move: TMove) {
    if (this.state.status !== EStatus.Connected) return;

    this.connection.move(move);
  }

  @boundMethod
  private onUpdate(payload: { game?: IGame, role?: EColor }) {
    this.setState(payload);
  }

  @boundMethod
  private onPlayerUpdate(payload: IColorMap<IPlayer>) {
    if (!this.state.game) return;
    this.setState({
      game: {
        ...this.state.game,
        players: payload,
      },
    });
  }

  @boundMethod
  private onMove(payload: TMove) {
    if (!this.state.game) return;
    this.setState({
      game: {
        ...this.state.game,
        rawGame: execMove(this.state.game.rawGame, payload),
        moveNumber: this.state.game.moveNumber + 1,
      },
    });
  }
}
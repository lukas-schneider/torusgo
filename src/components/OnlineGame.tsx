import {Typography, LinearProgress, Paper} from '@material-ui/core';
import {boundMethod}                       from 'autobind-decorator';
import React, {Component}                  from 'react';
import {RouteComponentProps}               from 'react-router';
import {
  execMove,
  regMove,
  testMove,
  EColor,
  TMove,
}                                          from '../shared/gameLogic';
import {
  IGameState,
  IColorMap,
  IPlayerInfo,
  IError,
  EGamePhase,
  EServerEvent,
}                                          from '../shared/types';
import GameClient                          from '../utils/GameClient';
import withClient                          from '../utils/withClient';
import MainLayout                          from './MainLayout';
import ScoreBoard                          from './ScoreBoard';
import SideLayout                          from './SideLayout';
import ThreeAnimation                      from './ThreeAnimation';

interface IState {
  game?: IGameState,
  role?: EColor,
  error?: IError,
}

class OnlineGame extends Component<RouteComponentProps<{ id: string }>, IState> {
  state: IState = {};

  public componentDidMount() {
    this.watch();

    GameClient.instance.on(EServerEvent.Move, this.handleMove);
    GameClient.instance.on(EServerEvent.PlayerUpdate, this.handlePlayerUpdate);
    GameClient.instance.on(EServerEvent.PhaseUpdate, this.handlePhaseUpdate);
  }

  public componentWillUnmount() {
    this.leave();

    GameClient.instance.off(EServerEvent.Move, this.handleMove);
    GameClient.instance.off(EServerEvent.PlayerUpdate, this.handlePlayerUpdate);
    GameClient.instance.off(EServerEvent.PhaseUpdate, this.handlePhaseUpdate);
  }

  public componentDidUpdate(prevProps: Readonly<RouteComponentProps<{ id: string }>>) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.leave();
      this.watch();
    }
  }

  public render() {
    const {game, role, error} = this.state;

    if (game) {
      return (
        <>
          <SideLayout>
            <ScoreBoard game={game}
                        role={role}
                        onJoin={this.join}/>
          </SideLayout>
          <ThreeAnimation rawGame={game.rawGame}
                          onClick={(x, y) => this.move(regMove(x, y))}/>
        </>
      );
    } else {
      if (error) {
        return (
          <MainLayout>
            <Paper>
              <Typography variant={'h5'}>
                {error.name}
              </Typography>
              <hr/>
              <Typography variant={'body1'}>
                {error.message}<br/>
                {error.payload &&
                <code>{JSON.stringify(error.payload)}</code>
                }
              </Typography>
            </Paper>
          </MainLayout>
        );
      } else {
        return (
          <MainLayout>
            <Typography variant={'h5'} align={'center'}>
              Loading Game...
            </Typography>
            <LinearProgress/>
          </MainLayout>
        );
      }
    }


  }

  private leave() {
    GameClient.instance.leave();
    this.setState({
      error: undefined,
      game: undefined,
      role: undefined,
    });
  }

  private watch() {
    GameClient.instance.watch(this.props.match.params.id)
      .then((payload: any) => this.setState({
        game: payload,
      }))
      .catch((error: any) => this.setState({
        error: error,
      }));
  }

  @boundMethod
  private join(role: EColor) {
    GameClient.instance.join(role)
      .then((payload: any) => this.setState({
        role: payload.role,
      }))
      .catch();
  }

  private move(move: TMove) {
    const {game, role} = this.state;
    if (!game) return;

    if (role !== game.rawGame.toMove) return;

    if (!testMove(game.rawGame, move)) return;

    GameClient.instance.move(move);
  }

  @boundMethod
  private handlePhaseUpdate(payload: { phase: EGamePhase }) {
    if (!this.state.game) return;
    this.setState({
      game: {
        ...this.state.game,
        phase: payload.phase,
      },
    });
  }

  @boundMethod
  private handlePlayerUpdate(payload: IColorMap<IPlayerInfo>) {
    if (!this.state.game) return;
    this.setState({
      game: {
        ...this.state.game,
        players: payload,
      },
    });
  }

  @boundMethod
  private handleMove(payload: TMove) {
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

export default withClient(GameClient.instance)(OnlineGame);
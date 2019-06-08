import {boundMethod}                                        from 'autobind-decorator';
import React, {Component}                                   from 'react';
import {RouteComponentProps}                                from 'react-router';
import {EColor, EGamePhase, IGameWithInfo, IRuleSet, TMove} from '../types/game';
import {execMove, initGame, regMove, testMove}              from '../utils/gameLogic';
import ConfigDialog                                         from './ConfigDialog';
import SidePanel                                            from './ScoreBoard';
import ThreeAnimation                                       from './ThreeAnimation';

interface IState {
  game?: IGameWithInfo
  configOpen: boolean,
}

export default class LocalGame extends Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      configOpen: true,
    };
  }

  @boundMethod
  setConfig(ruleSet: IRuleSet, white: string, black: string) {
    const rawGame = initGame(ruleSet);
    this.setState({
      game: {
        rawGame: rawGame,
        phase: EGamePhase.Running,
        moveNumber: 0,
        players: {
          [EColor.White]: {
            name: white,
            isMoving: rawGame.toMove === EColor.White,
            isClient: true,
            isConnected: true,
            captured: rawGame.capturedByWhite,
          },
          [EColor.Black]: {
            name: black,
            isMoving: rawGame.toMove === EColor.Black,
            isClient: true,
            isConnected: true,
            captured: rawGame.capturedByBlack,
          },
        },
      },
      configOpen: false,
    });
  }

  testAndExecMove(move: TMove) {
    if (!this.state.game) return;

    if (!testMove(this.state.game.rawGame, move)) return;

    this.setState({
      ...this.state,
      game: {
        ...this.state.game,
        rawGame: execMove(this.state.game.rawGame, move),
        moveNumber: this.state.game.moveNumber + 1,
      },
    });
  }

  render() {
    const {game, configOpen} = this.state;
    return (
      <>
        <ConfigDialog open={configOpen}
                      allowCancel={game !== undefined}
                      onCancel={() => this.setState({configOpen: false})}
                      onClose={this.setConfig}/>

        {game &&
        <SidePanel onOpenConfig={() => this.setState({configOpen: true})} game={game}/>
        }

        {game &&
        <ThreeAnimation rawGame={game.rawGame}
                        onClick={(x, y) => this.testAndExecMove(regMove(x, y))}/>
        }
      </>
    );
  }
}

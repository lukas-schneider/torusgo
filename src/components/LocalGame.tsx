import {boundMethod}                                                    from 'autobind-decorator';
import React, {Component}                                               from 'react';
import {RouteComponentProps}                                            from 'react-router';
import {execMove, initGame, regMove, testMove, IRuleSet, EColor, TMove} from '../shared/gameLogic';
import {EGamePhase, IGameState}                                         from '../shared/types';
import Animation                                                        from './AnimationCanvas';
import ConfigDialog                                                     from './ConfigDialog';
import ScoreBoard                                                       from './ScoreBoard';
import SideLayout                                                       from './SideLayout';

interface IState {
  game?: IGameState,
  configOpen: boolean,
}

export default class LocalGame extends Component<RouteComponentProps, IState> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      configOpen: true,
    };
  }

  public render() {
    const {game, configOpen} = this.state;
    return (
      <>
        <ConfigDialog open={configOpen}
                      allowCancel={game !== undefined}
                      onCancel={() => this.setState({configOpen: false})}
                      onClose={this.setConfig}/>
        {game &&
        <SideLayout>
          <ScoreBoard game={game}/>
        </SideLayout>
        }

        {game &&
        <Animation allowInput
                   rawGame={game.rawGame}
                   onClick={(x, y) => this.testAndExecMove(regMove(x, y))}/>
        }
      </>
    );
  }

  @boundMethod
  private setConfig(ruleSet: IRuleSet, white: string, black: string) {
    this.setState({
      game: {
        rawGame: initGame(ruleSet),
        phase: EGamePhase.Running,
        moveNumber: 3,
        players: {
          [EColor.White]: {
            name: white,
          },
          [EColor.Black]: {
            name: black,
          },
        },
      },
      configOpen: false,
    });
  }

  private testAndExecMove(move: TMove) {
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
}

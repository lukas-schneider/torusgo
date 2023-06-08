import {boundMethod}                                                    from 'autobind-decorator';
import React, {Component}                                               from 'react';
import {RouteComponentProps}                                            from 'react-router';
import {execMove, initGame, regMove, testMove, IRuleSet, EColor, TMove} from '../shared/gameLogic';
import {EGamePhase, IGameState}                                         from '../shared/types';
import AnimationCanvas                                                  from './AnimationCanvas';
import ConfigDialog                                                     from './ConfigDialog';
import QuickSettings                                                    from './QuickSettings';
import ScoreBoard                                                       from './ScoreBoard';
import SideLayout                                                       from './SideLayout';

interface IState {
  game?: IGameState,
  configOpen: boolean,
  three: boolean
}
type IProps = RouteComponentProps & { setDarkMode: (darkMode: boolean) => void, darkMode: boolean };
export default class LocalGame extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      configOpen: true,
      three: true,
    };
  }

  public render() {
    const {darkMode, setDarkMode} = this.props;
    const {game, configOpen, three} = this.state;
    return (
      <>
        <ConfigDialog open={configOpen}
                      allowCancel={game !== undefined}
                      onCancel={() => this.setState({configOpen: false})}
                      onClose={this.setConfig}/>
        {game &&
          <SideLayout>
            <ScoreBoard game={game}/>
            <QuickSettings three={three} setThree={(three) => this.setState({three})}
                           darkMode={darkMode} setDarkMode={setDarkMode} reset={() => this.setState({game: undefined, configOpen: true})}/>
          </SideLayout>
        }

        {game &&
          <AnimationCanvas allowInput three={three} rawGame={game.rawGame}
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

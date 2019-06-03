import React, {Component}                       from 'react';
import {EColor, EGamePhase, IRawGame, IRuleSet} from '../types/game';
import {execMove, initGame, regMove, testMove}  from '../utils/gameLogic';
import ThreeAnimation                           from './ThreeAnimation';
import SidePanel                                from './SidePanel';
import ConfigDialog                             from './ConfigDialog';
import {boundMethod}                            from 'autobind-decorator';

interface IState {
  game?: IRawGame,
  gamePhase: EGamePhase,
  moveNumber: number,
  white: string,
  black: string,
  configOpen: boolean,
}

class LocalGame extends Component<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      gamePhase: EGamePhase.Waiting,
      moveNumber: 0,
      white: '',
      black: '',
      configOpen: true,
    };
  }

  @boundMethod
  setConfig(ruleSet: IRuleSet, white: string, black: string) {
    this.setState({
      game: initGame(ruleSet),
      gamePhase: EGamePhase.Running,
      white,
      black,
      configOpen: false,
    });
  }

  render() {
    const {game, white, black, gamePhase, moveNumber, configOpen} = this.state;
    return (
      <div>
        <ConfigDialog open={configOpen}
                      allowCancel={game !== undefined}
                      onCancel={() => this.setState({configOpen: false})}
                      onClose={this.setConfig}/>
        {game &&
        <SidePanel ruleSet={game.ruleSet}
                   gamePhase={gamePhase}
                   moveNumber={moveNumber}
                   local
                   white={{
                     name: white,
                     captured: game.capturedByWhite,
                     isMoving: game.toMove === EColor.White,
                     isClient: true,
                     isConnected: true,
                   }}
                   black={{
                     name: black,
                     captured: game.capturedByBlack,
                     isMoving: game.toMove === EColor.Black,
                     isClient: true,
                     isConnected: true,
                   }}
                   onOpenConfig={() => this.setState({configOpen: true})}/>
        }
        {game &&
        <ThreeAnimation boardSizeX={game.ruleSet.size.x}
                        boardSizeY={game.ruleSet.size.y}
                        boardState={game.board}
                        testMove={(x, y) => testMove(game, regMove(x, y))}
                        execMove={(x, y) => this.setState({
                          game: execMove(game, regMove(x, y)),
                          moveNumber: this.state.moveNumber + 1,
                        })}
                        radius={1}
                        thickness={game.ruleSet.size.x / game.ruleSet.size.y / 2}
                        stoneSize={0.05}/>
        }
      </div>
    );
  }
}

export default LocalGame;
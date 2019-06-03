import React, {Component}                      from 'react';
import {EColor, IRawGame}                      from '../types/game';
import {execMove, initGame, regMove, testMove} from '../utils/gameLogic';
import ThreeAnimation                          from './ThreeAnimation';
import TitlePanel                              from './SidePanel';

interface IState {
  game: IRawGame,
  white: string,
  black: string,
}

class LocalGame extends Component<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      game: initGame({handicap: 2, komi: 5.5, size: {x: 19, y: 19}}),
      white: 'Lukas',
      black: 'Lars',
    };
  }

  render() {
    const {game, white, black} = this.state;
    return (
      <div>
        <TitlePanel ruleSet={game.ruleSet}
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
                    }}/>
        <ThreeAnimation boardSizeX={game.ruleSet.size.x}
                        boardSizeY={game.ruleSet.size.y}
                        boardState={game.board}
                        testMove={(x, y) => testMove(game, regMove(x, y))}
                        execMove={(x, y) => this.setState({
                          game: execMove(game, regMove(x, y)),
                        })}
                        radius={1}
                        thickness={game.ruleSet.size.x / game.ruleSet.size.y / 2}
                        stoneSize={0.05}>

        </ThreeAnimation>
      </div>
    );
  }
}

export default LocalGame;
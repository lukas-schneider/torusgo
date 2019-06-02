import React, {Component}                      from 'react';
import {IRawGame}                              from '../types/game';
import {execMove, initGame, regMove, testMove} from '../utils/gameLogic';
import ThreeAnimation                          from './ThreeAnimation';

class LocalGame extends Component<any, { game: IRawGame }> {

  constructor(props: any) {
    super(props);
    this.state = {
      game: initGame({handicap: 0, komi: 0, size: {x: 19, y: 19}}),
    };
  }

  render() {
    const {game} = this.state;
    return (
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
    );
  }
}

export default LocalGame;
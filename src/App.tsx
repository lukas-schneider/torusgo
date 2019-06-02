import React, {Component}               from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {initGame}                       from './utils/gameLogic';
import {CssBaseline}                    from '@material-ui/core';
import {IRawGame}                       from './types/game';
import LocalGame                        from './components/LocalGame';
import LandingPage                      from './components/LandingPage';

class App extends Component<any, { game: IRawGame }> {

  constructor(props: any) {
    super(props);
    this.state = {
      game: initGame({handicap: 0, komi: 0, size: {x: 19, y: 19}}),
    };
  }

  render() {
    const {game} = this.state;
    return (
        <div>
          <CssBaseline/>
          <Router>
            <Route path={'/'} exact component={LandingPage}/>
            <Route path={'/local'} component={LocalGame}/>
          </Router>
        </div>
    );
  }
}

export default App;

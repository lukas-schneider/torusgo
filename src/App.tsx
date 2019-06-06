import React                            from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {CssBaseline}                    from '@material-ui/core';
import LocalGame                        from './components/LocalGame';
import LandingPage                      from './components/LandingPage';
import ServerGame                       from './components/ServerGame';

export default () => (
  <div>
    <CssBaseline/>
    <Router>
      <Route path={'/'} exact component={LandingPage}/>
      <Route path={'/local'} component={LocalGame}/>
      <Route path={'/game/:id'} component={ServerGame}/>
    </Router>
  </div>
);

import {CssBaseline}                    from '@material-ui/core';
import {ThemeProvider}                  from '@material-ui/styles';
import React                            from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import LandingPage                      from './components/LandingPage';
import LocalGame                        from './components/LocalGame';
import ServerGame                       from './components/ServerGame';
import globalTheme                      from './globalTheme';

export default () => (
  <ThemeProvider theme={globalTheme}>
    <CssBaseline/>
    <Router>
      <Route path={'/'} exact component={LandingPage}/>
      <Route path={'/local'} component={LocalGame}/>
      <Route path={'/game/:id'} component={ServerGame}/>
    </Router>
  </ThemeProvider>
);

import {CssBaseline, ThemeProvider}     from '@mui/material';
import React                            from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import LocalGame                        from './components/LocalGame';
import globalTheme                      from './globalTheme';

export default () => (
  <ThemeProvider theme={globalTheme}>
    <CssBaseline/>
    <Router>
      {/*<Route path={'/'} exact component={LandingPage}/>*/}
      <Route path={'/'} component={LocalGame}/>
      {/*<Route path={'/game/:id'} component={OnlineGame}/>*/}
    </Router>
  </ThemeProvider>
);

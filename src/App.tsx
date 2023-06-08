import {CssBaseline, ThemeProvider}     from '@mui/material';
import React                            from 'react';
import {RouteComponentProps}            from 'react-router';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import LocalGame                        from './components/LocalGame';
import globalTheme                      from './globalTheme';

export default () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');

  const theme = React.useMemo(
    () => globalTheme(mode),
    [mode],
  );
  const colorMode = React.useMemo(
    () => ({
      setDarkMode: (darkTheme: boolean) => {
        setMode(() => darkTheme ? 'dark' : 'light');
      },
    }),
    [setMode],
  );

  const LocalGameWithProps = (props: RouteComponentProps) => (
    <LocalGame setDarkMode={colorMode.setDarkMode} darkMode={mode === 'dark'} {...props}/>
  )

  return (

    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Router>
        {/*<Route path={'/'} exact component={LandingPage}/>*/}
        <Route path={'/'} component={LocalGameWithProps}/>
        {/*<Route path={'/game/:id'} component={OnlineGame}/>*/}
      </Router>
    </ThemeProvider>
  );
};

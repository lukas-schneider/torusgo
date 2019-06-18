import {createMuiTheme} from '@material-ui/core';

const globalTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#FF6F00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#BDBDBD',
      contrastText: '#000000',
    },
  },
});

export default globalTheme;
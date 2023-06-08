import {createTheme} from '@material-ui/core/styles';

const globalTheme = createTheme({
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
import {createTheme} from '@mui/material/styles';

const globalTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#FF6F00',
      contrastText: '#121212',
    },
    secondary: {
      main: '#BDBDBD',
      contrastText: '#121212',
    },
  },
});

export default globalTheme;
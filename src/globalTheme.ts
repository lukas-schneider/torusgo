import {createTheme} from '@mui/material/styles';

const globalTheme = createTheme({
  palette: {
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
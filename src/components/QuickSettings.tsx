import {
  Button,
  Divider,
  Paper,
  Typography,
  Box,
  IconButton,
  ButtonGroup,
  Grid,
}               from '@mui/material';
import {styled} from '@mui/material/styles';
import * as React                                               from 'react';
import {EColor}                                                 from '../shared/gameLogic';
import {EGamePhase, IGameState, IColorMap, IExtendedPlayerInfo} from '../shared/types';
import {enumValues}                                             from '../shared/utils';
import PlayerCard                                               from './PlayerCard';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const PREFIX = 'ScoreBoard';

const classes = {
  root: `${PREFIX}-root`,
  center: `${PREFIX}-center`,
};

const StyledPaper = styled(Paper)(({theme}) => ({
  [`&.${classes.root}`]: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },

  [`& .${classes.center}`]: {
    paddingTop: 5,
    paddingBottom: 5,
  },
}));

interface IProps {
  reset: () => void;
  setThree: (three: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  darkMode: boolean;
  three: boolean;
}
const QuickSettings: React.FC<IProps> = (props) => {
  const {setThree, three, setDarkMode, darkMode, reset} = props;

  return (
    <Grid container direction={'row'} className={classes.root}
          justify-content={'center'}
          alignItems={'space-between'}>
      <Grid item>
        <ButtonGroup variant="contained">
          <Button disabled={three}  onClick={() => setThree(true)}>3D</Button>
          <Button disabled={!three} onClick={() => setThree(false)}>2D</Button>
        </ButtonGroup>
        <Button  onClick={() => reset()}>Reset</Button>
      </Grid>
    </Grid>

  );
};

export default QuickSettings;
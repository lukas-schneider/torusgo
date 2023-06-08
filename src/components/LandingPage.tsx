import {Paper, Typography, Link} from '@mui/material';
import {styled}                  from '@mui/material/styles';
import * as React                from 'react';
import {Link as RouterLink}      from 'react-router-dom';
import MainLayout                from './MainLayout';

const PREFIX = 'LandingPage';

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledMainLayout = styled(MainLayout)(({theme}) => ({
  [`& .${classes.paper}`]: {
    padding: theme.spacing(3, 2),
  },
}));

const LandingPage: React.FC = ({}) => {
  return (
    <StyledMainLayout>
      <Paper className={classes.paper}>
        <Typography variant={'h4'}>
          Torus Go
        </Typography>
        <hr/>
        <Typography variant={'body1'}>
          Click <Link component={RouterLink} to={'/local'}>here</Link> to play a local game
        </Typography>
        <Typography variant={'body1'}>
          Click <Link component={RouterLink} to={'/game/asdf'}>here</Link> to play an online game
        </Typography>
      </Paper>
    </StyledMainLayout>
  );
};

export default (LandingPage);
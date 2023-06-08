import {Typography} from '@mui/material';
import {styled}     from '@mui/material/styles';
import * as React   from 'react';
import MainLayout   from './MainLayout';

const PREFIX = 'Disconnected';

const classes = {
  root: `${PREFIX}-root`,
};

const StyledMainLayout = styled(MainLayout)({
  [`& .${classes.root}`]: {},
});

const Disconnected: React.FC = ({}) => (
  <StyledMainLayout>
    <Typography variant={'h5'}>
      Connection Failed
    </Typography>
    <hr/>
    <Typography variant={'body1'}>
      A connection to the game server could not be established. Try reloading the page.
    </Typography>
  </StyledMainLayout>
);

export default (Disconnected);
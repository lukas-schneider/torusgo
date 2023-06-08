import {LinearProgress, Typography} from '@mui/material';
import {styled}                     from '@mui/material/styles';
import * as React                   from 'react';
import MainLayout                   from './MainLayout';

const PREFIX = 'Connecting';

const classes = {
  root: `${PREFIX}-root`,
};

const StyledMainLayout = styled(MainLayout)({
  [`& .${classes.root}`]: {},
});

const Connecting: React.FC = ({}) => (
  <StyledMainLayout>
    <Typography variant={'h5'} align={'center'}>
      Connecting to the Game Server...
    </Typography>
    <LinearProgress/>
  </StyledMainLayout>
);

export default (Connecting);
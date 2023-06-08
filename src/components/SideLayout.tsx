import {Grid}     from '@mui/material';
import {styled}   from '@mui/material/styles';
import * as React from 'react';

const PREFIX = 'SideLayout';

const classes = {
  root: `${PREFIX}-root`,
  item: `${PREFIX}-item`,
};

const StyledGrid = styled(Grid)(({theme}) => ({
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

  [`& .${classes.item}`]: {
    width: 380,
    zIndex: theme.zIndex.drawer,
  },
}));

interface IProps {
  children?: React.ReactNode;
}

const SideLayout: React.FC<IProps> = ({children}) => {
  return (
    <StyledGrid container
                spacing={2}
                className={classes.root}
                direction={'column'}
                justify-content={'flex-start'}
                alignItems={'flex-end'}>
      {React.Children.map(children, (child) =>
        <Grid item className={classes.item}>
          {child}
        </Grid>,
      )}
    </StyledGrid>
  );
};

export default (SideLayout);
import * as React                                         from 'react';
import {createStyles, Typography, withStyles, WithStyles} from '@material-ui/core';
import {IPlayer}                                          from '../types/utils';

const styles = () => createStyles({
  root: {
    position: 'relative',
    padding: 5,
  },
  name: {
    float: 'right',
    fontWeight: 'bold',
  },
  toMove: {
    float: 'right',
  },
});

interface IProps extends WithStyles<typeof styles> {
  player: IPlayer,
  color: 'white' | 'black',
}

const PlayerCard: React.FC<IProps> = ({player, color, classes}) => (
  <div className={classes.root}>
    {player.name && <Typography className={classes.name}>{player.name}</Typography>}
    <Typography variant={'body1'}>
      {color}
    </Typography>

    {player.isMoving &&
    <Typography variant={'caption'} color={'textSecondary'} className={classes.toMove}>
      &nbsp;to move
    </Typography>
    }

    <Typography variant={'body2'}>
      captured: {player.captured}
    </Typography>
  </div>
);

export default withStyles(styles)(PlayerCard);
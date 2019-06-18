import {createStyles, Typography, withStyles, WithStyles, Button} from '@material-ui/core';
import * as React                                                 from 'react';
import {EColor}                                                   from '../shared/gameLogic';
import {IExtendedPlayerInfo}                                      from '../shared/types';

function colorString(color: EColor) {
  switch (color) {
    case EColor.Black:
      return 'Black';
    case EColor.White:
      return 'White';

  }
}


const styles = () => createStyles({
  root: {
    position: 'relative',
    padding: 5,
  },
  name: {
    float: 'right',
    fontWeight: 'bold',
  },
  button: {
    float: 'right',
  },
  toMove: {
    float: 'right',
  },
});

interface IProps extends WithStyles<typeof styles> {
  player?: IExtendedPlayerInfo,
  color: EColor,
  onJoin?: (color: EColor) => void,
}


const PlayerCard: React.FC<IProps> = ({player, color, onJoin, classes}) => {
  if (player) {
    return (
      <div className={classes.root}>
        {player.name && <Typography className={classes.name}>{player.name}</Typography>}
        <Typography variant={'body1'}>
          {colorString(color)}
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
  } else {
    return (
      <div className={classes.root}>
        {onJoin &&
        <Button className={classes.button}
                onClick={() => onJoin(color)}
                variant={'contained'}
                color={'primary'}
                size={'small'}>
          Play as {colorString(color)}
        </Button>
        }
        <Typography variant={'body1'}>
          {colorString(color)}
        </Typography>

        <Typography variant={'caption'}>
          open
        </Typography>
      </div>
    );
  }
};

export default withStyles(styles)(PlayerCard);
import {Typography, Button}  from '@mui/material';
import {styled}              from '@mui/material/styles';
import * as React            from 'react';
import {EColor}              from '../shared/gameLogic';
import {IExtendedPlayerInfo} from '../shared/types';

const PREFIX = 'PlayerCard';

const classes = {
  root: `${PREFIX}-root`,
  name: `${PREFIX}-name`,
  button: `${PREFIX}-button`,
  toMove: `${PREFIX}-toMove`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {
    position: 'relative',
    padding: 5,
  },

  [`& .${classes.name}`]: {
    float: 'right',
    fontWeight: 'bold',
  },

  [`& .${classes.button}`]: {
    float: 'right',
  },

  [`& .${classes.toMove}`]: {
    float: 'right',
  },
}));

function colorString(color: EColor) {
  switch (color) {
    case EColor.Black:
      return 'Black';
    case EColor.White:
      return 'White';

  }
}


interface IProps {
  player?: IExtendedPlayerInfo,
  color: EColor,
  onJoin?: (color: EColor) => void,
}


const PlayerCard: React.FC<IProps> = ({player, color, onJoin}) => {
  if (player) {
    return (
      <Root className={classes.root}>
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
      </Root>
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

export default (PlayerCard);
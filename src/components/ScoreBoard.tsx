import {Button, Divider, Paper, Typography}                     from '@mui/material';
import {styled}                                                 from '@mui/material/styles';
import * as React                                               from 'react';
import {EColor}                                                 from '../shared/gameLogic';
import {EGamePhase, IGameState, IColorMap, IExtendedPlayerInfo} from '../shared/types';
import {enumValues}                                             from '../shared/utils';
import PlayerCard                                               from './PlayerCard';

const PREFIX = 'ScoreBoard';

const classes = {
  root: `${PREFIX}-root`,
  center: `${PREFIX}-center`,
};

const StyledPaper = styled(Paper)(({theme}) => ({
  [`&.${classes.root}`]: {
    padding: theme.spacing(1),
  },

  [`& .${classes.center}`]: {
    paddingTop: 5,
    paddingBottom: 5,
  },
}));

interface IProps {
  game: IGameState,
  role?: EColor,
  onOpenConfig?: () => void,
  onJoin?: (color: EColor) => void,
}

function statusString(phase: EGamePhase): string {
  switch (phase) {
    case EGamePhase.Canceled:
      return 'game has been cancelled';
    case EGamePhase.WhiteVictory:
      return 'white is victorious';
    case EGamePhase.BlackVictory:
      return 'black is victorious';
    case EGamePhase.Waiting:
      return 'waiting for a second player...';
    case EGamePhase.Running:
      return 'game in progress';

  }
}

const ScoreBoard: React.FC<IProps> = (props) => {
  const {game, onOpenConfig, onJoin, role} = props;

  const players: Partial<IColorMap<IExtendedPlayerInfo>> = {};

  for (let color of enumValues<EColor>(EColor)) {
    players[color] = game.players[color] && {
      name: game.players[color]!.name,
      captured: game.rawGame.captured[color],
      isMoving: game.rawGame.toMove === color,
      isClient: role === color,
    };
  }

  return (
    <StyledPaper square={true} className={classes.root}>
      <PlayerCard color={EColor.Black}
                  onJoin={onJoin}
                  player={players[EColor.Black]}/>
      <Divider component={'hr'}/>
      <Typography variant={'body2'} align={'center'} className={classes.center}>
        <i>{statusString(game.phase)}</i><br/>
        move {game.moveNumber + 1}
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.size.x}&times;{game.rawGame.ruleSet.size.y}
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.komi} komi
        &nbsp;&bull;&nbsp;{game.rawGame.ruleSet.handicap || 'no'} handicap
      </Typography>
      <Divider component={'hr'}/>
      <PlayerCard color={EColor.White}
                  onJoin={onJoin}
                  player={players[EColor.White]}/>
      {onOpenConfig &&
        <Button fullWidth
                color={'primary'}
                type={'button'}
                onClick={onOpenConfig}>
          Restart Game
        </Button>
      }
    </StyledPaper>
  );
};

export default (ScoreBoard);
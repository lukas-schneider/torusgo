import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  WithStyles,
  withStyles,
}                  from '@material-ui/core';
import * as React  from 'react';
import {Component} from 'react';
import {IRuleSet}  from '../shared/gameLogic';

const styles = () => createStyles({
  root: {},
  content: {},
  nameInput: {
    width: 'calc((100% - 2ch) / 2)',
    marginBottom: 8,
  },
  numberInput: {
    width: 'calc((100% - 4ch) / 4)',
  },
});

interface IProps extends WithStyles<typeof styles> {
  onClose: (ruleSet: IRuleSet, white: string, black: string) => void,
  onCancel: () => void,
  open: boolean,
  allowCancel: boolean,
}

interface IState {
  ruleSet: IRuleSet,
  black: string,
  white: string,
}

class ConfigDialog extends Component<IProps, IState> {
  constructor(props: Readonly<IProps>) {
    super(props);
    this.state = {
      ruleSet: {
        komi: 5.5,
        handicap: 0,
        size: {
          x: 19,
          y: 19,
        },
      },
      black: 'Player 1',
      white: 'Player 2',
    };
  }

  render() {
    const {white, black, ruleSet} = this.state;
    const {classes, onClose, onCancel, open, allowCancel} = this.props;
    return (
      <Dialog className={classes.root} open={open} disableEscapeKeyDown>
        <DialogTitle>Local Game</DialogTitle>
        <DialogContent className={classes.content}>
          <DialogContentText>
            Play against yourself (or another player) on this device.
          </DialogContentText>
          <TextField autoFocus
                     label={'black'}
                     name={'blackName'}
                     className={classes.nameInput}
                     defaultValue={black}
                     onChange={(event) => this.setState({black: event.target.value})}/>
          &nbsp;&nbsp;
          <TextField label={'white'}
                     name={'whiteName'}
                     className={classes.nameInput}
                     defaultValue={white}
                     onChange={(event) => this.setState({white: event.target.value})}/>
          <TextField type={'number'}
                     label={'board size X'}
                     className={classes.numberInput}
                     defaultValue={ruleSet.size.x}
                     onChange={(event) => this.setState({
                       ruleSet: {
                         ...this.state.ruleSet,
                         size: {
                           ...this.state.ruleSet.size,
                           x: parseInt(event.target.value),
                         },
                       },
                     })}/>
          &nbsp;&nbsp;
          <TextField type={'number'}
                     label={'board size Y'}
                     className={classes.numberInput}
                     defaultValue={ruleSet.size.y}
                     onChange={(event) => this.setState({
                       ruleSet: {
                         ...this.state.ruleSet,
                         size: {
                           ...this.state.ruleSet.size,
                           y: parseInt(event.target.value),
                         },
                       },
                     })}/>
          &nbsp;&nbsp;
          <TextField type={'number'}
                     label={'komi'}
                     className={classes.numberInput}
                     defaultValue={ruleSet.komi}
                     onChange={(event) => this.setState({
                       ruleSet: {
                         ...this.state.ruleSet,
                         komi: parseFloat(event.target.value),
                       },
                     })}/>
          &nbsp;&nbsp;
          <TextField type={'number'}
                     label={'handicap'}
                     className={classes.numberInput}
                     defaultValue={ruleSet.handicap}
                     onChange={(event) => this.setState({
                       ruleSet: {
                         ...this.state.ruleSet,
                         handicap: parseInt(event.target.value),
                       },
                     })}/>
        </DialogContent>
        <DialogActions>
          {allowCancel &&
          <Button color={'primary'}
                  type={'button'}
                  onClick={onCancel}>
            Cancel
          </Button>
          }
          <Button color={'primary'}
                  variant={'contained'}
                  type={'button'}
                  onClick={() => onClose(this.state.ruleSet, this.state.white, this.state.black)}>
            Start Game
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ConfigDialog);
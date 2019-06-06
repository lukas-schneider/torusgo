import React, {Component}    from 'react';
import {RouteComponentProps} from 'react-router';
import {Client, EStatus}     from '../utils/Client';
import {Typography}          from '@material-ui/core';
import {EColor, IRawGame}    from '../types/game';
import {IPlayer}             from '../../server/src/Connection';


interface IState {
  connectionStatus: EStatus,
  game?: IRawGame,
  players?: {
    [EColor.Black]: IPlayer,
    [EColor.White]: IPlayer,
  },
  moveNumber?: number,
}

export default class ServerGame extends Component<RouteComponentProps<{ id: string }>, IState> {

  private client: Client;

  constructor(props: Readonly<RouteComponentProps<{ id: string }>>) {
    super(props);
    this.state = {
      connectionStatus: EStatus.Disconnected,
    };
  }

  componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
  }

  componentDidUpdate(prevProps: Readonly<RouteComponentProps<{ id: string }>>) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.disconnect();
      this.connect();
    }
  }

  render() {
    const {connectionStatus} = this.state;
    const {match} = this.props;
    return (
      <Typography variant={'body1'}>
        Current id is {match.params.id}<br/>
        Status: {connectionStatus}
      </Typography>
    );
  }

  connect() {
    const namespace = this.props.match.params.id;

    this.client = new Client(namespace);

    this.client.onStatusChange((status) => {
      this.setState({
        connectionStatus: status,
      });
    });

    this.client.onEvent('update', (payload) => {
      this.setState({
        ...payload,
      });
    });
  }

  disconnect() {
    this.client.close();
  }
}
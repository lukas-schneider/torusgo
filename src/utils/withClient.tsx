import * as React   from 'react';
import Reconnecting from '../components/Connecting';
import Disconnected from '../components/Disconnected';
import {EStatus}    from '../shared/types';
import GameClient   from './GameClient';

interface IState {
  status: EStatus,
}

const withClient = (client: GameClient) =>
  <P extends {}>(Component: React.ComponentClass<P, any>) =>
    class Connection extends React.Component<P, IState> {
      constructor(props: P) {
        super(props);
        this.state = {
          status: client.status,
        };

        // doing this manually since @boundMethod doesn't work in non-top level classes
        this.handleStatusChange = this.handleStatusChange.bind(this);
      }

      componentDidMount() {
        this.setState({
          status: client.status,
        });

        client.on('status_change', this.handleStatusChange);
      }

      componentWillUnmount() {
        client.off('status_change', this.handleStatusChange);
      }

      render() {
        switch (this.state.status) {
          case EStatus.Connected:
            return <Component {...this.props}/>;
          case EStatus.Connecting:
            return <Reconnecting/>;
          case EStatus.Disconnected:
            return <Disconnected/>;
        }
      }

      handleStatusChange(status: EStatus) {
        this.setState({status});
      }
    };

export default withClient;
import * as React from 'react';
import {IError}   from '../shared/types';

const Error: React.FC<{ error: IError }> = ({error}) => (
  <>
    <h3>{error.name}</h3>
    <h5>{error.message}</h5>
    {error.payload && <code>Payload: {JSON.stringify(error.payload)}</code>}
  </>
);

export default Error;
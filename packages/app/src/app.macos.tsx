import * as React from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button } from '@rnts/button'; // '@rnts/button/src/button.native';

export class App extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return <Button label={"OK"} onPress={this.onPress}/>;
  }

  private onPress(_evt: GestureResponderEvent): void {
    // do something
  }
};

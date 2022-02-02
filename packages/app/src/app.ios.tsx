import * as React from 'react';
import { Button, IOSPressEvent } from '@rnts/button'; // '@rnts/button/src/button.ios';

export class App extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return <Button label={"OK"} color={"red"} onPress={this.onPress}/>;
  }

  private onPress(_evt: IOSPressEvent): void {
    // do something
  }
};

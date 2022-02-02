import * as React from 'react';
import { Button, WindowsClickEvent } from '@rnts/button'; // '@rnts/button/src/button.win';

export class App extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return <Button label={"OK"} onClick={this.onClick}/>;
  }

  private onClick(_evt: WindowsClickEvent): void {
    // do something
  }
};

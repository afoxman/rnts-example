import * as React from 'react';
import { Button as RNButton, GestureResponderEvent } from 'react-native'; // maps to `react-native` for Android and `react-native-macos` for MacOS

export interface IButtonProps {
  label: string;
  onPress: (evt: GestureResponderEvent) => void;
}

export class Button extends React.Component<IButtonProps> {
  constructor(props: IButtonProps) {
    super(props);
  }

  public render(): React.ReactNode {
    return <RNButton title={this.props.label} onPress={this.props.onPress}/>;
  }
}

export const buttonModuleExtension = "native";

import * as React from 'react';
import { View, Text, GestureResponderEvent } from 'react-native';

export interface WindowsClickEvent extends GestureResponderEvent {
  clickSource: "leftMouseButton" | "rightMouseButton" | "middleMouseButton" | "spaceBar" | "returnKey";
}

export interface IButtonProps {
  label: string;
  onClick: (evt: WindowsClickEvent) => void;
}

export class Button extends React.Component<IButtonProps> {
  constructor(props: IButtonProps) {
    super(props);
  }

  public render(): React.ReactNode {
    return <View>
      <Text onPress={this._onClick}>
        {this.props.label}
      </Text>
    </View>;
  }

  private _onClick(event: GestureResponderEvent): void {
    const clickSource = "leftMouseButton";
    this.props.onClick({ ...event, clickSource });
  }
}

export const buttonModuleExtension = "windows";

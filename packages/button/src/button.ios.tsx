import * as React from 'react';
import { View, Text, ColorValue, GestureResponderEvent } from 'react-native';

export interface IOSPressEvent extends GestureResponderEvent {
  isLongPress: boolean;
  pressure: "light" | "normal" | "heavy";
}

export interface IButtonProps {
  label: string;
  color: ColorValue;
  onPress: (evt: IOSPressEvent) => void;
}

export class Button extends React.Component<IButtonProps> {
  constructor(props: IButtonProps) {
    super(props);
  }

  public render(): React.ReactNode {
    return <View>
      <Text onPress={this._onPress} style={{ textDecorationColor: this.props.color}}>
        {this.props.label}
      </Text>
    </View>;
  }

  private _onPress(event: GestureResponderEvent): void {
    const isLongPress = false;
    const pressure = "normal";
    this.props.onPress({ ...event, isLongPress, pressure });
  }
}

export const buttonModuleExtension = "ios";

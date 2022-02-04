import * as React from 'react';
import { GestureResponderEvent } from 'react-native';
import { ViewWin32, TextWin32 } from '@office-iss/react-native-win32';

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
    return <ViewWin32>
      <TextWin32 onPress={this._onClick}>
        {this.props.label}
      </TextWin32>
    </ViewWin32>;
  }

  private _onClick(event: GestureResponderEvent): void {
    const clickSource = "leftMouseButton";
    this.props.onClick({ ...event, clickSource });
  }
}

export const buttonModuleExtension = "win32";

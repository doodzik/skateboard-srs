import React, { Component } from 'react';
import { CheckBox, Body, ListItem, Text } from 'native-base';

export default class CheckboxedItem extends React.Component {
  state = {
    checked: false
  }

  constructor(props) {
    super(props);
    const checked = this.props.checked || false
    this.state.checked = checked
  }

  toggleChecked() {
    const checked = !this.state.checked
    this.props.change(checked)
    this.setState({checked})
  }

  render() {
    return (<ListItem onPress={() => this.toggleChecked()}> 
      <CheckBox
        onPress={() => this.toggleChecked()}
        checked={this.state.checked}
        />
      <Body>
        <Text>{this.props.name}</Text>
      </Body>
    </ListItem>)
  }
}

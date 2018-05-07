import React, { Component } from 'react';
import _ from "lodash"

import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Left,
  Right,
  Icon,
  Title,
  Button,
} from 'native-base'

import CheckBox from '../components/checkbox';

export default class Selector extends Component {
  static navigationOptions = {
    header: null,
   }

  state = {
    valid: false,
    items: [],
    selected: new Set(),
    selectedInitialy: new Set(),
    title: '',
  }

  constructor(props) {
    super(props);
    const emptyFn = () => {}
    const params = this.props.navigation.state.params || {}
    const items = params.items || []
    const selected = params.selected || new Set()
    const onDone = params.onDone || emptyFn

    this.state.onDone = onDone
    this.state.selected = selected
    this.state.items = items
    this.state.selectedInitialy = new Set(selected)
    this.state.valid = this.state.selected.size > 0
  }

  toggleChecked(id) {
    let _self = this
    return checkboxState => {
      let set = _self.state.selected
      let selected = new Set(set)
      if (checkboxState) {
        selected.add(id)
      } else {
        selected.delete(id)
      }
      _self.setState({selected})
    }
  }

  valid(selected, initiallySelected) {
    return selected.size > 0 && !_.isEqual(selected, initiallySelected)
  }

  done() {
    this.state.onDone(this.state.selected)
    this.props.navigation.goBack()
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent
                    onPress={() => this.props.navigation.goBack()}>
              <Icon name='ios-arrow-back' />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.title}</Title>
          </Body>
          <Right>
            <Button transparent
                    disabled={!this.valid(this.state.selected, this.state.selectedInitialy)}
                    onPress={() => this.done()}>
              <Text>Done</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <List dataArray={this.state.items} renderRow={(item) =>
            <CheckBox name={item.name}
                      change={this.toggleChecked(item.id)}
                      checked={this.state.selected.has(item.id)}
              />
          } />
        </Content>
      </Container>
      )
  }
}

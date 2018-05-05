import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body } from 'native-base';
import moment from 'moment'

import { Trick } from '../src/db';

class StanceSelector extends Component {
  render() {
    return (
      <List>
        <ListItem>
          <CheckBox/>
          <Body>
            <Text>Normal</Text>
          </ Body>
        </ListItem>
        <ListItem>
          <CheckBox/>
          <Body>
            <Text>Nolli</Text>
          </ Body>
        </ListItem>
        <ListItem>
          <CheckBox/>
          <Body>
            <Text>Switch</Text>
          </ Body>
        </ListItem>
        <ListItem>
          <CheckBox/>
          <Body>
            <Text>Fakie</Text>
          </ Body>
        </ListItem>
      </List>)
  }
}

export default class TrickDetailComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {}
    title = params.trickName || "New Trick"

    return {
      title,
    }
  }

  state = {
    valid: false,
    name: '',
    stances: [{id: 1, name: 'normal'}, {id: 2, name: 'fakie'}, 
              {id: 3, name: 'switch'}, {id: 4, name: 'nollie'}],
    prefix_tags:  [{id: 1, name: '_'}],
    postfix_tags: [{id: 1, name: '_'}], 
    obstacles:    [{id: 1, name: '_'}],
  };

  constructor(props) {
    super(props);
    const params = this.props.navigation.state.params || {}
    const name = params.trickName || ''

    this.state.name = name
  }

  isNewTrick () {
    const params = this.props.navigation.state.params || {}
    const name = params.trickName || ''
    return name === ''
  }

  save() {
    // https://stackoverflow.com/questions/4205181/insert-into-a-mysql-table-or-update-if-exists
    return this.isNewTrick() ? this.create() : this.update()
  }

  create() {
    Trick.create(this.state, () => this.props.navigation.goBack())
  }

  delete() {
    const params = this.props.navigation.state.params || {}
    initName = params.trickName 
    Alert.alert(
      'Delete Trick',
      initName,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => Trick.delete(
          initName,
          () => this.props.navigation.goBack(),
        ) },
      ],
      { cancelable: false }
    )
  }

  update() {
    const params = this.props.navigation.state.params || {}
    initName = params.trickName || ''
    const { name } = this.state

    Trick.update(initName, this.state, () => this.props.navigation.goBack())
  }

  validate (state) {
    // TODO: at least one prefix & postfix & stance & obstacle
    var valid = true
    if (!this.isNewTrick()) {
      const params = this.props.navigation.state.params || {}
      const name = params.trickName
      valid = name != state.name
    }
    valid = valid && state.name.length > 0
    Trick.findByName(initName, (rows) => {
      valid = valid && rows.length < 1
      this.setState({valid})
    })
  }

  updateState(obj) {
    this.setState(obj, () => this.validate(this.state))
  }

  render() {
    return (
      <Container>
        <Content>
          <Form>
            <StanceSelector />
            <Button transparent>
              <Text>Pre Tags</Text>
            </Button>
            <Item floatingLabel>
              <Label>Trick Name</Label>
              <Input
                value={this.state.name}
                onChangeText={name => this.updateState({ name })}
                />
            </Item>
            <Button transparent>
              <Text>Post Tags</Text>
            </Button>
            <Button transparent>
              <Text>Obstacles</Text>
            </Button>
            <Button full 
              disabled={!this.state.valid}
              onPress={() => this.save()} >
              <Text>Save</Text>
            </Button>
            {(() => {
              if (!this.isNewTrick()) {
                return <Button full danger onPress={() => this.delete()} > <Text>delete</Text> </Button> 
              }
            })()}
          </Form>
        </Content>
      </Container>
    );
  }
}

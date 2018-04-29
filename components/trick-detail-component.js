import React, { Component } from 'react';
import { Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text } from 'native-base';

import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');

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
  };

  constructor(props) {
    super(props);
    const params = this.props.navigation.state.params || {}
    name = params.trickName || ''

    this.state.name = name
  }

  isNewTrick () {
    const params = this.props.navigation.state.params || {}
    name = params.trickName || ''
    return name === ''
  }

  save() {
    return this.isNewTrick() ? this.create() : this.update()
  }

  create() {
    const { name } = this.state
    db.transaction(
      tx => {
        tx.executeSql('insert into tricks (name) values (?)', [name]);
        tx.executeSql('select * from tricks', [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      console.log,
      () => this.props.navigation.goBack(),
    );
  }

  update() {
    const params = this.props.navigation.state.params || {}
    initName = params.trickName || ''
    const { name } = this.state

    db.transaction(
      tx => {
        tx.executeSql('UPDATE tricks SET name = ? WHERE name = ?' [name, initName])
        tx.executeSql('select * from tricks', [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      console.log,
      () => this.props.navigation.goBack(),
    );
  }

  validate (state) {
    var valid = true
    if (!this.isNewTrick()) {
      const params = this.props.navigation.state.params || {}
      const name = params.trickName
      valid = name != state.name
    }
    valid = valid && state.name.length > 0
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM tricks WHERE name=? LIMIT 1', [state.name], (_, { rows }) => {
        valid = valid && rows.length < 1
        this.setState({valid})
      })
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
            <Item floatingLabel>
              <Label>Trick Name</Label>
              <Input
                value={this.state.name}
                onChangeText={name => this.updateState({ name })}
                />
            </Item>
            <Button full 
              disabled={!this.state.valid}
              onPress={() => this.save()} >
              <Text>Save</Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

import { Obstacle } from '../src/db';

import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body, Left, Right, Title } from 'native-base';
import moment from 'moment'

import { StackNavigator } from 'react-navigation'

function screenCreator(dbInstance) {
  class Screen extends Component {
    static navigationOptions = {
      header: null,
    };

    state = {
      items: null,
    };

    constructor(props) {
      super(props);

      this.props.navigation.addListener(
        'willFocus',
        payload => {
          if (payload.action.type == "Navigation/BACK") {
            this.update()
          }
        }
      );
    }

    componentDidMount() {
      this.update();
    }

    update() {
      dbInstance.all().then(items => this.setState({ items }))
    }

    render() {
      const { items } = this.state;
      if (items === null || items.length === 0) {
        return null
      }

      return (
        <Container>
          <Header>
            <Left/>
            <Body>
              <Title>{dbInstance.pname}</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.props.navigation.navigate(dbInstance.name+ 'Detail', {} )}>
                <Icon name='add' />
              </Button>
            </Right>
          </Header>
          <Content>
            <List dataArray={items}
              renderRow={(data) =>
                <ListItem onPress={() => this.props.navigation.navigate(dbInstance.name+ 'Detail', { name: data.name } )}>
                  <Text>{data.name}</Text>
                </ListItem>
              }
              >
            </List>
          </Content>
        </Container>
      );
    }
  }

  class Detail extends Component {
    static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {}
      title = params.name || "New " + dbInstance.name

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
      const name = params.name || ''

      this.state.name = name
    }

    // TODO to get method
    isNew () {
      const params = this.props.navigation.state.params || {}
      const name = params.name || ''
      return name === ''
    }

    save() {
      return this.isNew() ? this.create() : this.update()
    }

    create() {
      return dbInstance.create(this.state.name).then(() => this.props.navigation.goBack())
    }

    delete() {
      const params = this.props.navigation.state.params || {}
      const initName = params.name
      Alert.alert(
        'Delete ' + dbInstance.name,
        initName,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Delete', onPress: () => dbInstance.delete(initName).then(() => this.props.navigation.goBack())},
        ],
        { cancelable: false }
      )
    }

    update() {
      const params = this.props.navigation.state.params || {}
      const initName = params.name || ''
      const { name } = this.state

      dbInstance.update(initName, this.state.name).then(() => this.props.navigation.goBack())
    }

    validate (state) {
      var valid = true
      if (!this.isNew()) {
        const params = this.props.navigation.state.params || {}
        const name = params.name
        valid = name != state.name
      }
      valid = valid && state.name.length > 0

      dbInstance.findByName(state.name).then((rows) => {
        valid = valid && rows.length < 1
        this.setState({valid})
      })
    }

    updateState(obj) {
      this.setState(obj, () => this.validate(this.state))
    }

    render() {
      const params = this.props.navigation.state.params || {}
      const name = params.name
      const isProtectedTag = !this.isNew() && name === '<empty>'

      return (
        <Container>
          <Content>
            <Form>
              <Item floatingLabel>
                <Label>{dbInstance.name} Name</Label>
                <Input
                   value={this.state.name}
                  onChangeText={name => this.updateState({ name })}
                  />
              </Item>
              {(() => {
                if (isProtectedTag) {
                  const message = 'You cannot remove the <empty> ' + dbInstance.name
                  return <Body><Text>{message}</Text></Body>
                } else {
                  return <Button full disabled={!this.state.valid} onPress={() => this.save()} > <Text>Save</Text></Button>
                }
              })()}
              {(() => {
                if (isProtectedTag) {
                  return
                }
                if (!this.isNew()) {
                  return <Button full danger onPress={() => this.delete()} > <Text>delete</Text> </Button>
                }
              })()}
            </Form>
          </Content>
        </Container>
      );
    }
  }

  var obj = {}
  obj[dbInstance.name + 'Screen'] = { screen: Screen }
  obj[dbInstance.name + 'Detail'] = { screen: Detail }
  return StackNavigator(obj)
}

export default screenCreator(Obstacle)

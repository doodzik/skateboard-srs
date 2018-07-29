import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Tab, Tabs, Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body, Left, Right, Title } from 'native-base';
import moment from 'moment'

import { PostTag, PreTag } from '../src/db';

import { StackNavigator } from 'react-navigation'

function screenCreator(dbInstance, dbInstance1) {
  class Screen extends Component {
    static navigationOptions = {
      header: null,
    };

    state = {
      items: null,
      items1: null,
      currentDBInstanceName: dbInstance.name,
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
      Promise.all([dbInstance.all(), dbInstance1.all()])
        .then(instances => {
          const [items, items1] = instances
          this.setState({ items, items1 })
        })
    }

    changeTab (i) {
      console.log(i)
      if (i === 0) {
        this.setState({ currentDBInstanceName: dbInstance.name })
      } else {
        this.setState({ currentDBInstanceName: dbInstance1.name })
      }
    }

    render() {
      const { items, items1 } = this.state;
      if (items === null || items.length === 0) {
        return null
      }
      if (items1 === null || items1.length === 0) {
        return null
      }

      return (
        <Container>
          <Header>
            <Left/>
            <Body>
              <Title>Tags</Title>
            </Body>
            <Right>
              <Button transparent onPress={() => this.props.navigation.navigate(this.state.currentDBInstanceName+ 'Detail', {} )}>
                <Icon name='add' />
              </Button>
            </Right>
          </Header>
          <Tabs initialPage={0} onChangeTab={({i}) => { this.changeTab(i) }}>
            <Tab heading="Pre">
              <List dataArray={items}
                renderRow={(data) =>
                  <ListItem onPress={() => this.props.navigation.navigate(dbInstance.name+ 'Detail', { name: data.name } )}>
                    <Text>{data.name}</Text>
                  </ListItem>
                }
                >
              </List>
            </Tab>
            <Tab heading="Post">
              <List dataArray={items1}
                renderRow={(data) =>
                  <ListItem onPress={() => this.props.navigation.navigate(dbInstance1.name+ 'Detail', { name: data.name } )}>
                    <Text>{data.name}</Text>
                  </ListItem>
                }
                >
              </List>
            </Tab>
          </Tabs>
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
                  return <Button full style={{marginTop: 5}} disabled={!this.state.valid} onPress={() => this.save()} > <Text>Save</Text></Button>
                }
              })()}
              {(() => {
                if (isProtectedTag) {
                  return
                }
                if (!this.isNew()) {
                  return <Button full danger style={{marginTop: 5}} onPress={() => this.delete()} > <Text>Delete</Text> </Button>
                }
              })()}
            </Form>
          </Content>
        </Container>
      );
    }
  }

  class Detail1 extends Component {
    static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {}
      title = params.name || "New " + dbInstance1.name

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
      return dbInstance1.create(this.state.name).then(() => this.props.navigation.goBack())
    }

    delete() {
      const params = this.props.navigation.state.params || {}
      const initName = params.name
      Alert.alert(
        'Delete ' + dbInstance1.name,
        initName,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Delete', onPress: () => dbInstance1.delete(initName).then(() => this.props.navigation.goBack())},
        ],
        { cancelable: false }
      )
    }

    update() {
      const params = this.props.navigation.state.params || {}
      const initName = params.name || ''
      const { name } = this.state

      dbInstance1.update(initName, this.state.name).then(() => this.props.navigation.goBack())
    }

    validate (state) {
      var valid = true
      if (!this.isNew()) {
        const params = this.props.navigation.state.params || {}
        const name = params.name
        valid = name != state.name
      }
      valid = valid && state.name.length > 0

      dbInstance1.findByName(state.name).then((rows) => {
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
                <Label>{dbInstance1.name} Name</Label>
                <Input
                  value={this.state.name}
                  onChangeText={name => this.updateState({ name })}
                  />
              </Item>
              {(() => {
                if (isProtectedTag) {
                  const message = 'You cannot remove the <empty> ' + dbInstance1.name
                  return <Body><Text>{message}</Text></Body>
                } else {
                  return <Button full disabled={!this.state.valid} style={{marginTop: 5}} onPress={() => this.save()} > <Text>Save</Text></Button>
                }
              })()}
              {(() => {
                if (isProtectedTag) {
                  return
                }
                if (!this.isNew()) {
                  return <Button full danger style={{marginTop: 5}} onPress={() => this.delete()} > <Text>Delete</Text> </Button>
                }
              })()}
            </Form>
          </Content>
        </Container>
      );
    }
  }


  var obj = {}
  obj['TagsScreen'] = { screen: Screen }
  obj[dbInstance.name + 'Detail'] = { screen: Detail }
  obj[dbInstance1.name + 'Detail'] = { screen: Detail1 }
  return StackNavigator(obj)
}

export default screenCreator(PreTag, PostTag)


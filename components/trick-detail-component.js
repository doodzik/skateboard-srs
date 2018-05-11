import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body } from 'native-base';
import moment from 'moment'

import { Trick, Tag, Obstacle, Stance } from '../src/db';

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
    stances: new Set([1, 2, 3, 4]),
    preTags: new Set([1]),
    postTags: new Set([1]), 
    obstacles: new Set([1]),
    depTags: [],
    depObst: [],
    depStance: [],
  };

  constructor(props) {
    super(props);
    const params = this.props.navigation.state.params || {}
    const name = params.trickName || ''

    this.state.name = name

    this.props.navigation.addListener(
      'willFocus',
      payload => {
        if (payload.action.type == "Navigation/BACK") {
          this.updateDependencyData()
        }
      }
    );
    this.updateDependencyData()
  }

  updateDependencyData() {
    Promise.all([Tag.all(), Obstacle.all(), Stance.all()]).then(vals => {
      const [depTags, depObst, depStance] = vals
      this.setState({depTags, depObst, depStance})
    })
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
    const initName = params.trickName 
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
    const initName = params.trickName || ''
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

    Trick.findByName(state.name, (rows) => {
      valid = valid && rows.length < 1
      this.setState({valid})
    })
  }

  updateState(obj) {
    this.setState(obj, () => this.validate(this.state))
  }

  stances(ids) {
    const stances = this.state.depStance
    if (typeof ids === 'undefined') {
      return stances
    } else {
      return stances.filter(stance => ids.has(stance.id))
    }
  }

  preTags(ids) {
    const preTags = this.state.depTags
    if (typeof ids === 'undefined') {
      return preTags
    } else {
      return preTags.filter(preTag => ids.has(preTag.id))
    }
  }

  postTags(ids) {
    const postTags = this.state.depTags
    if (typeof ids === 'undefined') {
      return postTags
    } else {
      return postTags.filter(postTag => ids.has(postTag.id))
    }
  }

  obstacles(ids) {
    const obstacles = this.state.depObst
    if (typeof ids === 'undefined') {
      return obstacles
    } else {
      return obstacles.filter(obstacle => ids.has(obstacle.id))
    }
  }

  render() {
    const stancesSelector = {
      items: this.stances(),
      selected: this.state.stances,
      onDone: (stances) => this.setState({stances}),
      title: 'Stances',
    }

    const preTagsSelector = {
      items: this.preTags(),
      selected: this.state.preTags,
      onDone: (preTags) => this.setState({preTags}),
      title: 'Pre Tags',
    }

    const postTagsSelector = {
      items: this.postTags(),
      selected: this.state.postTags,
      onDone: (postTags) => this.setState({postTags}),
      title: 'Post Tags',
    }

    const obstaclesSelector = {
      items: this.obstacles(),
      selected: this.state.obstacles,
      onDone: (obstacles) => this.setState({obstacles}),
      title: 'Obstacles',
    }

    return (
      <Container>
        <Content>
          <Form>
            <Button transparent 
              onPress={() => this.props.navigation.navigate('Selector', stancesSelector )}>
              <Text>Stance</Text>
            </Button>
            <Text>{this.stances(this.state.stances).map(stance => stance.name).join(', ')}</Text>
            <Button transparent 
              onPress={() => this.props.navigation.navigate('Selector', preTagsSelector )}>
              <Text>Pre Tags</Text>
            </Button>
            <Text>{this.preTags(this.state.preTags).map(x => x.name).join(', ')}</Text>
            <Item floatingLabel>
              <Label>Trick Name</Label>
              <Input
                value={this.state.name}
                onChangeText={name => this.updateState({ name })}
                />
            </Item>
            <Button transparent 
              onPress={() => this.props.navigation.navigate('Selector', postTagsSelector )}>
              <Text>Post Tags</Text>
            </Button>
            <Text>{this.postTags(this.state.postTags).map(x => x.name).join(', ')}</Text>
            <Button transparent 
              onPress={() => this.props.navigation.navigate('Selector', obstaclesSelector )}>
              <Text>Obstacles</Text>
            </Button>
            <Text>{this.obstacles(this.state.obstacles).map(x => x.name).join(', ')}</Text>
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
            <Item floatingLabel>
              <Label>Generated Tricks</Label>
            </Item >
          </Form>
        </Content>
      </Container>
    );
  }
}

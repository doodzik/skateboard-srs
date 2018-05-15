import React, { Component } from 'react';
import { Alert } from 'react-native';
import { Separator, Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body } from 'native-base';
import moment from 'moment'
import _ from 'lodash'

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
    initialLoad: true,
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
          this.updateState({})
        }
      }
    );
    this.updateDependencyData()
  }

  updateDependencyData() {
    const myFirstPromise = new Promise((resolve, reject) => {
      if (!this.isNewTrick() && this.state.initialLoad) {
        const params = this.props.navigation.state.params || {}
        const name = params.trickName || ''
        Trick.findByName(name).then(rows => {
          resolve({
            stances: rows.reduce((set, value) => { return set.add(value.stance_id) }, new Set()),
            preTags: rows.reduce((set, value) => { return set.add(value.prefix_tag_id) }, new Set()),
            postTags: rows.reduce((set, value) => { return set.add(value.postfix_tag_id) }, new Set()),
            obstacles: rows.reduce((set, value) => { return set.add(value.obstacle_id) }, new Set()),
            initialLoad: false,
          })
        })
      } else {
        resolve({})
      }
    })
    Promise.all([Tag.all(), Obstacle.all(), Stance.all(), myFirstPromise]).then(vals => {
      const [depTags, depObst, depStance, defaults] = vals
      this.setState(Object.assign({depTags, depObst, depStance}, defaults))
    })
  }

  isNewTrick () {
    const params = this.props.navigation.state.params || {}
    const name = params.trickName || ''
    return name === ''
  }

  save() {
    const prefix_tags = this.state.depTags.filter(t => this.state.preTags.has(t.id))
    const postfix_tags = this.state.depTags.filter(t => this.state.postTags.has(t.id))
    const obstacles = this.state.depObst.filter(t => this.state.obstacles.has(t.id))
    const stances = this.state.depStance.filter(t => this.state.stances.has(t.id))
    const name = this.state.name

    const data = { prefix_tags, postfix_tags, obstacles, stances, name }
    // https://stackoverflow.com/questions/4205181/insert-into-a-mysql-table-or-update-if-exists
    return this.isNewTrick() ? this.create(data) : this.update(data)
  }

  create(data) {
    Trick.create(data).then(() => this.props.navigation.goBack())
  }

  delete() {
    const params = this.props.navigation.state.params || {}
    const initName = params.trickName 
    Alert.alert(
      'Delete Trick',
      initName,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => Trick.delete(initName).then(() => this.props.navigation.goBack()) },
      ],
      { cancelable: false }
    )
  }

  update(data) {
    const params = this.props.navigation.state.params || {}
    const initName = params.trickName || ''

    Trick.update(initName, data).then(() => this.props.navigation.goBack())
  }

  validate (state) {
    var validName = true
    var validConfig = false
    Trick.findByName(state.name).then((rows) => {
      validName = validName && state.name.length > 0
      validName = validName && rows.length < 1

      if (!this.isNewTrick()) {
        const params = this.props.navigation.state.params || {}
        const name = params.trickName
        validName = validName && name != state.name


        const stances = rows.reduce((set, value) => { return set.add(value.stance_id) }, new Set())
        const preTags = rows.reduce((set, value) => { return set.add(value.prefix_tag_id) }, new Set())
        const postTags = rows.reduce((set, value) => { return set.add(value.postfix_tag_id) }, new Set())
        const obstacles = rows.reduce((set, value) => { return set.add(value.obstacle_id) }, new Set())

        validConfig = !_.isEqual(this.state.stances, stances)
                || !_.isEqual(this.state.preTags, preTags)
                || !_.isEqual(this.state.postTags, postTags)
                || !_.isEqual(this.state.obstacles, obstacles)
      }
      valid = validName || validConfig
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

  generateTrickNames() {
    const prefix_tags = this.state.depTags.filter(t => this.state.preTags.has(t.id))
    const postfix_tags = this.state.depTags.filter(t => this.state.postTags.has(t.id))
    const obstacles = this.state.depObst.filter(t => this.state.obstacles.has(t.id))
    const stances = this.state.depStance.filter(t => this.state.stances.has(t.id))
    const name = this.state.name

    return Trick.generateTricksName({ name, stances, prefix_tags, postfix_tags, obstacles }).map(e => e.join(' ').trim().replace(/\s{2,}/g, ' '))
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

    var generatedTricks;
    generatedTricks = [<ListItem><Text>Generated Tricks</Text></ListItem>]
    if (this.state.name.length === 0) {
      generatedTricks = [<ListItem key={0}><Text>Enter a trick name to see all generated tricks</Text></ListItem>]
    } else {
      generatedTricks = this.generateTrickNames().map((name, i) => <ListItem key={i}><Text>{name}</Text></ListItem>)
    }

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
          </Form>
          <List>
            <Separator><Text>Stance</Text></Separator>
            <ListItem onPress={() => this.props.navigation.navigate('Selector', stancesSelector )} >
              <Text>{this.stances(this.state.stances).map(stance => stance.name).join(', ')}</Text>
            </ListItem>

            <Separator><Text>Pre Tags</Text></Separator>
            <ListItem onPress={() => this.props.navigation.navigate('Selector', preTagsSelector )}>
              <Text>{this.preTags(this.state.preTags).map(x => x.name).join(', ')}</Text>
            </ListItem>

            <Separator><Text>Post Tags</Text></Separator>
            <ListItem onPress={() => this.props.navigation.navigate('Selector', postTagsSelector )}>
              <Text>{this.postTags(this.state.postTags).map(x => x.name).join(', ')}</Text>
            </ListItem>

            <Separator><Text>Obstacles</Text></Separator>
            <ListItem onPress={() => this.props.navigation.navigate('Selector', obstaclesSelector )}>
              <Text>{this.obstacles(this.state.obstacles).map(x => x.name).join(', ')}</Text>
            </ListItem>

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
              <Separator><Text>Generated Tricks</Text></Separator>
              {generatedTricks}
            </List>
        </Content>
      </Container>
    );
  }
}

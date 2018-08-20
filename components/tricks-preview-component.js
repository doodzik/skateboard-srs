import React, { Component } from 'react'
import { Alert } from 'react-native'
import { Separator, Button, Icon, Container, Header, Content, Form, Item, Input, Label, Text, List, ListItem, CheckBox, Body } from 'native-base'
import moment from 'moment'
import _ from 'lodash'

import { Trick, PostTag, PreTag, Obstacle, Stance } from '../src/db'

export default class TrickDetailComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {}
    title = "Preview for " + params.name

    return {
      title,
    }
  }

  generateTrickNames() {
    const params = this.props.navigation.state.params
    const prefix_tags  = params.prefix_tags
    const postfix_tags = params.postfix_tags
    const obstacles    = params.obstacles
    const stances      = params.stances
    const name         = params.name

    return Trick.generateTricksName({ name, stances, prefix_tags, postfix_tags, obstacles }).map(e => e.join(' ').trim().replace(/\s{2,}/g, ' '))
  }

  render() {
    var generatedTricks = this.generateTrickNames().map((name, i) => <ListItem key={i}><Text>{name}</Text></ListItem>)

    return (
      <Container>
        <Content>
          <List>{generatedTricks}</List>
        </Content>
      </Container>
    );
  }
}


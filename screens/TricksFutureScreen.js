import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ListView,
} from 'react-native';

import moment from 'moment'
import { Separator, Container, Header, Content, Button, Body, Left, Right, Title, Icon, List, ListItem, Text } from 'native-base';

import { Trick } from '../src/db';
import CheckBoxListItem from '../components/checkbox';

export default class InboxScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Future Tricks',
    }
  }

  state = {
    items: null,
    checked: new Set(),
  };

  constructor(props) {
    super(props);

    this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.update()
      }
    );
  }

  componentDidMount() {
    this.update();
  }

  update() {
    Trick.allFuture().then(items => this.setState({ items }))
  }

  toggleChecked(id) {
    let _self = this
    return checkboxState => {
      let set = _self.state.checked
      let checked = new Set(set)
      if (checkboxState) {
        checked.add(id)
      } else {
        checked.delete(id)
      }
      _self.setState({checked})
    }
  }

  populateSelectedItems() {
    let checked = this.state.checked
    return this.state.items.filter(item => checked.has(item.id))
  }

  now() {
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      obj.trigger_date = moment().format("YYYY-MM-DD")
      Trick.trigger(obj).then(() => this.update()).catch(console.log)
    })
  }

  activeActions() {
    return this.state.checked.size > 0
  }

  render() {
    const { items } = this.state;
    let {height} = Dimensions.get('window');
    height = height * 0.8 

    if (items !== null) {
      var arr = []
      var lastdate = ''
      var key = 0
      for (var i = 0; i < items.length; i++) { 
        let item = items[i]
        arr.push
        if (item.trigger_date !== lastdate) {
          lastdate = item.trigger_date 
          arr.push(<Separator key={key} ><Text>{item.trigger_date}</Text></Separator>)
          key++
        }
        // TODO generate proper trick name
        arr.push(<CheckBoxListItem key={key} name={item.name} change={this.toggleChecked(item.id)}/>)
        key++
      }
    }
    
    return (
      <Container>
        <Header>
          <Left/>
          <Body>
            <Title>Future Tricks</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.now()} disabled={!this.activeActions()}>
              <Text>Now</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          {(() => {
            if (items === null || items.length === 0) {
              return (<View style={{ flex: 1, height, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No Tricks to do in the Future!</Text>
              </View>)
            } else {
              return <List> {arr} </List>
            }
          })()}
        </Content>
      </Container>
    );
  }
}



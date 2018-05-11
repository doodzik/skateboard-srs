import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ListView,
} from 'react-native';

import moment from 'moment'
import { ActionSheet, Container, Header, Content, Button, Body, Left, Right, Title, Icon, List, ListItem, Text } from 'native-base';

import { Trick } from '../src/db';
import CheckBoxListItem from '../components/checkbox';

export default class InboxScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'SRS',
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

  check(secId, rowId, rowMap) {
    deleteRow(secId, rowId, rowMap)
  }

  dissmiss(secId, rowId, rowMap) {
    deleteRow(secId, rowId, rowMap)
  }

  deleteRow(secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const newData = [...this.state.listViewData];
    newData.splice(rowId, 1);
    this.setState({ listViewData: newData });
  }

  update() {
    Trick.allTriggered().then(items => this.setState({ items }))
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

  activeSheet() {
    var BUTTONS = []
    if (Platform.OS === 'ios') {
      var BUTTONS = ["1 Week", "2 Weeks", "1 Month", "Cancel"];
    } else {
      var BUTTONS = [
        { text: "1 Week", icon: "american-football", },
        { text: "2 Weeks", icon: "analytics" },
        { text: "1 Month", icon: "aperture", },
        { text: "Cancel", icon: "close", }
      ];
    }
    var CANCEL_INDEX = 3;
    ActionSheet.show({
      options: BUTTONS,
      cancelButtonIndex: CANCEL_INDEX,
      title: "Postpone Trick"
    },
      buttonIndex => {
        if (buttonIndex === 3) {
          return
        }
        var days = 7
        days = (buttonIndex === 1) ? 14 : days
        days = (buttonIndex === 2) ? 30 : days
        this.skip(days)
      })
  }

  skip(paramDays) {
    const daysToSkip = paramDays || 14
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      obj.trigger_interval = obj.trigger_interval / 2
      if (obj.trigger_interval < 1) {
        obj.trigger_interval = 1
      }
      obj.trigger_date = moment().day(daysToSkip).format("YYYY-MM-DD")
      Trick.trigger(obj).then(() => this.update()).catch(console.log)
    })
  }

  hard() {
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      obj.trigger_interval = obj.trigger_interval * 2
      obj.trigger_date = moment().day(obj.trigger_interval).format("YYYY-MM-DD")
      Trick.trigger(obj).then(() => this.update()).catch(console.log)
    })
  }

  good() {
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      let days = obj.trigger_interval * 4
      obj.trigger_interval = days
      obj.trigger_date = moment().day(days).format("YYYY-MM-DD")
      Trick.trigger(obj).then(() => this.update()).catch(console.log)
    })
  }

  activeActions() {
    return this.state.checked.size > 0
  }

  render() {
    const { items } = this.state;
    if (items === null || items.length === 0) {
      return null
    }

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.activeSheet()} disabled={!this.activeActions()}>
              <Text>Skip</Text>
            </Button>
          </Left>
          <Body>
            <Button transparent onPress={() => this.hard()} disabled={!this.activeActions()}>
              <Text>Hard</Text>
            </Button>
          </Body>
          <Right>
            <Button transparent onPress={() => this.good()} disabled={!this.activeActions()}>
              <Text>Good</Text>
            </Button>
          </Right>
        </Header>
        <Content>
          <List dataArray={items}
            renderRow={(item) => <CheckBoxListItem name={item.name} change={this.toggleChecked(item.id)}/>}
            />
        </Content>
      </Container>
    );
  }
}


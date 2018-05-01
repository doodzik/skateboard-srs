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
import { CheckBox, Container, Header, Content, Button, Body, Left, Right, Title, Icon, List, ListItem, Text } from 'native-base';

import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');

class CheckboxedItem extends React.Component {
  state = {
    checked: false
  }

  toggleChecked() {
    const checked = !this.state.checked
    this.props.change(checked)
    this.setState({checked})
  }

  render() {
    return (<ListItem onPress={() => this.toggleChecked()}>
      <CheckBox
        onPress={() => this.toggleChecked()}
        checked={this.state.checked}
        />
      <Body>
        <Text>{this.props.name}</Text>
      </Body>
    </ListItem>)
  }
}

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
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM tricks WHERE trigger_date <= ?;`, [moment().format("YYYY-MM-DD")],
        (_, { rows: { _array } }) => {
          this.setState({ items: _array })
        });
    });
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

  updateTrick(obj) {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql('UPDATE tricks SET trigger_date=?, trigger_interval=? WHERE id=?', [obj.trigger_date, obj.trigger_interval, obj.id])
          tx.executeSql('select * from tricks', [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        },
        reject,
        resolve,
      );
    })
  }

  populateSelectedItems() {
    let checked = this.state.checked
    return this.state.items.filter(item => checked.has(item.id))
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
      this.updateTrick(obj).then(() => this.update()).catch(console.log)
    })
  }

  hard() {
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      obj.trigger_interval = obj.trigger_interval * 2
      obj.trigger_date = moment().day(obj.trigger_interval).format("YYYY-MM-DD")
      this.updateTrick(obj).then(() => this.update()).catch(console.log)
    })
  }

  good() {
    this.populateSelectedItems().map(item => {
      let obj = Object.assign(item, {})
      let days = obj.trigger_interval * 4
      obj.trigger_interval = days
      obj.trigger_date = moment().day(days).format("YYYY-MM-DD")
      this.updateTrick(obj).then(() => this.update()).catch(console.log)
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
            <Button transparent onPress={() => this.skip()} disabled={!this.activeActions()}>
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
            renderRow={(item) => <CheckboxedItem name={item.name} change={this.toggleChecked(item.id)}/>}
            />
        </Content>
      </Container>
    );
  }
}


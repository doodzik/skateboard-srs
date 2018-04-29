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
        `SELECT * FROM tricks;`, [],
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

  render() {
    const { items } = this.state;
    if (items === null || items.length === 0) {
      return null
    }

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Text>Skip</Text>
            </Button>
          </Left>
          <Body>
            <Button transparent>
              <Text>Hard</Text>
            </Button>
          </Body>
          <Right>
            <Button transparent>
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


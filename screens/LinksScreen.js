import React, { Component } from 'react';

import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Text,
  Body,
  Left,
  Right,
  Icon,
  Title,
  Button,
} from 'native-base';

import {
  View,
} from 'react-native'

import { StackNavigator } from 'react-navigation'
import TrickDetail  from '../components/trick-detail-component'

import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');

class TrickScreen extends Component {
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
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists tricks (id integer primary key not null, name text);'
      );
    });
    this.update();
  }

  update() {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM tricks GROUP BY name;`, [],
        (_, { rows: { _array } }) => {
          this.setState({ items: _array })
        });
    });
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
            <Title>Tricks</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => this.props.navigation.navigate('TrickDetail', {} )}>
              <Icon name='add' />
            </Button>
          </Right>
        </Header>
        <Content>
          <List dataArray={items}
            renderRow={(data) =>
              <ListItem onPress={() => this.props.navigation.navigate('TrickDetail', { trickName: data.name } )}>
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

export default StackNavigator({
  LinksScreen: { screen: TrickScreen },
  TrickDetail: { screen: TrickDetail },
});

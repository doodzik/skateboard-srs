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

const datas = [
  'Simon Mignolet',
  'Nathaniel Clyne',
  'Dejan Lovren',
  'Mama Sakho',
  'Alberto Moreno',
  'Emre Can',
  'Joe Allen',
  'Phil Coutinho',
];

export default class InboxScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'SRS',
    }
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

  render() {
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
          <List dataArray={datas}
            renderRow={(item) =>
              <ListItem>
                <CheckBox checked={false} />
                <Body>
                  <Text>{item}</Text>
                </Body>
              </ListItem>
            }/>
        </Content>
      </Container>
    );
  }
}


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
  ActionSheet,
} from 'native-base';

import { StackNavigator } from 'react-navigation'
import TrickDetail from '../components/trick-detail-component'
import TricksPreview from '../components/tricks-preview-component'
import Selector from '../components/selector'
import { View, Dimensions } from 'react-native';

import { Trick } from '../src/db';

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
    this.update();
  }

  update() {
    Trick.allByName().then(items => this.setState({ items }))
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
    let {height} = Dimensions.get('window');
    height = height * 0.8 

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
          {(() => {
            if (items === null || items.length === 0) {
              return (
                <View style={{ flex: 1, height, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>No Trics yet</Text>
                </View>
              )
            } else {
              return (
                <List dataArray={items}
                  renderRow={(data) =>
                    <ListItem onPress={() => this.props.navigation.navigate('TrickDetail', { trickName: data.name } )}>
                      <Text>{data.name}</Text>
                    </ListItem>
                  } >
                  </List>
                )
            }
          })()}
        </Content>
      </Container>
    );
  }
}


export default StackNavigator({
  TrickScreen: { screen: TrickScreen },
  TrickDetail: { screen: TrickDetail },
  TricksPreview: { screen: TricksPreview },
  Selector: { screen: Selector },
});

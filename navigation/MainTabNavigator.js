import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import Colors from '../constants/Colors';

import SRSScreen from '../screens/SRSScreen';
import TricksFutureScreen from '../screens/TricksFutureScreen';
import TrickScreen from '../screens/TrickScreen';
import TagsScreen from '../screens/TagsScreen';
import ObstaclesScreen from '../screens/ObstaclesScreen';

export default TabNavigator(
  {
    Inbox: {
      screen: SRSScreen,
    },
    FutureTricks: {
      screen: TricksFutureScreen,
    },
    Tricks: {
      screen: TrickScreen,
    },
    Tags: {
      screen: TagsScreen,
    },
    Obstacles: {
      screen: ObstaclesScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Inbox':
            iconName =
              Platform.OS === 'ios'
                ? `ios-information-circle${focused ? '' : '-outline'}`
                : 'md-information-circle';
            break;
          case 'FutureTricks':
            iconName = Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link';
            break;
          case 'Tricks':
            iconName = Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link';
            break;
          case 'Tags':
            iconName =
              Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options';
            break;
          case 'Obstacles':
            iconName =
              Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options';
            break;
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3, width: 25 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    headerMode: 'none',
    swipeEnabled: false,
  }
);

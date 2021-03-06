import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import StickyItemFlatList from '@gorhom/sticky-item';
import DummyItem from '../components/dummy-item';
import BasicSticky from '../components/basic-sticky';

const data = [...Array(20)]
  .fill(0)
  .map((_, index) => ({ id: `item-${index}` }));

export const STORY_WIDTH = 200;
export const STORY_HEIGHT = 100;
const SEPARATOR_SIZE = 10;
const BORDER_RADIUS = 0;

const BasicRTL = () => {
  const { params } = useRoute();
  // @ts-ignore
  const { title } = params;

  // styles
  const containerStyle = {
    paddingVertical: SEPARATOR_SIZE * 2,
    backgroundColor: '#111',
  };

  // methods
  const handleStickyItemPress = () => Alert.alert('Sticky Item Pressed');

  // render
  const renderItem = () => (
    <DummyItem
      borderRadius={BORDER_RADIUS}
      width={STORY_WIDTH}
      height={STORY_HEIGHT}
      backgroundColor={'#333'}
    />
  );
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.text}>{title}</Text>
      <View style={containerStyle}>
        <StickyItemFlatList
          itemWidth={STORY_WIDTH}
          itemHeight={STORY_HEIGHT}
          separatorSize={SEPARATOR_SIZE}
          borderRadius={BORDER_RADIUS}
          stickyItemWidth={36}
          stickyItemHeight={36}
          isRTL={true}
          stickyItemBackgroundColors={['#222', '#2d88ff']}
          stickyItemContent={BasicSticky}
          onStickyItemPress={handleStickyItemPress}
          data={data}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#000',
  },
  text: {
    textAlign: 'right',
    marginHorizontal: SEPARATOR_SIZE * 2,
    marginBottom: SEPARATOR_SIZE,
    fontSize: 43,
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
    textTransform: 'uppercase',
    color: '#2d88ff',
  },
});

export default BasicRTL;

import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  Ref,
  useImperativeHandle,
} from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  event,
  useCode,
  cond,
  eq,
  call,
  onChange,
  set,
} from 'react-native-reanimated';
import {
  FlatList,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { useValues, useGestureHandler } from 'react-native-redash';
import StickyItem from './components/sticky-item';
import {
  DEFAULT_SEPARATOR_SIZE,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_IS_RTL,
} from './constants';
import type { StickyItemFlatListProps } from './types';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as typeof FlatList;

const SCREEN_WIDTH = Dimensions.get('window').width;

const StickyItemFlatList = forwardRef(
  <T extends {}>(props: StickyItemFlatListProps<T>, ref: Ref<FlatList<T>>) => {
    const {
      initialScrollIndex = 0,
      itemWidth,
      itemHeight,
      separatorSize = DEFAULT_SEPARATOR_SIZE,
      borderRadius = DEFAULT_BORDER_RADIUS,
      stickyItemWidth,
      stickyItemHeight,
      stickyItemBackgroundColors,
      stickyItemContent,
      onStickyItemPress,
      isRTL = DEFAULT_IS_RTL,
      ...rest
    } = props;

    // refs
    const flatListRef = useRef<FlatList<T>>(null);
    const tapRef = useRef<TapGestureHandler>(null);

    //#region variables
    const itemWidthWithSeparator = useMemo(() => itemWidth + separatorSize, [
      itemWidth,
      separatorSize,
    ]);
    //#endregion

    //#region styles
    const contentContainerStyle = useMemo(
      () => [
        rest.contentContainerStyle,
        {
          paddingLeft: itemWidth + separatorSize * 2,
          paddingRight: separatorSize,
        },
      ],
      [rest.contentContainerStyle, itemWidth, separatorSize]
    );
    //#endregion

    //#region methods
    const getHitSlop = useCallback(
      isMinimized => {
        const startPosition = isMinimized ? 0 : -separatorSize;
        const endPosition = isMinimized
          ? -(SCREEN_WIDTH - (stickyItemWidth + separatorSize * 2))
          : -(SCREEN_WIDTH - separatorSize - itemWidth);

        return {
          top: isMinimized
            ? -(itemHeight / 2 - (stickyItemWidth + separatorSize * 2) / 2)
            : 0,
          right: isRTL ? startPosition : endPosition,
          left: isRTL ? endPosition : startPosition,
          bottom: isMinimized
            ? -(itemHeight / 2 - (stickyItemWidth + separatorSize * 2) / 2)
            : 0,
        };
      },
      [itemWidth, itemHeight, stickyItemWidth, separatorSize, isRTL]
    );
    const getItemLayout = useCallback(
      (_, index) => {
        return {
          length: itemWidthWithSeparator,
          // sticky item + previous items width
          offset: itemWidthWithSeparator + itemWidthWithSeparator * index,
          index,
        };
      },
      [itemWidthWithSeparator]
    );
    //#endregion

    //#region gesture
    const [x, tapState] = useValues([0, State.UNDETERMINED]);
    const tapGestures = useGestureHandler({ state: tapState });
    const onScroll = event([
      {
        nativeEvent: {
          contentOffset: {
            x,
          },
        },
      },
    ]);
    const onScrollEnd = event([
      {
        nativeEvent: {
          contentOffset: {
            x,
          },
        },
      },
    ]);
    //#endregion

    //#region effects
    //@ts-ignore
    useImperativeHandle(ref, () => flatListRef.current!.getNode());
    useCode(
      () =>
        cond(eq(tapState, State.END), [
          call([tapState], () => {
            if (onStickyItemPress) {
              onStickyItemPress();
            }
          }),
          set(tapState, State.UNDETERMINED),
        ]),
      [tapState]
    );
    useCode(
      () =>
        onChange(
          x,
          call([x], args => {
            if (tapRef.current) {
              const isMinimized = args[0] > 0;
              // @ts-ignore
              tapRef.current.setNativeProps({
                hitSlop: getHitSlop(isMinimized),
              });
            }
          })
        ),
      [
        x,
        itemWidth,
        itemHeight,
        stickyItemWidth,
        stickyItemWidth,
        separatorSize,
      ]
    );
    useEffect(() => {
      /**
       * @DEV
       * to fix stick item position with fast refresh
       */
      x.setValue(0);

      if (tapRef.current) {
        // @ts-ignore
        tapRef.current.setNativeProps({
          hitSlop: getHitSlop(initialScrollIndex !== 0),
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getHitSlop]);
    //#endregion

    // render
    const renderSeparator = () => <View style={{ width: separatorSize }} />;
    return (
      <TapGestureHandler ref={tapRef} waitFor={flatListRef} {...tapGestures}>
        <Animated.View>
          <AnimatedFlatList
            {...rest}
            ref={flatListRef}
            initialScrollIndex={initialScrollIndex}
            inverted={isRTL}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={contentContainerStyle}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1}
            pagingEnabled={true}
            decelerationRate={'fast'}
            snapToAlignment={'start'}
            snapToInterval={itemWidth + separatorSize}
            onScroll={onScroll}
            onScrollAnimationEnd={onScrollEnd}
            getItemLayout={getItemLayout}
          />
          <StickyItem
            x={x}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            separatorSize={separatorSize}
            borderRadius={borderRadius}
            stickyItemWidth={stickyItemWidth}
            stickyItemHeight={stickyItemHeight}
            stickyItemBackgroundColors={stickyItemBackgroundColors}
            stickyItemContent={stickyItemContent}
            isRTL={isRTL}
          />
        </Animated.View>
      </TapGestureHandler>
    );
  }
);

export default StickyItemFlatList;

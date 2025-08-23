import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SNAP_POINTS = {
  MIN: SCREEN_HEIGHT * 0.15, // 15% - just show handle and title
  DEFAULT: SCREEN_HEIGHT * 0.4, // 40% - default size
  MAX: SCREEN_HEIGHT * 0.65, // 65% - leaves room for categories at top
};

export default function DraggableBottomSheet({ children }) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT - SNAP_POINTS.DEFAULT)).current;
  const [currentHeight, setCurrentHeight] = useState(SNAP_POINTS.DEFAULT);
  const lastGesture = useRef(SCREEN_HEIGHT - SNAP_POINTS.DEFAULT);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.setOffset(lastGesture.current);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        const { dy, vy } = gestureState;
        const currentPosition = lastGesture.current + dy;
        
        // Determine which snap point to animate to
        let targetHeight;
        let targetPosition;
        
        // If dragging fast, use velocity to determine direction
        if (Math.abs(vy) > 0.5) {
          if (vy > 0) {
            // Fast downward swipe
            if (currentHeight === SNAP_POINTS.MAX) {
              targetHeight = SNAP_POINTS.DEFAULT;
            } else {
              targetHeight = SNAP_POINTS.MIN;
            }
          } else {
            // Fast upward swipe
            if (currentHeight === SNAP_POINTS.MIN) {
              targetHeight = SNAP_POINTS.DEFAULT;
            } else {
              targetHeight = SNAP_POINTS.MAX;
            }
          }
        } else {
          // Slow drag - snap to nearest point
          const currentSheetHeight = SCREEN_HEIGHT - currentPosition;
          
          const distances = [
            Math.abs(currentSheetHeight - SNAP_POINTS.MIN),
            Math.abs(currentSheetHeight - SNAP_POINTS.DEFAULT),
            Math.abs(currentSheetHeight - SNAP_POINTS.MAX),
          ];
          
          const minDistanceIndex = distances.indexOf(Math.min(...distances));
          targetHeight = [SNAP_POINTS.MIN, SNAP_POINTS.DEFAULT, SNAP_POINTS.MAX][minDistanceIndex];
        }
        
        targetPosition = SCREEN_HEIGHT - targetHeight;
        
        // Animate to target position
        Animated.spring(translateY, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: 120,
          friction: 8,
        }).start();
        
        lastGesture.current = targetPosition;
        setCurrentHeight(targetHeight);
      },
    })
  ).current;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ translateY }],
        }
      ]}
    >
      <View 
        style={styles.header}
        {...panResponder.panHandlers}
      >
        <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
      </View>
      
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  content: {
    flex: 1,
  },
});

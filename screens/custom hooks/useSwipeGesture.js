import { useState, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const useSwipeGesture = (onSwipeRight, onSwipeLeft) => {
    const position = useRef(new Animated.ValueXY()).current;
    const touchStartRef = useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipeFeedback, setSwipeFeedback] = useState({ text: '', color: 'transparent' });
    const feedbackColor = useRef(new Animated.Value(0)).current;

    const handleTouchStart = (event) => {
        const { pageX } = event.nativeEvent;
        touchStartRef.current = { x: pageX };
        setIsDragging(false);
    };

    const handleTouchMove = (event) => {
        const { pageX } = event.nativeEvent;
        const dx = pageX - touchStartRef.current.x;

        if (Math.abs(dx) > 10 && !isDragging) {
            setIsDragging(true);
        }

        if (isDragging) {
            requestAnimationFrame(() => {
                position.setValue({ x: dx, y: 0 });
            });

            updateFeedback(dx);
        }
    };

    const updateFeedback = (dx) => {
        if (dx > 50) {
            setSwipeFeedback({ text: 'LIKE', color: '#00FF00' });
            Animated.timing(feedbackColor, {
                toValue: 1,
                duration: 0,
                useNativeDriver: false,
            }).start();
        } else if (dx < -50) {
            setSwipeFeedback({ text: 'NOPE', color: '#FF0000' });
            Animated.timing(feedbackColor, {
                toValue: 2,
                duration: 0,
                useNativeDriver: false,
            }).start();
        } else {
            setSwipeFeedback({ text: '', color: 'transparent' });
            Animated.timing(feedbackColor, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleTouchEnd = (event) => {
        const { pageX } = event.nativeEvent;
        const dx = pageX - touchStartRef.current.x;

        if (dx > 50) {
            Animated.timing(position, {
                toValue: { x: width + 100, y: 0 },
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                onSwipeRight && onSwipeRight();
            });
        } else if (dx < -50) {
            Animated.timing(position, {
                toValue: { x: -width - 100, y: 0 },
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                onSwipeLeft && onSwipeLeft();
            });
        } else {
            Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start(() => setSwipeFeedback({ text: '', color: 'transparent' }));
        }
    };

    return {
        position,
        swipeFeedback,
        feedbackColor,
        isDragging,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
};


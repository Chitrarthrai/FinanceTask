import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Platform,
  Dimensions,
  PanResponder,
  Animated as RNAnimated,
  Vibration,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "../components/ui/GlassView";
import { useData } from "../context/DataContext";
import { useColorScheme } from "nativewind";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  PanelLeftClose,
  PanelRightClose,
  Search,
} from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const {
    navPosition,
    setNavPosition,
    isNavHidden,
    setIsNavHidden,
    isNavCollapsed,
    setIsNavCollapsed,
    isSearching,
    setIsSearching,
  } = useData();
  const navPositionRef = useRef(navPosition);

  useEffect(() => {
    navPositionRef.current = navPosition;
  }, [navPosition]);

  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const isVertical = navPosition === "left" || navPosition === "right";
  const [showSidebarLabels, setShowSidebarLabels] = useState(false);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const pan = useRef(new RNAnimated.ValueXY()).current;
  const scale = useSharedValue(1);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        scale.value = withSpring(0.95);
        Vibration.vibrate(10);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: RNAnimated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        scale.value = withSpring(1);
        pan.flattenOffset();

        RNAnimated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();

        const { moveX, moveY } = gestureState;
        const leftDist = moveX;
        const rightDist = SCREEN_WIDTH - moveX;
        const topDist = moveY;
        const bottomDist = SCREEN_HEIGHT - moveY;

        const min = Math.min(leftDist, rightDist, topDist, bottomDist);
        const currentPos = navPositionRef.current;
        let newPos: any = currentPos;
        if (min === leftDist) newPos = "left";
        else if (min === rightDist) newPos = "right";
        else if (min === topDist) newPos = "top";
        else if (min === bottomDist) newPos = "bottom";

        if (newPos !== currentPos) {
          setNavPosition(newPos);
          Vibration.vibrate(20);
        }
      },
    }),
  ).current;

  // Dynamic Styles
  const getContainerStyle = () => {
    const baseStyle: any = {
      position: "absolute",
      backgroundColor: "transparent",
      elevation: 0,
      zIndex: 50,
      transform: isDragging ? pan.getTranslateTransform() : [],
    };

    // HIDDEN MODE (Edge Arrow)
    if (isNavHidden && isVertical) {
      return {
        ...baseStyle,
        [navPosition]: 5,
        top: "50%",
        marginTop: -16,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
      };
    }

    // COLLAPSED PILL MODE
    if (isNavCollapsed) {
      switch (navPosition) {
        case "top":
        case "bottom":
          return {
            ...baseStyle,
            [navPosition]:
              navPosition === "top"
                ? Platform.OS === "ios"
                  ? insets.top + 10
                  : 30
                : Platform.OS === "ios"
                  ? insets.bottom + 10
                  : 20,
            alignSelf: "center",
            width: 110, // Pill width
            height: 50, // Pill height
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          };
        case "left":
        case "right":
          return {
            ...baseStyle,
            [navPosition]: 15,
            top: "45%",
            width: 60,
            height: 100, // Vertical pill
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
          };
      }
    }

    // EXPANDED NAV
    switch (navPosition) {
      case "top":
        return {
          ...baseStyle,
          top: Platform.OS === "ios" ? insets.top + 10 : 30,
          alignSelf: "center",
          width: "90%",
          height: 60, // Back to standard height
          flexDirection: "row",
          borderRadius: 35,
        };
      case "bottom":
        return {
          ...baseStyle,
          bottom: Platform.OS === "ios" ? insets.bottom + 10 : 20,
          alignSelf: "center",
          width: "90%",
          height: 65, // Back to standard height
          flexDirection: "row",
          borderRadius: 35,
        };
      case "left":
        return {
          ...baseStyle,
          left: 15,
          top: "20%",
          bottom: "20%",
          width: showSidebarLabels ? 180 : 65,
          flexDirection: "column",
          height: "60%",
          borderRadius: 35,
        };
      case "right":
        return {
          ...baseStyle,
          right: 15,
          top: "20%",
          bottom: "20%",
          width: showSidebarLabels ? 180 : 65,
          flexDirection: "column",
          height: "60%",
          borderRadius: 35,
        };
      default:
        return baseStyle;
    }
  };

  const containerStyle = getContainerStyle();
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <RNAnimated.View
      style={[containerStyle, { opacity: isDragging ? 0.8 : 1 }]}
      {...panResponder.panHandlers}>
      <Animated.View
        style={[
          { flex: 1, width: "100%", height: "100%", overflow: "hidden" },
          animatedScaleStyle,
        ]}>
        <GlassView
          intensity={95}
          className={`absolute inset-0 border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 shadow-xl shadow-black/20`}
          style={{ borderRadius: isNavHidden ? 16 : 35 }}
        />

        {isNavHidden && isVertical ? (
          /* --- HIDDEN ARROW MODE --- */
          <TouchableOpacity
            className="w-full h-full items-center justify-center p-1"
            onPress={() => {
              Vibration.vibrate(10);
              setIsNavHidden(false);
            }}>
            {navPosition === "left" ? (
              <ChevronRight size={16} color={isDark ? "white" : "black"} />
            ) : (
              <ChevronLeft size={16} color={isDark ? "white" : "black"} />
            )}
          </TouchableOpacity>
        ) : (
          /* --- MAIN NAV CONTENT --- */
          <View
            style={{
              flex: 1,
              flexDirection: isVertical ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: isVertical ? 20 : 0,
              paddingHorizontal: isVertical ? 0 : 20,
            }}>
            
            {/* Collapsed Pill (shows Menu and Search buttons side by side) */}
            {isNavCollapsed ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: isVertical ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  width: "100%",
                  height: "100%",
                  paddingHorizontal: isVertical ? 0 : 8,
                  paddingVertical: isVertical ? 8 : 0,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    Vibration.vibrate(10);
                    setIsNavCollapsed(false);
                  }}
                  className="p-2">
                  <Menu size={18} color={isDark ? "white" : "#6366f1"} />
                </TouchableOpacity>

                <View className={isVertical ? "h-[1px] w-8 bg-white/20 dark:bg-white/10 my-1" : "w-[1px] h-6 bg-black/5 dark:bg-white/10 mx-1"} />

                <TouchableOpacity
                  onPress={() => {
                    Vibration.vibrate(10);
                    setIsSearching(true);
                  }}
                  className="p-2">
                  <Search size={18} color={isDark ? "white" : "#64748b"} />
                </TouchableOpacity>
              </View>
            ) : (
              /* --- NORMAL EXPANDED TABS --- */
              <>
                {state.routes.map((route: any, index: number) => {
                  const { options } = descriptors[route.key];
                  const isFocused = state.index === index;

                  const onPress = () => {
                    if (isDragging) return;
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name, route.params);
                    }
                  };

                  const activeColor = isDark ? "#fbbf24" : "#4f46e5";
                  const inactiveColor = isDark
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(71,85,105,0.5)";

                  return (
                    <TabItem
                      key={route.key}
                      isFocused={isFocused}
                      onPress={onPress}
                      options={options}
                      activeColor={activeColor}
                      inactiveColor={inactiveColor}
                      isVertical={isVertical}
                      isDragging={isDragging}
                      showLabel={isVertical && showSidebarLabels}
                      label={options.tabBarLabel || route.name}
                    />
                  );
                })}

                {/* EXPANDED CONTROLS */}
                <View
                  className={
                    isVertical
                      ? "mt-2 pt-2 border-t border-black/5 dark:border-white/10"
                      : "ml-2 pl-2 border-l border-black/5 dark:border-white/10"
                  }>
                  {isVertical ? (
                    <View className="items-center gap-4">
                      <TouchableOpacity
                        onPress={() => {
                          Vibration.vibrate(10);
                          setShowSidebarLabels(!showSidebarLabels);
                        }}
                        hitSlop={10}>
                        {showSidebarLabels ? (
                          navPosition === "left" ? (
                            <ChevronLeft size={20} color={isDark ? "white" : "black"} opacity={0.5} />
                          ) : (
                            <ChevronRight size={20} color={isDark ? "white" : "black"} opacity={0.5} />
                          )
                        ) : navPosition === "left" ? (
                          <ChevronRight size={20} color={isDark ? "white" : "black"} opacity={0.5} />
                        ) : (
                          <ChevronLeft size={20} color={isDark ? "white" : "black"} opacity={0.5} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsSearching(true)}
                        hitSlop={10}>
                        <Search size={16} color={isDark ? "white" : "black"} opacity={0.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsNavCollapsed(true)}
                        hitSlop={10}>
                        <Minimize2 size={16} color={isDark ? "white" : "black"} opacity={0.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsNavHidden(true)}
                        hitSlop={10}>
                        {navPosition === "left" ? (
                          <PanelLeftClose size={16} color={isDark ? "white" : "black"} opacity={0.5} />
                        ) : (
                          <PanelRightClose size={16} color={isDark ? "white" : "black"} opacity={0.5} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() => setIsSearching(true)}
                        hitSlop={10}>
                        <Search size={18} color={isDark ? "white" : "black"} opacity={0.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsNavCollapsed(true)}
                        hitSlop={10}>
                        <Minimize2 size={18} color={isDark ? "white" : "black"} opacity={0.5} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </Animated.View>
    </RNAnimated.View>
  );
};

const TabItem = ({
  isFocused,
  onPress,
  options,
  activeColor,
  inactiveColor,
  isVertical,
  isDragging,
  showLabel,
  label,
}: any) => {
  const scale = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { damping: 15 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <TouchableOpacity
      disabled={isDragging}
      onPress={onPress}
      style={{
        flexDirection: isVertical && showLabel ? "row" : "column",
        alignItems: "center",
        justifyContent: isVertical && showLabel ? "flex-start" : "center",
        width: isVertical ? (showLabel ? "100%" : 50) : undefined,
        height: isVertical ? 50 : 50,
        paddingHorizontal: showLabel ? 12 : 0,
        marginBottom: isVertical ? 8 : 0,
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}>
        {isFocused && (
          <Animated.View
            style={[
              animatedStyle,
              { position: "absolute", width: 40, height: 40, borderRadius: 20 },
            ]}
            className="bg-indigo-100/50 dark:bg-indigo-500/20"
          />
        )}
        <View style={{ zIndex: 10 }}>
          {options.tabBarIcon &&
            options.tabBarIcon({
              color: isFocused ? activeColor : inactiveColor,
              size: 20,
            })}
        </View>
      </View>
      {showLabel && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            color: isFocused ? activeColor : inactiveColor,
            marginLeft: 10,
            fontWeight: isFocused ? "600" : "400",
            fontSize: 13,
          }}
          numberOfLines={1}>
          {label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(CustomTabBar);

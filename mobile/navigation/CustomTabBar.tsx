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
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "../components/ui/GlassView";
import { useData } from "../context/DataContext";
import { useColorScheme } from "nativewind";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
  Layout,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  GripHorizontal,
  GripVertical,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  List,
  Wallet,
  PanelLeftClose,
  PanelRightClose,
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
  } = useData();
  const navPositionRef = useRef(navPosition);

  useEffect(() => {
    navPositionRef.current = navPosition;
  }, [navPosition]);

  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const isVertical = navPosition === "left" || navPosition === "right";

  // States
  // const [isCollapsed, setIsCollapsed] = useState(false); // MOVED TO CONTEXT
  const [showSidebarLabels, setShowSidebarLabels] = useState(false);
  // const [isHidden, setIsHidden] = useState(false); // MOVED TO CONTEXT

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchScope, setSearchScope] = useState<"transactions" | "tasks">(
    "transactions",
  );
  const [searchText, setSearchText] = useState("");

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
          runOnJS(setNavPosition)(newPos);
          Vibration.vibrate(20);
        }
      },
    }),
  ).current;

  // Handlers
  const handleSearchSubmit = () => {
    if (!searchText.trim()) return;

    const targetScreen =
      searchScope === "transactions" ? "TransactionsTab" : "TasksTab";
    navigation.navigate(targetScreen, { search: searchText });

    // Close search mode after submitting? Or keep it?
    // Let's close it to show results
    setIsSearching(false);
    setIsNavCollapsed(false); // Maybe expand back to normal nav?
    setSearchText("");
  };

  // Dynamic Styles
  const getContainerStyle = () => {
    const baseStyle: any = {
      position: "absolute",
      backgroundColor: "transparent",
      elevation: 0,
      zIndex: 50,
      transform: isDragging ? pan.getTranslateTransform() : [],
    };

    // SEARCH MODE (Overrides everything when active)
    if (isSearching) {
      return {
        ...baseStyle,
        top: Platform.OS === "ios" ? insets.top + 10 : 30, // Always top for search? Or relative?
        // Let's keep it mostly centered or at top.
        // If user drags to bottom, Search UI at bottom might be weird.
        // For now, let's respect current position but force width.
        [navPosition === "bottom" ? "bottom" : "top"]:
          navPosition === "bottom"
            ? Platform.OS === "ios"
              ? insets.bottom + 10
              : 20
            : Platform.OS === "ios"
              ? insets.top + 10
              : 30,
        [navPosition === "left" ? "left" : "right"]: isVertical
          ? 15
          : undefined,
        alignSelf: "center",
        width: isVertical ? 250 : "90%", // Wider for search
        height: isVertical ? 300 : 60, // Taller if vertical? Or force horizontal layout for search?
        // Let's force a horizontal pill for Search even if sidebar is active,
        // OR make a nice vertical search card.
        // Simpler: Force standard horizontal pill look for search mode to match web header.
        flexDirection: isVertical ? "column" : "row",
        borderRadius: 30,
      };
    }

    // HIDDEN MODE (Edge Arrow)
    if (isNavHidden && isVertical) {
      return {
        ...baseStyle,
        [navPosition]: 5, // Tighter float
        top: "50%",
        marginTop: -16, // Center vertically (half of height)
        width: 32, // Mini Circle
        height: 32, // Mini Circle
        borderRadius: 16, // Fully rounded
        alignItems: "center",
        justifyContent: "center",
      };
    }

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
            width: 60,
            height: 60,
            borderRadius: 30,
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
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
          };
      }
    }

    // Expanded Nav
    switch (navPosition) {
      case "top":
        return {
          ...baseStyle,
          top: Platform.OS === "ios" ? insets.top + 10 : 30,
          alignSelf: "center",
          width: "85%",
          height: 60,
          flexDirection: "row",
          borderRadius: 35,
        };
      case "bottom":
        return {
          ...baseStyle,
          bottom: Platform.OS === "ios" ? insets.bottom + 10 : 20,
          alignSelf: "center",
          width: "85%",
          height: 65,
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

        {/* CONTENT SWITCHER */}
        {isNavHidden && isVertical ? (
          /* --- HIDDEN ARROW MODE --- */
          <TouchableOpacity
            className="w-full h-full items-center justify-center p-1"
            onPress={() => {
              Vibration.vibrate(10);
              setIsNavHidden(false);
            }}>
            {navPosition === "left" ? (
              <ChevronRight size={16} color={isDark ? "white" : "black"} /> // Smaller icon
            ) : (
              <ChevronLeft size={16} color={isDark ? "white" : "black"} /> // Smaller icon
            )}
          </TouchableOpacity>
        ) : isSearching ? (
          /* --- SEARCH MODE UI --- */
          <View
            className={`flex-1 ${isVertical ? "flex-col p-4" : "flex-row px-4"} items-center gap-2`}>
            {/* Scope Selector */}
            <TouchableOpacity
              onPress={() =>
                setSearchScope(
                  searchScope === "transactions" ? "tasks" : "transactions",
                )
              }
              className="flex-row items-center gap-1 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">
              {searchScope === "transactions" ? (
                <Wallet size={14} color={isDark ? "#ccc" : "#555"} />
              ) : (
                <List size={14} color={isDark ? "#ccc" : "#555"} />
              )}
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                {searchScope === "transactions" ? "Trans" : "Tasks"}
              </Text>
            </TouchableOpacity>

            {/* Input */}
            <TextInput
              autoFocus
              placeholder={`Search ${searchScope}...`}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="flex-1 text-base font-medium text-slate-900 dark:text-white h-full"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />

            {/* Close/Submit */}
            <View className="flex-row items-center gap-1">
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={handleSearchSubmit}
                  className="bg-indigo-500 rounded-full p-1.5">
                  <Search size={14} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setIsSearching(false);
                  setSearchText("");
                }}
                className="p-1">
                <X size={18} color={isDark ? "#ccc" : "#555"} />
              </TouchableOpacity>
            </View>
          </View>
        ) : isNavCollapsed ? (
          /* --- MICRO MODE (SEARCH BUTTON) --- */
          <TouchableOpacity
            className="w-full h-full items-center justify-center p-2"
            onPress={() => {
              Vibration.vibrate(10);
              // Toggle straight to SEARCH mode instead of just expanding?
              // User said "show work like the header in website code"
              // The website header IS searching.
              // So clicking this should open Search Mode.
              setIsSearching(true);
            }}
            onLongPress={() => {
              // Determine if we should expand to normal nav on long press?
              Vibration.vibrate(20);
              setIsNavCollapsed(false);
            }}>
            <Search size={24} color={isDark ? "white" : "#333"} />
          </TouchableOpacity>
        ) : (
          /* --- NORMAL NAV MODE --- */
          <View
            style={{
              flex: 1,
              flexDirection: isVertical ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: isVertical ? 20 : 0,
              paddingHorizontal: isVertical ? 0 : 20,
            }}>
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

            {/* CONTROLS */}
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
                        <ChevronLeft
                          size={20}
                          color={isDark ? "white" : "black"}
                          opacity={0.5}
                        />
                      ) : (
                        <ChevronRight
                          size={20}
                          color={isDark ? "white" : "black"}
                          opacity={0.5}
                        />
                      )
                    ) : navPosition === "left" ? (
                      <ChevronRight
                        size={20}
                        color={isDark ? "white" : "black"}
                        opacity={0.5}
                      />
                    ) : (
                      <ChevronLeft
                        size={20}
                        color={isDark ? "white" : "black"}
                        opacity={0.5}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsNavCollapsed(true)}
                    hitSlop={10}>
                    <Minimize2
                      size={16}
                      color={isDark ? "white" : "black"}
                      opacity={0.5}
                    />
                  </TouchableOpacity>

                  {/* Hide Completely */}
                  <TouchableOpacity
                    onPress={() => setIsNavHidden(true)}
                    hitSlop={10}>
                    {navPosition === "left" ? (
                      <PanelLeftClose
                        size={16}
                        color={isDark ? "white" : "black"}
                        opacity={0.5}
                      />
                    ) : (
                      <PanelRightClose
                        size={16}
                        color={isDark ? "white" : "black"}
                        opacity={0.5}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsNavCollapsed(true)}
                  hitSlop={10}>
                  <Minimize2
                    size={18}
                    color={isDark ? "white" : "black"}
                    opacity={0.5}
                  />
                </TouchableOpacity>
              )}
            </View>
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

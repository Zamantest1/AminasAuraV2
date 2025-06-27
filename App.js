"use client"

// CRITICAL: Polyfill MUST be imported first
import "react-native-get-random-values"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  Platform,
  PanResponder,
} from "react-native"
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import { LinearGradient } from "expo-linear-gradient"
import NetInfo from "@react-native-community/netinfo"
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins"
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display"
import DateTimePicker from "@react-native-community/datetimepicker"
import { v4 as uuidv4 } from "uuid"

// Get screen dimensions for proper layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// --- Backend Configuration ---
const BIN_ID = "684632fb8960c979a5a6d012"
const API_KEY = "$2a$10$29zKNT6hruUMkLUoxNEPR.K49EnNhwz0uXOAwgx6s1RnFavfvl4s."
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`

// --- Enhanced Debugging Configuration ---
const DEBUG_MODE = true // Set to false in production
const DEBUG_STORAGE_KEY = "@AminaAura:debugLogs"
const DEBUG_PANEL_VISIBILITY_KEY = "@AminaAura:debugPanelVisible"

// Debug logging function
const debugLog = async (category, message, data = null) => {
  if (!DEBUG_MODE) return

  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    category,
    message,
    data: data ? JSON.stringify(data, null, 2) : null,
  }

  console.log(`[${category}] ${message}`, data || "")

  try {
    const existingLogs = await AsyncStorage.getItem(DEBUG_STORAGE_KEY)
    const logs = existingLogs ? JSON.parse(existingLogs) : []
    logs.push(logEntry)

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }

    await AsyncStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.error("Failed to save debug log:", error)
  }
}

// Function to export debug logs
const exportDebugLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem(DEBUG_STORAGE_KEY)
    if (logs) {
      const parsedLogs = JSON.parse(logs)
      const logText = parsedLogs
        .map((log) => `[${log.timestamp}] [${log.category}] ${log.message}\n${log.data || ""}\n---\n`)
        .join("")

      await Share.share({
        message: `Amina's Aura Debug Logs:\n\n${logText}`,
        title: "Debug Logs",
      })
    }
  } catch (error) {
    console.error("Failed to export debug logs:", error)
  }
}

// --- Theme and Constants ---
const COLORS = {
  bgMain: "#FDF7FA",
  bgCard: "#FFFFFF",
  textPrimary: "#4E3D52",
  textSecondary: "#8A798D",
  textOnAccent: "#FFFFFF",
  accentPrimary: "#EF9A9A",
  accentPrimaryDarker: "#E57373",
  accentSecondary: "#CE93D8",
  borderColor: "#F3EAF5",
  shadowColor: "rgba(149, 117, 205, 0.3)",
  gradientQuoteStart: "#FFAB91",
  gradientQuoteEnd: "#E57373",
  danger: "#D32F2F",
  success: "#66BB6A",
  info: "#4FC3F7",
  warning: "#FF9800",
  moodHappy: "#FFDDC1",
  moodSad: "#AEC6CF",
  moodAngry: "#FFADAD",
  moodExcited: "#C1E1C1",
  moodNeutral: "#E0E0E0",
  eventPrimary: "#E8F5E9",
  eventSecondary: "#C8E6C9",
  eventAccent: "#4CAF50",
  eventPassed: "#FFCDD2",
  eventPassedSecondary: "#F8BBD9",
  eventSoon: "#FFE0B2",
  eventUrgent: "#FFCDD2",
}

// Dynamic color schemes for events
const EVENT_COLOR_SCHEMES = [
  { name: "Sunset", colors: ["#FFB74D", "#FF8A65"], textColor: "#4E342E" },
  { name: "Ocean", colors: ["#4FC3F7", "#29B6F6"], textColor: "#0D47A1" },
  { name: "Forest", colors: ["#81C784", "#66BB6A"], textColor: "#1B5E20" },
  { name: "Lavender", colors: ["#CE93D8", "#BA68C8"], textColor: "#4A148C" },
  { name: "Rose", colors: ["#F48FB1", "#EC407A"], textColor: "#880E4F" },
  { name: "Mint", colors: ["#80CBC4", "#4DB6AC"], textColor: "#004D40" },
  { name: "Peach", colors: ["#FFAB91", "#FF8A65"], textColor: "#BF360C" },
  { name: "Sky", colors: ["#90CAF9", "#64B5F6"], textColor: "#0D47A1" },
  { name: "Sage", colors: ["#A5D6A7", "#81C784"], textColor: "#2E7D32" },
  { name: "Coral", colors: ["#FFCC80", "#FFB74D"], textColor: "#E65100" },
]

// Simplified and reliable font family configuration
const FONT_FAMILY = {
  playfairRegular: "PlayfairDisplay_400Regular",
  playfairSemiBold: "PlayfairDisplay_600SemiBold",
  playfairBold: "PlayfairDisplay_700Bold",
  poppinsRegular: "Poppins_400Regular",
  poppinsMedium: "Poppins_500Medium",
  poppinsSemiBold: "Poppins_600SemiBold",
  poppinsBold: "Poppins_700Bold",
}

// --- Daily Quotes Data ---
const dailyQuotes = [
  "With you, I am home.",
  "You are my favorite daydream.",
  "Our love story is my favorite.",
  "You make my heart smile.",
  "Life is beautiful with you by my side.",
  "Every moment with you is a treasure.",
  "You are the poetry my heart writes.",
  "My love for you grows stronger each day.",
  "You are my sunshine after the rain.",
  "To love and be loved is to feel the sun from both sides.",
  "In your eyes, I found my forever.",
  "You are the best thing that's ever been mine.",
  "I love you more than words can say.",
  "You are my today and all of my tomorrows.",
  "My heart is and always will be yours.",
  "I choose you. And I'll choose you over and over.",
  "You're the reason I believe in love.",
  "Every love song is about you.",
  "You are my greatest adventure.",
  "I'm much more me when I'm with you.",
  "Your love is all I need to feel complete.",
  "I have found the one whom my soul loves.",
  "You are the beat in my heart, the music in my laughter.",
  "In a sea of people, my eyes will always search for you.",
  "You are my sun, my moon, and all my stars.",
  "I love you not only for what you are but for what I am when I am with you.",
  "The best thing to hold onto in life is each other.",
  "You are nothing short of my everything.",
  "I love you, not for what you are, but for what I am when I am with you.",
  "For the two of us, home isn't a place. It is a person. And we are finally home.",
  "I want all of my lasts to be with you.",
  "When I saw you, I fell in love, and you smiled because you knew.",
  "You are the answer to every prayer I've offered.",
  "You have bewitched me, body and soul.",
  "My love for you is a journey, starting at forever and ending at never.",
  "If I know what love is, it is because of you.",
  "You are the source of my joy, the center of my world and the whole of my heart.",
  "Your arms feel more like home than any house ever did.",
  "You are my paradise and I would happily get stranded on you for a lifetime.",
  "I can't stop thinking about you, today... tomorrow... always.",
  "Thank you for always being my rainbow after the storm.",
  "I am so in love with you that there isn't anything else.",
  "I love you because the entire universe conspired to help me find you.",
  "You are the last thought in my mind before I drift off to sleep and the first thought when I wake up each morning.",
  "You are the finest, loveliest, tenderest, and most beautiful person I have ever known—and even that is an understatement.",
  "I love you past the moon and miss you beyond the stars.",
  "You stole my heart, but I'll let you keep it.",
  "Your love shines in my heart as the sun that shines on the earth.",
  "My day is not complete if I don't tell you I love you.",
  "You are the cream in my coffee and the milk in my tea.",
]

const MOOD_OPTIONS = [
  {
    emoji: "😊",
    color: COLORS.moodHappy,
    label: "Happy",
  },
  {
    emoji: "😌",
    color: COLORS.moodNeutral,
    label: "Relaxed",
  },
  {
    emoji: "🥰",
    color: COLORS.accentPrimary,
    label: "Loved",
  },
  {
    emoji: "😔",
    color: COLORS.moodSad,
    label: "Sad",
  },
  {
    emoji: "😤",
    color: COLORS.moodAngry,
    label: "Frustrated",
  },
  {
    emoji: "🥳",
    color: COLORS.moodExcited,
    label: "Excited",
  },
]

// --- Helper Functions ---
function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get color scheme for event based on ID
const getEventColorScheme = (eventId) => {
  const hash = eventId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  const index = Math.abs(hash) % EVENT_COLOR_SCHEMES.length
  return EVENT_COLOR_SCHEMES[index]
}

// --- Enhanced Time Formatting Functions ---
const formatDetailedCountdown = (event) => {
  const eventDateTime = new Date(`${event.date}T${event.time || "00:00"}:00`)
  const now = new Date()
  const difference = eventDateTime.getTime() - now.getTime()

  if (difference <= 0) {
    const pastDifference = Math.abs(difference)
    const pastDays = Math.floor(pastDifference / (1000 * 60 * 60 * 24))
    const pastHours = Math.floor((pastDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const pastMinutes = Math.floor((pastDifference % (1000 * 60 * 60)) / (1000 * 60))

    if (pastDays > 0) {
      return pastHours > 0 ? `${pastDays}d ${pastHours}h ago` : `${pastDays}d ago`
    } else if (pastHours > 0) {
      return pastMinutes > 0 ? `${pastHours}h ${pastMinutes}m ago` : `${pastHours}h ago`
    } else {
      return pastMinutes > 0 ? `${pastMinutes}m ago` : "Just now"
    }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  // For events within the same hour, show only hours and minutes
  if (days === 0 && hours === 0) {
    if (minutes <= 1) {
      return "Starting soon!"
    }
    return `${minutes}m`
  }

  // For events within the same day
  if (days === 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  // For events more than a day away
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`
}

const getEventUrgency = (event) => {
  const eventDateTime = new Date(`${event.date}T${event.time || "00:00"}:00`)
  const now = new Date()
  const difference = eventDateTime.getTime() - now.getTime()

  if (difference <= 0) return "passed"
  if (difference <= 60 * 1000) return "starting" // Within 1 minute
  if (difference <= 60 * 60 * 1000) return "soon" // Within 1 hour
  if (difference <= 24 * 60 * 60 * 1000) return "today" // Within 24 hours
  return "upcoming"
}

const sortEventsByProximity = (events) => {
  const now = new Date()

  return events.sort((a, b) => {
    const aDateTime = new Date(`${a.date}T${a.time || "00:00"}:00`)
    const bDateTime = new Date(`${b.date}T${b.time || "00:00"}:00`)

    const aDiff = Math.abs(aDateTime.getTime() - now.getTime())
    const bDiff = Math.abs(bDateTime.getTime() - now.getTime())

    // Prioritize upcoming events over past events
    const aIsUpcoming = aDateTime.getTime() >= now.getTime()
    const bIsUpcoming = bDateTime.getTime() >= now.getTime()

    if (aIsUpcoming && !bIsUpcoming) return -1
    if (!aIsUpcoming && bIsUpcoming) return 1

    // Within the same category (upcoming or past), sort by proximity
    return aDiff - bDiff
  })
}

// --- Weather Helper Functions and Data ---
const weatherData = {
  sunny: {
    icon: "sun",
    quotes: ["You shine brighter than the sun.", "Let my love be your shade.", "Warm sun, warmer thoughts of you."],
  },
  cloudy: {
    icon: "cloud-sun",
    quotes: [
      "You're the silver lining to my cloudy day.",
      "Under this sky, all I want is you.",
      "My love for you peeks through the clouds.",
    ],
  },
  rainy: {
    icon: "cloud-rain",
    quotes: ["Every drop carries my heart to you.", "Let's dance in this rain together.", "In every puddle, I see us."],
  },
  stormy: {
    icon: "bolt",
    quotes: [
      "No thunder is louder than my heart for you.",
      "Let the sky shout—my love is louder.",
      "This storm reminds me how strong my feelings are.",
    ],
  },
  snowy: {
    icon: "snowflake",
    quotes: [
      "My love is warmer than any blanket.",
      "You keep my soul warm in this cold.",
      "Every snowflake is a memory of us.",
    ],
  },
  foggy: {
    icon: "smog",
    quotes: [
      "Even in the mist, my love is clear.",
      "This fog can't hide my feelings for you.",
      "You're the only clear thing in my world.",
    ],
  },
  default: {
    icon: "cloud",
    quotes: ["No matter the weather, I'm thinking of you."],
  },
}

const getTemperatureGradient = (temp) => {
  if (temp <= 5) return ["#A1C4FD", "#C2E9FB"]
  if (temp <= 15) return ["#B0BEC5", "#E0E7FF"]
  if (temp <= 25) return ["#A8E6CF", "#FFD3B6"]
  if (temp <= 35) return ["#FFD180", "#FFAB91"]
  return ["#FF8A65", "#FF7043"]
}

const getWeatherInfo = (weatherCode) => {
  if (weatherCode >= 200 && weatherCode < 300) return weatherData.stormy
  if (weatherCode >= 300 && weatherCode < 600) return weatherData.rainy
  if (weatherCode >= 600 && weatherCode < 700) return weatherData.snowy
  if (weatherCode >= 700 && weatherCode < 800) return weatherData.foggy
  if (weatherCode === 800) return weatherData.sunny
  if (weatherCode > 800) return weatherData.cloudy
  switch (weatherCode) {
    case 0:
    case 1:
      return weatherData.sunny
    case 2:
    case 3:
      return weatherData.cloudy
    case 45:
    case 48:
      return weatherData.foggy
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return weatherData.rainy
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return weatherData.rainy
    case 71:
    case 73:
    case 75:
    case 77:
      return weatherData.snowy
    case 80:
    case 81:
    case 82:
      return weatherData.rainy
    case 85:
    case 86:
      return weatherData.snowy
    case 95:
    case 96:
    case 99:
      return weatherData.stormy
    default:
      return weatherData.default
  }
}

// --- Enhanced Error Handling Functions ---
const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      return false
    }
    return true
  } catch (error) {
    console.error("Location permission error:", error)
    return false
  }
}

// --- Enhanced JSONBin API Functions with Debugging ---
const safeFetch = async (url, options) => {
  await debugLog("API", `Making request to: ${url}`, {
    method: options?.method || "GET",
    headers: options?.headers,
    bodySize: options?.body ? options.body.length : 0,
  })

  try {
    const response = await fetch(url, options)

    await debugLog("API", `Response received`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorText = await response.text()
      await debugLog("API_ERROR", `HTTP Error ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response
  } catch (error) {
    await debugLog("API_ERROR", "Network error occurred", {
      message: error.message,
      stack: error.stack,
    })
    throw error
  }
}

// Enhanced JSONBin data retrieval with validation
const getBinData = async () => {
  await debugLog("JSONBIN", "Attempting to fetch data from JSONBin")

  try {
    const response = await safeFetch(BIN_URL, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY,
        "X-Access-Key": API_KEY,
      },
    })

    const data = await response.json()
    await debugLog("JSONBIN", "Successfully fetched data", {
      hasRecord: !!data.record,
      recordKeys: data.record ? Object.keys(data.record) : [],
      dataStructure: data.record || data,
    })

    return data.record || data
  } catch (error) {
    await debugLog("JSONBIN_ERROR", "Failed to fetch data", {
      error: error.message,
      binId: BIN_ID,
      url: BIN_URL,
    })
    throw error
  }
}

// Enhanced JSONBin data update with validation and retry logic
const updateBinData = async (newData, retryCount = 0) => {
  const maxRetries = 3

  await debugLog("JSONBIN", `Attempting to update data (attempt ${retryCount + 1}/${maxRetries + 1})`, {
    dataKeys: Object.keys(newData),
    dataSize: JSON.stringify(newData).length,
    retryCount,
  })

  try {
    // Validate data structure before sending
    if (!newData || typeof newData !== "object") {
      throw new Error("Invalid data structure: data must be an object")
    }

    const response = await safeFetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Bin-Versioning": "false",
      },
      body: JSON.stringify(newData),
    })

    const result = await response.json()

    await debugLog("JSONBIN", "Successfully updated data", {
      success: true,
      result: result,
      dataKeys: Object.keys(newData),
    })

    // Verify the update by fetching the data back
    setTimeout(async () => {
      try {
        const verificationData = await getBinData()
        await debugLog("JSONBIN", "Data verification after update", {
          originalKeys: Object.keys(newData),
          fetchedKeys: Object.keys(verificationData),
          dataMatches: JSON.stringify(newData) === JSON.stringify(verificationData),
        })
      } catch (verifyError) {
        await debugLog("JSONBIN_ERROR", "Failed to verify data after update", verifyError)
      }
    }, 1000)

    return result
  } catch (error) {
    await debugLog("JSONBIN_ERROR", `Failed to update data (attempt ${retryCount + 1})`, {
      error: error.message,
      retryCount,
      willRetry: retryCount < maxRetries,
    })

    if (retryCount < maxRetries) {
      await debugLog("JSONBIN", `Retrying update in ${(retryCount + 1) * 1000}ms`)
      await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 1000))
      return updateBinData(newData, retryCount + 1)
    }

    throw error
  }
}

// Test JSONBin connectivity
const testJSONBinConnection = async () => {
  await debugLog("JSONBIN_TEST", "Testing JSONBin connectivity")

  try {
    // Test read access
    const data = await getBinData()
    await debugLog("JSONBIN_TEST", "Read test successful", { dataKeys: Object.keys(data) })

    // Test write access with a small update
    const testData = { ...data, lastConnectionTest: Date.now() }
    await updateBinData(testData)
    await debugLog("JSONBIN_TEST", "Write test successful")

    return { success: true, message: "JSONBin connection test passed" }
  } catch (error) {
    await debugLog("JSONBIN_TEST", "Connection test failed", error)
    return { success: false, message: error.message }
  }
}

// --- Enhanced Long Press Title Component ---
const LongPressTitleComponent = ({ onDebugActivate, children, style }) => {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [pressProgress, setPressProgress] = useState(0)
  const longPressTimer = useRef(null)
  const progressAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(1)).current
  const glowAnimation = useRef(new Animated.Value(0)).current

  const LONG_PRESS_DURATION = 5000 // 5 seconds

  const startLongPress = useCallback(() => {
    if (isLongPressing) return

    setIsLongPressing(true)
    setPressProgress(0)

    // Start visual feedback animations
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start()

    // Start progress animation
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: LONG_PRESS_DURATION,
      useNativeDriver: false,
    }).start()

    // Set timer for long press completion
    longPressTimer.current = setTimeout(() => {
      completeLongPress()
    }, LONG_PRESS_DURATION)

    // Update progress indicator
    const progressInterval = setInterval(() => {
      setPressProgress((prev) => {
        const newProgress = prev + 100 / (LONG_PRESS_DURATION / 100)
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return newProgress
      })
    }, 100)

    // Store interval reference for cleanup
    longPressTimer.progressInterval = progressInterval

    debugLog("DEBUG_PANEL", "Long press started", { duration: LONG_PRESS_DURATION })
  }, [isLongPressing])

  const cancelLongPress = useCallback(() => {
    if (!isLongPressing) return

    setIsLongPressing(false)
    setPressProgress(0)

    // Clear timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      if (longPressTimer.progressInterval) {
        clearInterval(longPressTimer.progressInterval)
      }
    }

    // Reset animations
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start()

    debugLog("DEBUG_PANEL", "Long press cancelled", { progress: pressProgress })
  }, [isLongPressing, pressProgress])

  const completeLongPress = useCallback(() => {
    setIsLongPressing(false)
    setPressProgress(100)

    // Success animation
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()

    // Reset glow and progress
    Animated.parallel([
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setPressProgress(0)
    })

    debugLog("DEBUG_PANEL", "Long press completed - activating debug panel")
    onDebugActivate()
  }, [onDebugActivate])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: startLongPress,
    onPanResponderRelease: cancelLongPress,
    onPanResponderTerminate: cancelLongPress,
  })

  const progressColor = progressAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.accentPrimary, COLORS.accentSecondary, COLORS.success],
  })

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  })

  return (
    <View style={[styles.longPressTitleContainer, style]} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.longPressTitleWrapper,
          {
            transform: [{ scale: scaleAnimation }],
          },
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.titleGlowEffect,
            {
              opacity: glowOpacity,
              backgroundColor: progressColor,
            },
          ]}
        />

        {/* Progress indicator */}
        {isLongPressing && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        )}

        {children}

        {/* Visual feedback text */}
        {isLongPressing && (
          <Animated.View
            style={[
              styles.longPressHint,
              {
                opacity: glowAnimation,
              },
            ]}
          >
            <Text style={styles.longPressHintText}>Hold to activate debug mode...</Text>
            <Text style={styles.longPressProgress}>{Math.round(pressProgress)}%</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  )
}

// --- Reusable Components ---
const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>

const CardHeader = ({ title, icon, subtitle, onDisconnect }) => (
  <View style={styles.cardHeaderContainer}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardHeaderTitle}>{title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {onDisconnect && (
          <TouchableOpacity onPress={onDisconnect} style={{ marginRight: 10, padding: 5 }}>
            <FontAwesome5 name="unlink" size={16} color={COLORS.accentPrimaryDarker} />
          </TouchableOpacity>
        )}
        {icon && <FontAwesome5 name={icon} size={16} color={COLORS.accentPrimary} />}
      </View>
    </View>
    {subtitle && <Text style={styles.cardHeaderSubtitle}>{subtitle}</Text>}
  </View>
)

const AppButton = ({ title, onPress, icon, type = "primary", style, disabled = false, loading = false }) => {
  const isPrimary = type === "primary"
  const buttonStyle = [
    styles.btn,
    isPrimary ? styles.btnPrimary : styles.btnSecondary,
    style,
    (disabled || loading) && styles.btnDisabled,
  ]
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.textOnAccent : COLORS.textPrimary} />
      ) : (
        <>
          {icon && (
            <FontAwesome
              name={icon}
              size={14}
              color={isPrimary ? COLORS.textOnAccent : COLORS.accentPrimary}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.btnText, isPrimary ? styles.btnTextPrimary : styles.btnTextSecondary]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const AppTextInput = (props) => <TextInput style={styles.textInput} placeholderTextColor="#B0A5B3" {...props} />

// --- Enhanced Debug Panel Component (No Auto-Close) ---
const DebugPanel = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([])
  const [connectionStatus, setConnectionStatus] = useState(null)
  const slideAnimation = useRef(new Animated.Value(0)).current
  const opacityAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      loadDebugLogs()
      showPanel()
    } else {
      hidePanel()
    }
  }, [visible])

  const showPanel = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const hidePanel = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const loadDebugLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem(DEBUG_STORAGE_KEY)
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs)
        setLogs(parsedLogs.slice(-20)) // Show last 20 logs
        debugLog("DEBUG_PANEL", "Debug logs loaded for viewing", { logCount: parsedLogs.length })
      }
    } catch (error) {
      console.error("Failed to load debug logs:", error)
      debugLog("DEBUG_PANEL_ERROR", "Failed to load debug logs", { error: error.message })
    }
  }

  const testConnection = async () => {
    setConnectionStatus("testing")
    const result = await testJSONBinConnection()
    setConnectionStatus(result.success ? "success" : "failed")
    setTimeout(() => setConnectionStatus(null), 3000)
    loadDebugLogs() // Refresh logs after test
  }

  const clearLogs = async () => {
    try {
      await AsyncStorage.removeItem(DEBUG_STORAGE_KEY)
      setLogs([])
      await debugLog("DEBUG_PANEL", "Debug logs cleared by user")
    } catch (error) {
      console.error("Failed to clear logs:", error)
    }
  }

  const handleExportLogs = async () => {
    await exportDebugLogs()
  }

  if (!visible) return null

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <Animated.View
        style={[
          styles.debugModalOverlay,
          {
            opacity: opacityAnimation,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.debugContainer,
            {
              transform: [
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.debugHeader}>
            <View style={styles.debugTitleContainer}>
              <FontAwesome5 name="bug" size={18} color={COLORS.accentPrimary} />
              <Text style={styles.debugTitle}>Debug Panel</Text>
              <View style={styles.debugStatusIndicator}>
                <View style={[styles.debugStatusDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.debugStatusText}>Active</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.debugCloseButton}>
              <FontAwesome5 name="times" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.debugActions}>
            <TouchableOpacity onPress={testConnection} style={styles.debugButton}>
              <FontAwesome5 name="wifi" size={12} color={COLORS.textOnAccent} />
              <Text style={styles.debugButtonText}>Test API</Text>
              {connectionStatus === "testing" && <ActivityIndicator size="small" color={COLORS.textOnAccent} />}
              {connectionStatus === "success" && <FontAwesome5 name="check" size={12} color={COLORS.success} />}
              {connectionStatus === "failed" && <FontAwesome5 name="times" size={12} color={COLORS.danger} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleExportLogs} style={styles.debugButton}>
              <FontAwesome5 name="share" size={12} color={COLORS.textOnAccent} />
              <Text style={styles.debugButtonText}>Export</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearLogs} style={[styles.debugButton, styles.debugButtonDanger]}>
              <FontAwesome5 name="trash" size={12} color={COLORS.textOnAccent} />
              <Text style={styles.debugButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.debugStatsContainer}>
            <View style={styles.debugStat}>
              <Text style={styles.debugStatValue}>{logs.length}</Text>
              <Text style={styles.debugStatLabel}>Logs</Text>
            </View>
            <View style={styles.debugStat}>
              <Text style={styles.debugStatValue}>{logs.filter((log) => log.category.includes("ERROR")).length}</Text>
              <Text style={styles.debugStatLabel}>Errors</Text>
            </View>
            <View style={styles.debugStat}>
              <Text style={styles.debugStatValue}>
                {logs.filter((log) => log.category === "JSONBIN" || log.category === "API").length}
              </Text>
              <Text style={styles.debugStatLabel}>API Calls</Text>
            </View>
          </View>

          <ScrollView style={styles.debugLogContainer} showsVerticalScrollIndicator={false}>
            {logs.length === 0 ? (
              <View style={styles.noLogsContainer}>
                <FontAwesome5 name="clipboard-list" size={32} color={COLORS.textSecondary} />
                <Text style={styles.noLogsText}>No debug logs available</Text>
                <Text style={styles.noLogsSubText}>Logs will appear here as you use the app</Text>
              </View>
            ) : (
              logs.map((log, index) => (
                <View key={index} style={styles.debugLogEntry}>
                  <View style={styles.debugLogHeader}>
                    <Text style={styles.debugLogTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                    <View
                      style={[
                        styles.debugLogCategoryBadge,
                        {
                          backgroundColor: log.category.includes("ERROR")
                            ? COLORS.danger
                            : log.category.includes("SUCCESS") || log.category === "JSONBIN"
                              ? COLORS.success
                              : COLORS.info,
                        },
                      ]}
                    >
                      <Text style={styles.debugLogCategory}>{log.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.debugLogMessage}>{log.message}</Text>
                  {log.data && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={styles.debugLogData}>{log.data}</Text>
                    </ScrollView>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.debugFooter}>
            <Text style={styles.debugFooterText}>Manual close only • Long press title to reopen</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

// --- Weather Component ---
const LovingWeather = ({ style }) => {
  const [weather, setWeather] = useState(null)
  const [locationName, setLocationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [quote, setQuote] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)

  const WEATHER_STORAGE_KEY = "@AminaAura:weatherData"
  const LOCATION_STORAGE_KEY = "@AminaAura:locationData"

  const pickRandomQuote = (quotes) => quotes[Math.floor(Math.random() * quotes.length)]

  const updateWeatherState = (weatherData, locationName) => {
    const info = getWeatherInfo(weatherData?.weathercode)
    setWeather(weatherData)
    setLocationName(locationName)
    setQuote(pickRandomQuote(info.quotes))
    if (weatherData.timestamp) setLastUpdated(new Date(weatherData.timestamp))
  }

  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const storedWeatherJSON = await AsyncStorage.getItem(WEATHER_STORAGE_KEY)
        const storedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY)
        if (storedWeatherJSON && storedLocation) {
          const storedWeather = JSON.parse(storedWeatherJSON)
          const now = new Date().getTime()
          if (now - storedWeather.timestamp < 3 * 60 * 60 * 1000) {
            updateWeatherState(storedWeather, storedLocation)
          }
        }
      } catch (error) {
        console.error("Error loading cached weather:", error)
      }
    }
    loadFromCache()
  }, [])

  const handleFetchWeather = async () => {
    setLoading(true)
    setPermissionDenied(false)

    try {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        setPermissionDenied(true)
        setLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      const weatherResponse = await safeFetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      )
      const weatherJson = await weatherResponse.json()

      if (weatherJson && weatherJson.current_weather) {
        const updatedTimestamp = new Date()
        const newWeatherData = {
          ...weatherJson.current_weather,
          timestamp: updatedTimestamp.getTime(),
        }
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })

        let newLocationName = "Unknown Location"
        if (geocode && geocode.length > 0) {
          const { city } = geocode[0]
          if (city) newLocationName = city
          else newLocationName = "near you"
        } else {
          newLocationName = "near you"
        }

        updateWeatherState(newWeatherData, newLocationName)
        await AsyncStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(newWeatherData))
        await AsyncStorage.setItem(LOCATION_STORAGE_KEY, newLocationName)
      }
    } catch (error) {
      console.error("Error fetching new weather data:", error)
      Alert.alert("Weather Error", "Could not fetch weather data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (!weather && !loading && !permissionDenied) {
    return (
      <TouchableOpacity onPress={handleFetchWeather} style={[styles.weatherPromptCard, style]}>
        <FontAwesome5 name="map-marker-alt" size={20} color={COLORS.accentPrimary} />
        <Text style={styles.weatherPromptText}>Tap to get your local forecast</Text>
      </TouchableOpacity>
    )
  }

  if (permissionDenied) {
    return (
      <View style={[styles.weatherPromptCard, styles.permissionDeniedCard, style]}>
        <Text style={[styles.weatherPromptText, styles.permissionDeniedText]}>
          Enable location for a loving forecast.
        </Text>
        <AppButton
          title="Try Again"
          icon="map-marker"
          onPress={handleFetchWeather}
          type="secondary"
          style={styles.permissionDeniedButton}
        />
      </View>
    )
  }

  if (loading) {
    return (
      <View
        style={[
          styles.weatherPromptCard,
          {
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      >
        <ActivityIndicator color={COLORS.accentPrimary} />
        <Text style={styles.weatherPromptText}>Fetching weather...</Text>
      </View>
    )
  }

  if (weather) {
    const weatherInfo = getWeatherInfo(weather.weathercode)
    const tempGradient = getTemperatureGradient(weather.temperature)
    const lastUpdatedString = lastUpdated
      ? `Updated: ${lastUpdated.toLocaleString([], {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : ""

    return (
      <LinearGradient colors={tempGradient} style={[styles.weatherCard, style]}>
        <View style={styles.weatherMainContent}>
          <View style={styles.weatherTopRow}>
            <FontAwesome5 name={weatherInfo.icon} size={20} color={COLORS.textPrimary} style={styles.weatherIcon} />
            <Text style={styles.weatherTempText}>
              {Math.round(weather.temperature)}°C in {locationName}
            </Text>
          </View>
          <Text style={styles.weatherQuoteText} numberOfLines={2}>
            {quote}
          </Text>
        </View>
        <View style={styles.weatherFooter}>
          <TouchableOpacity onPress={handleFetchWeather} disabled={loading} style={styles.updateButton}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <FontAwesome5 name="sync-alt" size={12} color={COLORS.textPrimary} />
            )}
          </TouchableOpacity>
          <Text style={styles.updateTimestamp}>{lastUpdatedString}</Text>
        </View>
      </LinearGradient>
    )
  }

  return null
}

// --- Aura Connect Components ---
const AuraConnectCard = ({
  partnerID,
  distance,
  partnerLastUpdate,
  partnerLocationName,
  isLoading,
  handleUpdateAndGetDistance,
  handleDisconnect,
  style,
}) => {
  const formattedDistance =
    distance !== null ? (distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`) : null

  return (
    <LinearGradient colors={["#F3E5F5", "#E1BEE7"]} style={[styles.auraConnectCard, style]}>
      <View style={styles.weatherMainContent}>
        <View style={styles.weatherTopRow}>
          <FontAwesome5 name="link" size={18} color={COLORS.textPrimary} style={styles.weatherIcon} />
          <Text style={styles.weatherTempText}>Connected with {partnerID}</Text>
        </View>
        <View style={styles.distanceDisplay}>
          {formattedDistance !== null ? (
            <>
              <Text style={styles.distanceValue}>{formattedDistance}</Text>
              {partnerLocationName && <Text style={styles.distanceLocationText}>{partnerLocationName}</Text>}
            </>
          ) : (
            <Text style={[styles.distanceInfoText, { paddingHorizontal: 10, fontSize: 12, marginBottom: 0 }]}>
              Ask your partner to update their location!
            </Text>
          )}
        </View>
      </View>
      <View style={styles.weatherFooter}>
        <TouchableOpacity onPress={() => handleUpdateAndGetDistance()} disabled={isLoading} style={styles.updateButton}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.textPrimary} />
          ) : (
            <FontAwesome5 name="sync-alt" size={12} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>
        <Text style={styles.updateTimestamp}>
          {partnerLastUpdate
            ? `Partner updated: ${new Date(partnerLastUpdate).toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "No update yet"}
        </Text>
        <TouchableOpacity onPress={handleDisconnect} style={styles.updateButton}>
          <FontAwesome5 name="unlink" size={12} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const AuraConnectSetupCard = ({
  myUserID,
  partnerCodeInput,
  setPartnerCodeInput,
  isLoading,
  handleConnectPartner,
  handleShareCode,
  setShowSetupModal,
  style,
}) => (
  <View style={[styles.auraConnectSetupCard, style]}>
    <CardHeader title="Aura Connect" icon="connectdevelop" subtitle="Connect with your partner" />
    {myUserID ? (
      <>
        <View style={styles.yourCodeContainer}>
          <Text style={styles.yourCodeText}>
            Your Code: <Text style={styles.codeValueText}>{myUserID}</Text>
          </Text>
          <TouchableOpacity onPress={handleShareCode} style={styles.shareCodeButton}>
            <FontAwesome5 name="share-alt" size={16} color={COLORS.accentPrimaryDarker} />
          </TouchableOpacity>
        </View>
        <View style={styles.connectInputWrapper}>
          <TextInput
            style={styles.connectTextInput}
            placeholder="Enter Partner's Code"
            placeholderTextColor="#B0A5B3"
            value={partnerCodeInput}
            onChangeText={setPartnerCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={handleConnectPartner}
            disabled={isLoading || !partnerCodeInput}
            style={styles.connectActionButton}
          >
            {isLoading ? <ActivityIndicator color="white" /> : <FontAwesome5 name="link" size={16} color="white" />}
          </TouchableOpacity>
        </View>
      </>
    ) : (
      <View style={styles.setupPromptContainer}>
        <Text style={styles.setupPromptText}>
          Create a username to connect with your partner and access shared features.
        </Text>
        <AppButton
          title="Create Username"
          icon="user-plus"
          onPress={() => setShowSetupModal(true)}
          style={styles.createUsernameButton}
        />
      </View>
    )}
  </View>
)

const UsernameSetupModal = ({ isVisible, onSave, isLoading, onCancel }) => {
  const [username, setUsername] = useState("")

  const handleSave = () => {
    onSave(username)
    setUsername("")
  }

  const handleCancel = () => {
    setUsername("")
    if (onCancel) onCancel()
  }

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.setupModalOverlay}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>Welcome to Aura Connect</Text>
          <Text style={styles.setupSubtitle}>Create a unique username to connect with your partner.</Text>
          <AppTextInput
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="characters"
            maxLength={12}
          />
          <AppButton
            title="Save Username"
            icon="check"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading || username.length < 3}
          />
          {onCancel && <AppButton title="Cancel" onPress={handleCancel} type="secondary" style={{ marginTop: 10 }} />}
        </View>
      </View>
    </Modal>
  )
}

// --- Enhanced Mood Palette Component ---
const MoodPalette = ({ myUserID, partnerID, style, setShowSetupModal }) => {
  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)

  const MOOD_DATA_KEY = "moods"

  const fetchMoods = useCallback(async () => {
    if (!myUserID) return
    setLoading(true)

    await debugLog("MOOD", "Fetching moods", { myUserID, partnerID })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const record = await getBinData()
      const moods = record[MOOD_DATA_KEY] || {}

      await debugLog("MOOD", "Moods fetched successfully", {
        totalMoods: Object.keys(moods).length,
        myMoodExists: !!moods[myUserID],
        partnerMoodExists: partnerID ? !!moods[partnerID] : false,
      })

      setMyMood(moods[myUserID] || null)
      if (partnerID) {
        setPartnerMood(moods[partnerID] || null)
      } else {
        setPartnerMood(null)
      }
    } catch (error) {
      await debugLog("MOOD_ERROR", "Failed to fetch moods", error)
      console.error("Error fetching moods:", error)
    } finally {
      setLoading(false)
    }
  }, [myUserID, partnerID])

  useEffect(() => {
    if (myUserID) {
      fetchMoods()
      // Refresh once per day instead of every hour
      const interval = setInterval(fetchMoods, 24 * 60 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [myUserID, fetchMoods])

  const handleSelectMood = async (moodOption) => {
    if (!myUserID) {
      setShowSetupModal(true)
      return
    }

    setLoading(true)
    await debugLog("MOOD", "Setting mood", {
      userID: myUserID,
      mood: moodOption.label,
      emoji: moodOption.emoji,
    })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const record = await getBinData()
      record[MOOD_DATA_KEY] = record[MOOD_DATA_KEY] || {}

      const newMoodData = {
        emoji: moodOption.emoji,
        color: moodOption.color,
        label: moodOption.label,
        timestamp: Date.now(),
      }

      record[MOOD_DATA_KEY][myUserID] = newMoodData

      await debugLog("MOOD", "Updating mood data", {
        userID: myUserID,
        newMoodData,
        totalMoodsInRecord: Object.keys(record[MOOD_DATA_KEY]).length,
      })

      await updateBinData(record)
      setMyMood(newMoodData)
      setShowMoodPicker(false)

      await debugLog("MOOD", "Mood updated successfully", { userID: myUserID, mood: moodOption.label })
      Alert.alert("Mood Updated", `Your mood is set to ${moodOption.label}!`)
    } catch (error) {
      await debugLog("MOOD_ERROR", "Failed to set mood", { userID: myUserID, error: error.message })
      console.error("Error setting mood:", error)
      Alert.alert("Mood Update Failed", `Could not set mood: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!myUserID) {
    return (
      <View style={[styles.compactCard, style]}>
        <View style={styles.compactCardHeader}>
          <FontAwesome5 name="smile" size={16} color={COLORS.accentPrimary} />
          <Text style={styles.compactCardTitle}>Mood Palette</Text>
        </View>
        <View style={styles.featureLockedContainer}>
          <FontAwesome5 name="lock" size={20} color={COLORS.textSecondary} />
          <Text style={styles.featureLockedText}>Create a username to share your mood</Text>
          <AppButton
            title="Create Username"
            icon="user-plus"
            onPress={() => setShowSetupModal(true)}
            type="secondary"
            style={styles.compactButton}
          />
        </View>
      </View>
    )
  }

  const displayMyMood = myMood || {
    emoji: "❓",
    color: COLORS.borderColor,
    label: "Not Set",
  }

  const displayPartnerMood =
    partnerID && partnerMood
      ? partnerMood
      : {
          emoji: "❓",
          color: COLORS.borderColor,
          label: partnerID ? "Not Set" : "No Partner",
        }

  return (
    <View style={[styles.compactCard, style]}>
      <View style={styles.compactCardHeader}>
        <FontAwesome5 name="smile" size={16} color={COLORS.accentPrimary} />
        <Text style={styles.compactCardTitle}>Mood Palette</Text>
        <TouchableOpacity onPress={fetchMoods} disabled={loading} style={styles.compactRefreshButton}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          ) : (
            <FontAwesome5 name="sync-alt" size={12} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.compactMoodsContainer}>
        <View style={styles.compactMoodItem}>
          <TouchableOpacity
            onPress={() => setShowMoodPicker(true)}
            style={[styles.compactMoodDisplay, { backgroundColor: displayMyMood.color }]}
          >
            <Text style={styles.compactMoodEmoji}>{displayMyMood.emoji}</Text>
          </TouchableOpacity>
          <Text style={styles.compactMoodLabel}>You</Text>
          <Text style={styles.compactMoodStatus}>{displayMyMood.label}</Text>
        </View>

        <View style={styles.compactMoodItem}>
          <View style={[styles.compactMoodDisplay, { backgroundColor: displayPartnerMood.color }]}>
            <Text style={styles.compactMoodEmoji}>{displayPartnerMood.emoji}</Text>
          </View>
          <Text style={styles.compactMoodLabel} numberOfLines={1}>
            {partnerID || "Partner"}
          </Text>
          <Text style={styles.compactMoodStatus}>{displayPartnerMood.label}</Text>
        </View>
      </View>

      <Modal visible={showMoodPicker} transparent={true} animationType="fade">
        <View style={styles.setupModalOverlay}>
          <View style={styles.setupContainer}>
            <Text style={styles.setupTitle}>Select Your Mood</Text>
            <ScrollView contentContainerStyle={styles.moodPickerOptions}>
              {MOOD_OPTIONS.map((mood, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.moodOption, { backgroundColor: mood.color }]}
                  onPress={() => handleSelectMood(mood)}
                >
                  <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodOptionLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AppButton title="Cancel" onPress={() => setShowMoodPicker(false)} type="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  )
}

// --- Enhanced Event Card Component with Dynamic Colors and No Overlap ---
const EventCard = ({ event, onEdit, onDelete, isUpcoming }) => {
  const countdown = formatDetailedCountdown(event)
  const urgency = getEventUrgency(event)
  const isEventPassed = urgency === "passed"
  const colorScheme = getEventColorScheme(event.id)

  const getCardColors = () => {
    switch (urgency) {
      case "starting":
        return [COLORS.eventUrgent, "#FFAB91"]
      case "soon":
        return [COLORS.eventSoon, "#FFE0B2"]
      case "today":
        return ["#E3F2FD", "#BBDEFB"]
      case "passed":
        return [COLORS.eventPassed, COLORS.eventPassedSecondary]
      default:
        return colorScheme.colors
    }
  }

  const getBadgeInfo = () => {
    switch (urgency) {
      case "starting":
        return { text: "NOW", color: COLORS.danger, icon: "exclamation" }
      case "soon":
        return { text: "SOON", color: COLORS.warning, icon: "clock" }
      case "today":
        return { text: "TODAY", color: "#1976D2", icon: "calendar-day" }
      case "passed":
        return { text: "PAST", color: COLORS.textSecondary, icon: "history" }
      default:
        return isUpcoming ? { text: "NEXT", color: "#1976D2", icon: "star" } : null
    }
  }

  const cardColors = getCardColors()
  const badgeInfo = getBadgeInfo()
  const textColor =
    urgency === "passed" || urgency === "starting" || urgency === "soon" || urgency === "today"
      ? COLORS.textPrimary
      : colorScheme.textColor

  return (
    <View style={styles.eventCardContainer}>
      <LinearGradient
        colors={cardColors}
        style={[
          styles.enhancedEventCard,
          isUpcoming && styles.upcomingEventCard,
          urgency === "starting" && styles.urgentEventCard,
        ]}
      >
        {badgeInfo && (
          <View style={[styles.priorityBadge, { backgroundColor: badgeInfo.color }]}>
            <FontAwesome5 name={badgeInfo.icon} size={8} color={COLORS.textOnAccent} />
            <Text style={styles.priorityText}>{badgeInfo.text}</Text>
          </View>
        )}

        <View style={styles.enhancedEventHeader}>
          <View style={styles.eventStatusIndicator}>
            <FontAwesome5
              name={isEventPassed ? "clock" : urgency === "starting" ? "exclamation-triangle" : "calendar"}
              size={10}
              color={
                isEventPassed
                  ? COLORS.danger
                  : urgency === "starting"
                    ? COLORS.danger
                    : urgency === "soon"
                      ? COLORS.warning
                      : isUpcoming
                        ? "#1976D2"
                        : textColor
              }
            />
            <Text
              style={[
                styles.eventStatusText,
                {
                  color: isEventPassed
                    ? COLORS.danger
                    : urgency === "starting"
                      ? COLORS.danger
                      : urgency === "soon"
                        ? COLORS.warning
                        : isUpcoming
                          ? "#1976D2"
                          : textColor,
                },
              ]}
            >
              {isEventPassed
                ? "Passed"
                : urgency === "starting"
                  ? "Starting"
                  : urgency === "soon"
                    ? "Soon"
                    : isUpcoming
                      ? "Next"
                      : "Upcoming"}
            </Text>
          </View>
          <View style={styles.eventActionsFixed}>
            <TouchableOpacity onPress={() => onEdit(event)} style={styles.enhancedEventActionButton}>
              <FontAwesome5 name="edit" size={10} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(event.id)} style={styles.enhancedEventActionButton}>
              <FontAwesome5 name="trash" size={10} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.enhancedEventTitle, { color: textColor }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.enhancedCountdownContainer}>
          <Text
            style={[
              styles.enhancedEventCountdown,
              {
                color: isEventPassed
                  ? COLORS.danger
                  : urgency === "starting"
                    ? COLORS.danger
                    : urgency === "soon"
                      ? COLORS.warning
                      : isUpcoming
                        ? "#1976D2"
                        : textColor,
                fontSize: countdown.length > 15 ? 14 : 16,
              },
            ]}
          >
            {countdown}
          </Text>
          {urgency !== "passed" && (
            <Text style={[styles.countdownSubtext, { color: textColor }]}>
              {urgency === "starting" ? "right now" : urgency === "soon" ? "remaining" : "to go"}
            </Text>
          )}
        </View>

        <View style={styles.eventDetailsContainer}>
          <View style={styles.eventDetailRowFull}>
            <FontAwesome5 name="calendar" size={9} color={textColor} />
            <Text style={[styles.eventDetailValue, { color: textColor }]}>
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          {event.time && (
            <View style={styles.eventDetailRowFull}>
              <FontAwesome5 name="clock" size={9} color={textColor} />
              <Text style={[styles.eventDetailValue, { color: textColor }]}>
                {new Date(`2000-01-01T${event.time}`).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          )}

          {event.location && (
            <View style={styles.eventDetailRowFull}>
              <FontAwesome5 name="map-marker-alt" size={9} color={textColor} />
              <Text style={[styles.eventDetailValue, { color: textColor }]} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
        </View>

        {event.notes && event.notes.trim() && (
          <View style={styles.enhancedNotesContainer}>
            <View style={styles.enhancedNotesHeader}>
              <FontAwesome5 name="sticky-note" size={8} color={textColor} />
              <Text style={[styles.enhancedNotesLabel, { color: textColor }]}>Notes</Text>
            </View>
            <Text style={[styles.enhancedEventNotes, { color: textColor }]} numberOfLines={2}>
              {event.notes.trim()}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  )
}

// --- Enhanced Shared Countdown + Event Scheduler Component with Adjacent Buttons ---
const SharedCountdownScheduler = ({ myUserID, partnerID, style, setShowSetupModal }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDate, setEventDate] = useState(new Date())
  const [eventTime, setEventTime] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventNotes, setEventNotes] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const EVENTS_DATA_KEY = "events"

  // Fixed: Use proper pair key generation
  const getPairKey = () => {
    if (!myUserID || !partnerID) return null
    const sortedIDs = [myUserID, partnerID].sort()
    return `${sortedIDs[0]}_${sortedIDs[1]}`
  }

  const handleDeleteEvent = async (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const pairKey = getPairKey()
          if (!pairKey) return

          setLoading(true)
          await debugLog("EVENT", "Deleting event", { eventId, pairKey })

          try {
            const netInfoState = await NetInfo.fetch()
            if (!netInfoState.isConnected) throw new Error("No internet connection.")

            const record = await getBinData()
            record[EVENTS_DATA_KEY] = record[EVENTS_DATA_KEY] || {}
            let pairEvents = record[EVENTS_DATA_KEY][pairKey] || []

            const originalLength = pairEvents.length
            pairEvents = pairEvents.filter((event) => event.id !== eventId)

            await debugLog("EVENT", "Event deletion details", {
              originalLength,
              newLength: pairEvents.length,
              eventRemoved: originalLength > pairEvents.length,
            })

            record[EVENTS_DATA_KEY][pairKey] = pairEvents

            await updateBinData(record)
            setEvents(sortEventsByProximity(pairEvents))

            await debugLog("EVENT", "Event deleted successfully", { eventId })
            Alert.alert("Event Deleted", "The event has been successfully deleted.")
          } catch (error) {
            await debugLog("EVENT_ERROR", "Failed to delete event", { eventId, error: error.message })
            console.error("Error deleting event:", error)
            Alert.alert("Deletion Failed", `Could not delete event: ${error.message}`)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert("Missing Information", "Please enter an event title.")
      return
    }

    const pairKey = getPairKey()
    if (!pairKey) return

    setLoading(true)

    const eventData = {
      id: currentEvent ? currentEvent.id : uuidv4(),
      title: eventTitle.trim(),
      date: eventDate.toISOString().split("T")[0],
      time: eventTime || null,
      location: eventLocation.trim(),
      notes: eventNotes.trim(),
      createdBy: myUserID,
      timestamp: Date.now(),
    }

    await debugLog("EVENT", "Saving event", {
      isEdit: !!currentEvent,
      eventData,
      pairKey,
    })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const record = await getBinData()

      // Ensure events structure exists and is object-based
      if (!record[EVENTS_DATA_KEY] || Array.isArray(record[EVENTS_DATA_KEY])) {
        await debugLog("EVENT", "Converting events structure to pair-based")
        record[EVENTS_DATA_KEY] = {}
      }

      let pairEvents = record[EVENTS_DATA_KEY][pairKey] || []
      const originalLength = pairEvents.length

      if (currentEvent) {
        pairEvents = pairEvents.map((event) => (event.id === currentEvent.id ? eventData : event))
      } else {
        pairEvents = [...pairEvents, eventData]
      }

      // Sort events by proximity to current time
      pairEvents = sortEventsByProximity(pairEvents)

      record[EVENTS_DATA_KEY][pairKey] = pairEvents

      await debugLog("EVENT", "Event save details", {
        originalLength,
        newLength: pairEvents.length,
        isEdit: !!currentEvent,
        eventsSorted: true,
        pairKey,
        dataStructure: "pair-based",
      })

      await updateBinData(record)
      setEvents(pairEvents)
      setModalVisible(false)
      resetForm()

      await debugLog("EVENT", "Event saved successfully", {
        eventId: eventData.id,
        isEdit: !!currentEvent,
      })
      Alert.alert("Success", `Event ${currentEvent ? "updated" : "created"} successfully!`)
    } catch (error) {
      await debugLog("EVENT_ERROR", "Failed to save event", {
        eventData,
        error: error.message,
      })
      console.error("Error saving event:", error)
      Alert.alert("Save Failed", `Could not save event: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = useCallback(async () => {
    const pairKey = getPairKey()
    if (!pairKey) {
      setEvents([])
      return
    }

    setLoading(true)
    await debugLog("EVENT", "Fetching events", { pairKey, myUserID, partnerID })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const record = await getBinData()
      let pairEvents = []

      if (record[EVENTS_DATA_KEY]) {
        if (Array.isArray(record[EVENTS_DATA_KEY])) {
          // Handle old structure - migrate to new structure
          await debugLog("EVENT", "Migrating from old array structure to pair-based structure")

          // Filter events for this pair from the old flat array
          pairEvents = record[EVENTS_DATA_KEY].filter(
            (event) =>
              ((event.createdBy === myUserID || event.createdBy === partnerID) &&
                event.creatorId === myUserID &&
                event.partnerId === partnerID) ||
              (event.creatorId === partnerID && event.partnerId === myUserID) ||
              // Also check for events created by either user in this pair
              event.createdBy === myUserID ||
              event.createdBy === partnerID,
          )

          // Migrate to new structure
          record[EVENTS_DATA_KEY] = {}
          if (pairEvents.length > 0) {
            record[EVENTS_DATA_KEY][pairKey] = pairEvents
            await updateBinData(record)
            await debugLog("EVENT", "Migration completed", {
              migratedEventsCount: pairEvents.length,
              newStructure: true,
            })
          }
        } else {
          // Handle new structure
          pairEvents = record[EVENTS_DATA_KEY][pairKey] || []
          await debugLog("EVENT", "Using existing pair-based structure", {
            pairKey,
            eventsCount: pairEvents.length,
          })
        }
      } else {
        // Initialize events structure if it doesn't exist
        record[EVENTS_DATA_KEY] = {}
        await updateBinData(record)
        await debugLog("EVENT", "Initialized events structure")
      }

      await debugLog("EVENT", "Events fetched successfully", {
        eventsCount: pairEvents.length,
        eventIds: pairEvents.map((e) => e.id),
        pairKey,
      })

      // Sort events by proximity to current time
      const sortedEvents = sortEventsByProximity(pairEvents)
      setEvents(sortedEvents)
    } catch (error) {
      await debugLog("EVENT_ERROR", "Failed to fetch events", {
        pairKey,
        error: error.message,
      })
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }, [myUserID, partnerID])

  useEffect(() => {
    if (myUserID && partnerID) {
      fetchEvents()
      // Refresh once per day instead of every minute
      const interval = setInterval(fetchEvents, 24 * 60 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setEvents([])
    }
  }, [myUserID, partnerID, fetchEvents])

  const resetForm = () => {
    setCurrentEvent(null)
    setEventTitle("")
    setEventDate(new Date())
    setEventTime("")
    setEventLocation("")
    setEventNotes("")
    setShowDatePicker(false)
    setShowTimePicker(false)
  }

  const handleOpenModal = async (event = null) => {
    if (!myUserID) {
      setShowSetupModal(true)
      return
    }

    if (event) {
      await debugLog("EVENT", "Opening edit modal", { eventId: event.id, eventTitle: event.title })
      setCurrentEvent(event)
      setEventTitle(event.title)
      setEventDate(new Date(event.date))
      setEventTime(event.time || "")
      setEventLocation(event.location || "")
      setEventNotes(event.notes || "")
    } else {
      await debugLog("EVENT", "Opening create modal")
      resetForm()
    }
    setModalVisible(true)
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setEventDate(selectedDate)
    }
  }

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false)
    }
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5) // HH:MM format
      setEventTime(timeString)
    }
  }

  const handleModalClose = () => {
    setModalVisible(false)
    resetForm()
  }

  if (!myUserID) {
    return (
      <View style={[styles.compactCard, style]}>
        <View style={styles.compactCardHeader}>
          <FontAwesome5 name="calendar-alt" size={16} color={COLORS.accentPrimary} />
          <Text style={styles.compactCardTitle}>Shared Events</Text>
        </View>
        <View style={styles.featureLockedContainer}>
          <FontAwesome5 name="lock" size={20} color={COLORS.textSecondary} />
          <Text style={styles.featureLockedText}>Create a username to schedule shared events</Text>
          <AppButton
            title="Create Username"
            icon="user-plus"
            onPress={() => setShowSetupModal(true)}
            type="secondary"
            style={styles.compactButton}
          />
        </View>
      </View>
    )
  }

  if (!partnerID) {
    return (
      <View style={[styles.auraConnectPromptCard, style]}>
        <FontAwesome5 name="hourglass-half" size={22} color={COLORS.accentPrimaryDarker} />
        <Text style={styles.auraConnectPromptText}>Connect with your partner to share events!</Text>
      </View>
    )
  }

  return (
    <View style={[styles.compactCard, style]}>
      {/* Enhanced Header with Adjacent Buttons */}
      <View style={styles.enhancedCardHeader}>
        <View style={styles.cardTitleSection}>
          <FontAwesome5 name="calendar-alt" size={16} color={COLORS.accentPrimary} />
          <Text style={styles.compactCardTitle}>Shared Events</Text>
        </View>
        <View style={styles.adjacentButtonsContainer}>
          <TouchableOpacity onPress={fetchEvents} disabled={loading} style={styles.adjacentButton}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <FontAwesome5 name="sync-alt" size={12} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOpenModal()}
            disabled={!myUserID || !partnerID}
            style={[styles.adjacentButton, styles.addButton]}
          >
            <FontAwesome5 name="plus" size={12} color={COLORS.textOnAccent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.enhancedEventCarousel}
      >
        {loading ? (
          <View style={styles.loadingCarousel}>
            <ActivityIndicator size="large" color={COLORS.accentPrimary} />
            <Text style={styles.weatherPromptText}>Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <FontAwesome5 name="calendar-plus" size={28} color={COLORS.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={styles.noEventsText}>No shared events yet!</Text>
            <Text style={styles.noEventsSubText}>Create your first event together.</Text>
          </View>
        ) : (
          events.map((event, index) => {
            const urgency = getEventUrgency(event)
            const isUpcoming = urgency !== "passed" && index === 0

            return (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleOpenModal}
                onDelete={handleDeleteEvent}
                isUpcoming={isUpcoming}
              />
            )
          })
        )}
      </ScrollView>

      {/* Enhanced Event Modal with Time Support */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{currentEvent ? "Edit Event" : "Create New Event"}</Text>
                <TouchableOpacity onPress={handleModalClose} style={styles.modalCloseButton}>
                  <FontAwesome5 name="times" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {/* Event Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <AppTextInput
                    placeholder="Enter event title"
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    style={styles.modalInput}
                  />
                </View>

                {/* Date Section */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
                    <FontAwesome5 name="calendar" size={14} color={COLORS.accentPrimary} />
                    <Text style={styles.dateTimeButtonText}>
                      {eventDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Time Section */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Time (Optional)</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
                    <FontAwesome5 name="clock" size={14} color={COLORS.accentPrimary} />
                    <Text style={styles.dateTimeButtonText}>
                      {eventTime
                        ? new Date(`2000-01-01T${eventTime}`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "Select time"}
                    </Text>
                    {eventTime && (
                      <TouchableOpacity
                        onPress={() => setEventTime("")}
                        style={styles.clearTimeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <FontAwesome5 name="times" size={12} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={eventDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.pickerDoneButton}>
                        <Text style={styles.pickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Time Picker */}
                {showTimePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={eventTime ? new Date(`2000-01-01T${eventTime}`) : new Date()}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                    />
                    {Platform.OS === "ios" && (
                      <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.pickerDoneButton}>
                        <Text style={styles.pickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Location */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <AppTextInput
                    placeholder="Enter location (optional)"
                    value={eventLocation}
                    onChangeText={setEventLocation}
                    style={styles.modalInput}
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    placeholder="Add notes about this event..."
                    value={eventNotes}
                    onChangeText={setEventNotes}
                    multiline
                    numberOfLines={3}
                    style={[styles.modalInput, styles.enhancedNotesInput]}
                    placeholderTextColor="#B0A5B3"
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <AppButton
                  title={currentEvent ? "Update Event" : "Create Event"}
                  icon="save"
                  onPress={handleSaveEvent}
                  loading={loading}
                  disabled={loading || !eventTitle.trim()}
                  style={styles.modalPrimaryButton}
                />
                <AppButton
                  title="Cancel"
                  onPress={handleModalClose}
                  type="secondary"
                  style={styles.modalSecondaryButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// --- Main Screen Component ---
const MainScreen = ({
  myUserID,
  partnerID,
  partnerCodeInput,
  setPartnerCodeInput,
  distance,
  partnerLastUpdate,
  partnerLocationName,
  isLoading,
  handleConnectPartner,
  handleUpdateAndGetDistance,
  handleShareCode,
  handleDisconnect,
  currentQuote,
  handleToggleFavorite,
  isFavorite,
  handleQuoteCardPress,
  handleRefreshQuote,
  fadeAnim,
  setShowFavorites,
  showFavorites,
  favoriteQuotes,
  setShowSetupModal,
  onDebugActivate,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {showFavorites ? (
        <ScrollView contentContainerStyle={styles.screenContainerScrollable}>
          <LinearGradient
            colors={["#FFAB91", "#E57373"]}
            style={[styles.gradientButtonWrapper, styles.mainCardButtonSpacing]}
          >
            <TouchableOpacity onPress={() => setShowFavorites(false)} style={styles.favoritesBackButton}>
              <FontAwesome name={"chevron-left"} size={16} color={COLORS.textOnAccent} style={{ marginRight: 8 }} />
              <Text style={styles.favoritesButtonText}>Back to Daily Quote</Text>
            </TouchableOpacity>
          </LinearGradient>

          <CardHeader title="Favorite Quotes" icon="heart" />
          {favoriteQuotes.map((quote, index) => (
            <LinearGradient
              key={index}
              colors={["#EDE7F6", "#D1C4E9"]}
              style={[styles.favoriteQuoteCard, styles.mainCardNoMargin]}
            >
              <Text style={styles.favoriteQuoteText}>{quote}</Text>
              <TouchableOpacity onPress={() => handleToggleFavorite(quote)} style={styles.favoriteActionBtn}>
                <FontAwesome name="trash" size={16} color={COLORS.accentPrimaryDarker} />
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.screenContainerNoScroll}>
          <TouchableOpacity activeOpacity={1} onPress={handleQuoteCardPress} style={styles.dailyQuoteTouchable}>
            <LinearGradient
              colors={[COLORS.gradientQuoteStart, COLORS.gradientQuoteEnd]}
              style={[styles.dailyQuoteCard, styles.mainCardNoMargin]}
            >
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteHeaderText}>Daily Quote</Text>
                <TouchableOpacity onPress={handleRefreshQuote} style={styles.quoteRefreshButton}>
                  <FontAwesome5 name="sync-alt" size={16} color={COLORS.textOnAccent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleFavorite(currentQuote)} style={styles.quoteFavoriteButton}>
                  <FontAwesome
                    name={isFavorite(currentQuote) ? "heart" : "heart-o"}
                    size={24}
                    color={COLORS.textOnAccent}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.quoteSubtitle}>A new quote will appear each day to inspire you.</Text>
              <View style={styles.quoteBody}>
                <FontAwesome5 name="quote-left" size={20} color={COLORS.textOnAccent} style={{ opacity: 0.6 }} />
                <Animated.Text style={[styles.quoteText, { opacity: fadeAnim }]}>{currentQuote}</Animated.Text>
                <FontAwesome5
                  name="quote-right"
                  size={20}
                  color={COLORS.textOnAccent}
                  style={{ opacity: 0.6, alignSelf: "flex-end" }}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <LovingWeather style={styles.mainCardNoMargin} />
          {myUserID ? (
            partnerID ? (
              <AuraConnectCard
                partnerID={partnerID}
                distance={distance}
                partnerLastUpdate={partnerLastUpdate}
                partnerLocationName={partnerLocationName}
                isLoading={isLoading}
                handleUpdateAndGetDistance={() => handleUpdateAndGetDistance()}
                handleDisconnect={handleDisconnect}
                style={styles.mainCardNoMargin}
              />
            ) : (
              <AuraConnectSetupCard
                myUserID={myUserID}
                partnerCodeInput={partnerCodeInput}
                setPartnerCodeInput={setPartnerCodeInput}
                isLoading={isLoading}
                handleConnectPartner={handleConnectPartner}
                handleShareCode={handleShareCode}
                setShowSetupModal={setShowSetupModal}
                style={styles.mainCardNoMargin}
              />
            )
          ) : (
            <TouchableOpacity
              onPress={() => setShowSetupModal(true)}
              style={[styles.auraConnectPromptCard, styles.mainCardNoMargin]}
            >
              <FontAwesome5 name="connectdevelop" size={22} color={COLORS.accentPrimaryDarker} />
              <Text style={styles.auraConnectPromptText}>Setup Aura Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

// --- Second Screen Component ---
const SecondScreen = ({ myUserID, partnerID, isLoading, setShowSetupModal }) => {
  return (
    <ScrollView contentContainerStyle={styles.screenContainerScrollable}>
      <MoodPalette
        myUserID={myUserID}
        partnerID={partnerID}
        style={styles.mainCardNoMargin}
        setShowSetupModal={setShowSetupModal}
      />
      <SharedCountdownScheduler
        myUserID={myUserID}
        partnerID={partnerID}
        style={styles.mainCardNoMargin}
        setShowSetupModal={setShowSetupModal}
      />
    </ScrollView>
  )
}

// --- Main App Component ---
function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  const insets = useSafeAreaInsets()

  const [currentQuote, setCurrentQuote] = useState("")
  const [favoriteQuotes, setFavoriteQuotes] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [lastPressTime, setLastPressTime] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const [myUserID, setMyUserID] = useState(null)
  const [partnerID, setPartnerID] = useState(null)
  const [partnerCodeInput, setPartnerCodeInput] = useState("")
  const [distance, setDistance] = useState(null)
  const [partnerLastUpdate, setPartnerLastUpdate] = useState(null)
  const [partnerLocationName, setPartnerLocationName] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSetupModalVisible, setSetupModalVisible] = useState(false)

  const [showSecondScreen, setShowSecondScreen] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const screenTransitionAnim = useRef(new Animated.Value(0)).current

  const STORAGE_KEY_FAVORITES = "@AminaAura:favoriteQuotes"
  const STORAGE_KEY_USER = "@AminaAura:auraConnectUser"

  useEffect(() => {
    const updateDailyQuote = () => {
      const today = new Date()
      const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % dailyQuotes.length
      setCurrentQuote(dailyQuotes[dayIndex])
    }

    updateDailyQuote()
    loadFavoriteQuotes()
    initializeApp()

    const dailyUpdateInterval = setInterval(updateDailyQuote, 24 * 60 * 60 * 1000)
    return () => clearInterval(dailyUpdateInterval)
  }, [])

  useEffect(() => {
    Animated.timing(screenTransitionAnim, {
      toValue: showSecondScreen ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start()
  }, [showSecondScreen, screenTransitionAnim])

  // Load debug panel visibility state on app start
  useEffect(() => {
    const loadDebugPanelState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(DEBUG_PANEL_VISIBILITY_KEY)
        if (savedState === "true") {
          setShowDebugPanel(true)
        }
      } catch (error) {
        console.error("Failed to load debug panel state:", error)
      }
    }
    loadDebugPanelState()
  }, [])

  // Save debug panel visibility state
  const saveDebugPanelState = async (isVisible) => {
    try {
      await AsyncStorage.setItem(DEBUG_PANEL_VISIBILITY_KEY, isVisible.toString())
    } catch (error) {
      console.error("Failed to save debug panel state:", error)
    }
  }

  const handleDebugActivate = async () => {
    await debugLog("DEBUG_PANEL", "Debug panel activated via long press")
    setShowDebugPanel(true)
    saveDebugPanelState(true)
  }

  const handleDebugClose = async () => {
    await debugLog("DEBUG_PANEL", "Debug panel closed by user")
    setShowDebugPanel(false)
    saveDebugPanelState(false)
  }

  const initializeApp = async () => {
    setIsLoading(true)
    await debugLog("APP", "Initializing app")

    const userDataJson = await AsyncStorage.getItem(STORAGE_KEY_USER)
    const userData = userDataJson ? JSON.parse(userDataJson) : {}

    await debugLog("APP", "User data loaded", userData)

    if (userData.myUserID) {
      setMyUserID(userData.myUserID)
      if (userData.partnerID) {
        setPartnerID(userData.partnerID)
        handleUpdateAndGetDistance(true, userData.myUserID, userData.partnerID)
      }
    }
    setIsLoading(false)
  }

  const handleSaveUsername = async (newUsername) => {
    if (!newUsername || newUsername.trim().length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters long.")
      return
    }
    const username = newUsername.trim().toUpperCase()

    await debugLog("USER", "Saving username", { username })

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_USER,
        JSON.stringify({
          myUserID: username,
        }),
      )
      setMyUserID(username)
      setSetupModalVisible(false)

      await debugLog("USER", "Username saved successfully", { username })
    } catch (error) {
      await debugLog("USER_ERROR", "Failed to save username", { username, error: error.message })
      Alert.alert("Error", "Could not save username. Please try again.")
      console.error("Error saving username:", error)
    }
  }

  const loadFavoriteQuotes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_FAVORITES)
      if (jsonValue !== null) setFavoriteQuotes(JSON.parse(jsonValue))
    } catch (e) {
      console.error("Failed to load favorite quotes.", e)
    }
  }

  const saveFavoriteQuotes = async (newFavorites) => {
    try {
      const jsonValue = JSON.stringify(newFavorites)
      await AsyncStorage.setItem(STORAGE_KEY_FAVORITES, jsonValue)
      setFavoriteQuotes(newFavorites)
    } catch (e) {
      console.error("Failed to save favorite quotes.", e)
    }
  }

  const isFavorite = (quote) => favoriteQuotes.includes(quote)
  const handleToggleFavorite = (quote) => {
    saveFavoriteQuotes(isFavorite(quote) ? favoriteQuotes.filter((q) => q !== quote) : [...favoriteQuotes, quote])
  }

  const handleQuoteCardPress = () => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300

    if (now - lastPressTime < DOUBLE_PRESS_DELAY) {
      setShowFavorites(true)
      setLastPressTime(0)
    } else {
      setLastPressTime(now)
    }
  }

  const handleRefreshQuote = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      let newQuote = currentQuote
      while (newQuote === currentQuote && dailyQuotes.length > 1) {
        newQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
      }
      setCurrentQuote(newQuote)

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start()
    })
  }

  const handleConnectPartner = async () => {
    if (!myUserID) {
      setSetupModalVisible(true)
      return
    }
    if (!partnerCodeInput) return

    setIsLoading(true)
    await debugLog("PARTNER", "Connecting to partner", {
      myUserID,
      partnerCode: partnerCodeInput.trim().toUpperCase(),
    })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const record = await getBinData()
      const partnerCode = partnerCodeInput.trim().toUpperCase()

      record.locations = record.locations || {}
      record.pairings = record.pairings || {}
      record.moods = record.moods || {}
      record.events = record.events || {}

      record.pairings[myUserID] = partnerCode
      record.pairings[partnerCode] = myUserID

      await debugLog("PARTNER", "Updating pairing data", {
        myUserID,
        partnerCode,
        totalPairings: Object.keys(record.pairings).length,
      })

      await updateBinData(record)
      setPartnerID(partnerCode)
      await AsyncStorage.setItem(
        STORAGE_KEY_USER,
        JSON.stringify({
          myUserID,
          partnerID: partnerCode,
        }),
      )

      await debugLog("PARTNER", "Partner connection successful", { myUserID, partnerCode })
      Alert.alert("Success!", `You are now connected with ${partnerCode}.`)
    } catch (error) {
      await debugLog("PARTNER_ERROR", "Failed to connect partner", {
        myUserID,
        partnerCode: partnerCodeInput.trim().toUpperCase(),
        error: error.message,
      })
      Alert.alert("Connection Failed", error.message)
    } finally {
      setIsLoading(false)
      setPartnerCodeInput("")
    }
  }

  const handleUpdateAndGetDistance = async (
    isInitialLoad = false,
    currentUserID = myUserID,
    currentPartnerID = partnerID,
  ) => {
    if (!currentPartnerID) return
    setIsLoading(true)

    await debugLog("LOCATION", "Updating location and calculating distance", {
      isInitialLoad,
      currentUserID,
      currentPartnerID,
    })

    try {
      const netInfoState = await NetInfo.fetch()
      if (!netInfoState.isConnected) throw new Error("No internet connection.")

      const hasPermission = await requestLocationPermission()
      if (!hasPermission) throw new Error("Permission to access location was denied.")

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      await debugLog("LOCATION", "Current location obtained", { latitude, longitude })

      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      let newPartnerLocationName = "Unknown Location"
      if (geocode && geocode.length > 0) {
        const { city, country, street, name, streetNumber } = geocode[0]
        const addressParts = []
        if (name) addressParts.push(name)
        if (streetNumber && street) addressParts.push(`${streetNumber} ${street}`)
        else if (street) addressParts.push(street)
        if (city) addressParts.push(city)
        if (country) addressParts.push(country)
        newPartnerLocationName = addressParts.filter(Boolean).join(", ")
        if (!newPartnerLocationName) newPartnerLocationName = "near you"
      }

      const record = await getBinData()

      record.locations = {
        ...record.locations,
        [currentUserID]: {
          latitude,
          longitude,
          timestamp: Date.now(),
          locationName: newPartnerLocationName,
        },
      }

      const partnerLocation = record.locations[currentPartnerID]

      await debugLog("LOCATION", "Partner location data", {
        partnerLocationExists: !!partnerLocation,
        partnerLocation: partnerLocation,
      })

      if (partnerLocation?.latitude) {
        const calculatedDistance = getDistance(latitude, longitude, partnerLocation.latitude, partnerLocation.longitude)
        setDistance(calculatedDistance)
        setPartnerLastUpdate(partnerLocation.timestamp)
        setPartnerLocationName(partnerLocation.locationName || null)

        await debugLog("LOCATION", "Distance calculated", {
          distance: calculatedDistance,
          partnerLastUpdate: partnerLocation.timestamp,
        })
      } else {
        setDistance(null)
        setPartnerLastUpdate(null)
        setPartnerLocationName(null)
        if (!isInitialLoad)
          Alert.alert("Waiting for Partner", "Your location is updated. Ask your partner to update their location too!")
      }

      await updateBinData(record)

      if (partnerLocation?.latitude && !isInitialLoad)
        Alert.alert("Updated!", "Your location has been shared and distance calculated.")
    } catch (error) {
      await debugLog("LOCATION_ERROR", "Failed to update location", {
        isInitialLoad,
        error: error.message,
      })
      if (!isInitialLoad) Alert.alert("Update Failed", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareCode = async () => {
    if (!myUserID) return
    try {
      await Share.share({
        message: `Let's connect on Amina's Aura! My code is: ${myUserID}`,
      })
    } catch (error) {
      Alert.alert("Error", "Could not share your code.")
    }
  }

  const handleDisconnect = async () => {
    Alert.alert("Disconnect Partner", "Are you sure you want to disconnect? This will remove your pairing.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          await debugLog("PARTNER", "Disconnecting partner", { myUserID, partnerID })

          setPartnerID(null)
          setDistance(null)
          setPartnerLocationName(null)
          setPartnerLastUpdate(null)
          const userDataJson = await AsyncStorage.getItem(STORAGE_KEY_USER)
          const userData = userDataJson ? JSON.parse(userDataJson) : {}
          delete userData.partnerID
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData))

          await debugLog("PARTNER", "Partner disconnected successfully")
          Alert.alert("Disconnected", "You have successfully disconnected from your partner.")
        },
      },
    ])
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgMain} />
      <View style={styles.header}>
        <LongPressTitleComponent onDebugActivate={handleDebugActivate} style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Amina's Aura</Text>
        </LongPressTitleComponent>
        <TouchableOpacity onPress={() => setShowSecondScreen((prev) => !prev)} style={styles.navButton}>
          <FontAwesome5 name={showSecondScreen ? "heart" : "sliders-h"} size={20} color={COLORS.accentPrimary} />
        </TouchableOpacity>
      </View>

      <UsernameSetupModal
        isVisible={isSetupModalVisible}
        onSave={handleSaveUsername}
        isLoading={isLoading}
        onCancel={() => setSetupModalVisible(false)}
      />

      <DebugPanel visible={showDebugPanel} onClose={handleDebugClose} />

      <Animated.View
        style={[
          styles.mainContentAnimatedWrapper,
          {
            transform: [
              {
                translateX: screenTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -SCREEN_WIDTH],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.mainContentPage}>
          <MainScreen
            myUserID={myUserID}
            partnerID={partnerID}
            partnerCodeInput={partnerCodeInput}
            setPartnerCodeInput={setPartnerCodeInput}
            distance={distance}
            partnerLastUpdate={partnerLastUpdate}
            partnerLocationName={partnerLocationName}
            isLoading={isLoading}
            handleConnectPartner={handleConnectPartner}
            handleUpdateAndGetDistance={handleUpdateAndGetDistance}
            handleShareCode={handleShareCode}
            handleDisconnect={handleDisconnect}
            currentQuote={currentQuote}
            handleToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            handleQuoteCardPress={handleQuoteCardPress}
            handleRefreshQuote={handleRefreshQuote}
            fadeAnim={fadeAnim}
            setShowFavorites={setShowFavorites}
            showFavorites={showFavorites}
            favoriteQuotes={favoriteQuotes}
            setShowSetupModal={setSetupModalVisible}
            onDebugActivate={handleDebugActivate}
          />
        </View>

        <View style={styles.mainContentPage}>
          <SecondScreen
            myUserID={myUserID}
            partnerID={partnerID}
            isLoading={isLoading}
            setShowSetupModal={setSetupModalVisible}
          />
        </View>
      </Animated.View>
    </View>
  )
}

function AppWithSafeArea() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  )
}

export default AppWithSafeArea

// --- Enhanced Styles with Fixed Overlapping and Adjacent Buttons ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgMain,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.bgMain,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 27,
    fontFamily: FONT_FAMILY.playfairBold,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  navButton: {
    padding: 5,
  },
  // Long Press Title Styles
  longPressTitleContainer: {
    position: "relative",
  },
  longPressTitleWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 15,
  },
  titleGlowEffect: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
    zIndex: -1,
  },
  progressContainer: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  longPressHint: {
    position: "absolute",
    top: -35,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  longPressHintText: {
    fontSize: 10,
    color: COLORS.textOnAccent,
    fontFamily: FONT_FAMILY.poppinsRegular,
  },
  longPressProgress: {
    fontSize: 8,
    color: COLORS.textOnAccent,
    fontFamily: FONT_FAMILY.poppinsBold,
    marginTop: 1,
  },
  mainContentAnimatedWrapper: {
    flex: 1,
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
  },
  mainContentPage: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  screenContainerScrollable: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  screenContainerNoScroll: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-evenly",
  },
  mainCardNoMargin: {
    marginBottom: 0,
    marginVertical: 8,
  },
  mainCardButtonSpacing: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  // Enhanced Debug Panel Styles (No Auto-Close)
  debugModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  debugContainer: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "85%",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  debugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  debugTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  debugTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  debugStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: COLORS.borderColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  debugStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  debugStatusText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textSecondary,
  },
  debugCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.borderColor,
  },
  debugActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  debugButton: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 90,
    justifyContent: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonDanger: {
    backgroundColor: COLORS.danger,
  },
  debugButtonText: {
    color: COLORS.textOnAccent,
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsMedium,
  },
  debugStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    paddingVertical: 15,
  },
  debugStat: {
    alignItems: "center",
  },
  debugStatValue: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.accentPrimary,
  },
  debugStatLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  debugLogContainer: {
    maxHeight: 350,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  noLogsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noLogsText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  noLogsSubText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    marginTop: 5,
    textAlign: "center",
  },
  debugLogEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentPrimary,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  debugLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  debugLogTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILY.poppinsRegular,
  },
  debugLogCategoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  debugLogCategory: {
    fontSize: 9,
    color: COLORS.textOnAccent,
    fontFamily: FONT_FAMILY.poppinsBold,
    letterSpacing: 0.5,
  },
  debugLogMessage: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: FONT_FAMILY.poppinsRegular,
    marginBottom: 4,
    lineHeight: 16,
  },
  debugLogData: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    lineHeight: 14,
  },
  debugFooter: {
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  debugFooterText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  // Compact Card Styles for Better Space Utilization
  compactCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  compactCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  compactCardTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: 8,
  },
  compactRefreshButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.borderColor,
  },
  compactMoodsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  compactMoodItem: {
    alignItems: "center",
    flex: 1,
  },
  compactMoodDisplay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactMoodEmoji: {
    fontSize: 28,
  },
  compactMoodLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  compactMoodStatus: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  compactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: "center",
  },
  // Enhanced Card Header with Adjacent Buttons
  enhancedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  adjacentButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adjacentButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.borderColor,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: COLORS.accentPrimary,
  },
  cardHeaderContainer: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    color: COLORS.textPrimary,
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  btnPrimary: {
    backgroundColor: COLORS.accentPrimary,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.accentPrimary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
  },
  btnTextPrimary: {
    color: COLORS.textOnAccent,
  },
  btnTextSecondary: {
    color: COLORS.accentPrimary,
  },
  textInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: 15,
  },
  dailyQuoteTouchable: {
    borderRadius: 20,
    overflow: "hidden",
  },
  dailyQuoteCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 22,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quoteHeaderText: {
    fontSize: 21,
    fontFamily: FONT_FAMILY.playfairBold,
    color: COLORS.textOnAccent,
  },
  quoteFavoriteButton: {
    padding: 5,
  },
  quoteRefreshButton: {
    padding: 5,
    marginLeft: "auto",
    marginRight: 10,
  },
  quoteSubtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textOnAccent,
    opacity: 0.8,
    marginBottom: 20,
  },
  quoteBody: {
    alignItems: "center",
    gap: 15,
  },
  quoteText: {
    fontSize: 19,
    fontFamily: FONT_FAMILY.playfairRegular,
    color: COLORS.textOnAccent,
    textAlign: "center",
    lineHeight: 28,
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
  gradientButtonWrapper: {
    borderRadius: 25,
    overflow: "hidden",
  },
  favoritesBackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  favoritesButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textOnAccent,
  },
  favoriteQuoteCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favoriteQuoteText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.playfairRegular,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 15,
    lineHeight: 22,
  },
  favoriteActionBtn: {
    padding: 8,
  },
  weatherPromptCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  weatherPromptText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  permissionDeniedCard: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
  permissionDeniedText: {
    textAlign: "center",
    marginLeft: 0,
  },
  permissionDeniedButton: {
    marginTop: 10,
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  weatherMainContent: {
    marginBottom: 15,
  },
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  weatherIcon: {
    marginRight: 10,
  },
  weatherTempText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  weatherQuoteText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.playfairRegular,
    color: COLORS.textPrimary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  weatherFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  updateButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  updateTimestamp: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    opacity: 0.7,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  auraConnectCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  distanceDisplay: {
    alignItems: "center",
    marginTop: 5,
  },
  distanceValue: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  distanceLocationText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    opacity: 0.8,
    textAlign: "center",
    marginTop: 2,
  },
  distanceInfoText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    textAlign: "center",
    fontStyle: "italic",
  },
  auraConnectSetupCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  yourCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  yourCodeText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
  },
  codeValueText: {
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.accentPrimary,
  },
  shareCodeButton: {
    padding: 5,
  },
  connectInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  connectTextInput: {
    flex: 1,
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
  },
  connectActionButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 15,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  setupPromptContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  setupPromptText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  createUsernameButton: {
    paddingHorizontal: 20,
  },
  auraConnectPromptCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  auraConnectPromptText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  setupModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  setupContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  setupTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.playfairBold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  setupSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  moodPickerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  moodOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodOptionEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  moodOptionLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  featureLockedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  featureLockedText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginVertical: 15,
    lineHeight: 20,
  },
  // Enhanced Event Card Styles with Fixed Overlapping
  eventCardContainer: {
    marginRight: 15,
    width: 280,
  },
  enhancedEventCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
    minHeight: 200,
  },
  upcomingEventCard: {
    borderWidth: 2,
    borderColor: "#1976D2",
  },
  urgentEventCard: {
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  priorityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  priorityText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY.poppinsBold,
    color: COLORS.textOnAccent,
    letterSpacing: 0.5,
  },
  enhancedEventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingRight: 60, // Ensure space for priority badge
  },
  eventStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  eventStatusText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsBold,
    letterSpacing: 0.5,
  },
  // Fixed event actions to prevent overlap
  eventActionsFixed: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    top: 50, // Position below the priority badge
    right: 12,
    zIndex: 5,
  },
  enhancedEventActionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.4)",
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enhancedEventTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    marginBottom: 12,
    lineHeight: 24,
    paddingRight: 80, // Ensure title doesn't overlap with action buttons
  },
  enhancedCountdownContainer: {
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
  },
  enhancedEventCountdown: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsBold,
    textAlign: "center",
    letterSpacing: 1,
  },
  countdownSubtext: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.poppinsRegular,
    marginTop: 2,
    textAlign: "center",
  },
  eventDetailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  eventDetailRowFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventDetailValue: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    flex: 1,
  },
  enhancedNotesContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  enhancedNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  enhancedNotesLabel: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.poppinsBold,
    letterSpacing: 0.5,
  },
  enhancedEventNotes: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    lineHeight: 16,
  },
  enhancedEventCarousel: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  loadingCarousel: {
    width: 280,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.borderColor,
    borderRadius: 20,
    marginRight: 15,
  },
  noEventsContainer: {
    width: 280,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.borderColor,
    borderRadius: 20,
    marginRight: 15,
    padding: 20,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 5,
  },
  noEventsSubText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  // Enhanced Modal Styles with Time Support
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  enhancedModalContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 25,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.poppinsSemiBold,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.borderColor,
  },
  modalContent: {
    padding: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 0,
  },
  dateTimeButton: {
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dateTimeButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppinsRegular,
    color: COLORS.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  clearTimeButton: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  pickerContainer: {
    backgroundColor: COLORS.borderColor,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  pickerDoneButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  pickerDoneText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.poppinsMedium,
    color: COLORS.textOnAccent,
  },
  enhancedNotesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    padding: 25,
    paddingTop: 15,
    gap: 12,
  },
  modalPrimaryButton: {
    marginBottom: 0,
  },
  modalSecondaryButton: {
    marginBottom: 0,
  },
})

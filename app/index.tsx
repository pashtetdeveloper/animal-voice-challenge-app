import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Audio } from 'expo-av';
import { Play, CheckCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Animal {
  id: number;
  name: string;
  image: string;
  sound: string;
}

const animals: Animal[] = [
  {
    id: 1,
    name: 'cat',
    image: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=300',
    sound: 'meow'
  },
  {
    id: 2,
    name: 'deer',
    image: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=300',
    sound: 'grunt'
  },
  {
    id: 3,
    name: 'horse',
    image: 'https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg?auto=compress&cs=tinysrgb&w=300',
    sound: 'neigh'
  }
];

export default function AnimalVoiceGame() {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [score, setScore] = useState(34);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation values
  const playButtonScale = useSharedValue(1);
  const congratsScale = useSharedValue(0);
  const congratsOpacity = useSharedValue(0);
  const animalScale = useSharedValue(1);

  useEffect(() => {
    startNewRound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startNewRound = () => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    setCurrentAnimal(randomAnimal);
    setGameStarted(false);
    setShowCongrats(false);
    congratsScale.value = 0;
    congratsOpacity.value = 0;
    animalScale.value = 1;
  };

  const playAnimalSound = async () => {
    if (!currentAnimal) return;

    // Animate play button
    playButtonScale.value = withSequence(
      withSpring(0.8),
      withSpring(1)
    );

    setGameStarted(true);

    // Simulate playing animal sound (in a real app, you'd play actual audio files)
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        // For demo purposes, we'll use a placeholder sound
        // In a real app, you'd have actual animal sound files
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true }
      );
      setSound(audioSound);
    } catch (error) {
      console.log('Sound loading error:', error);
      // Continue with visual feedback even if sound fails
    }
  };

  const handleAnimalGuess = (guessedAnimal: Animal) => {
    if (!currentAnimal || !gameStarted) return;

    // Animate the selected animal
    animalScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );

    if (guessedAnimal.id === currentAnimal.id) {
      // Correct guess!
      setScore(prev => prev + 1);
      setShowCongrats(true);
      
      // Animate congrats icon
      congratsScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      congratsOpacity.value = withTiming(1, { duration: 300 });

      // Hide congrats and start new round after delay
      setTimeout(() => {
        congratsOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
          runOnJS(startNewRound)();
        }, 300);
      }, 2000);
    } else {
      // Wrong guess - show feedback
      Alert.alert('Try Again!', 'That\'s not the right animal. Listen carefully!');
    }
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }]
  }));

  const congratsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: congratsScale.value }],
    opacity: congratsOpacity.value
  }));

  const animalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animalScale.value }]
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flagContainer}>
          <View style={[styles.flag, styles.flagBlue]} />
          <View style={[styles.flag, styles.flagYellow]} />
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Play Button */}
        <Animated.View style={[styles.playButtonContainer, playButtonAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={playAnimalSound}
            disabled={!currentAnimal}
          >
            <Play size={40} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Congrats Animation */}
        {showCongrats && (
          <Animated.View style={[styles.congratsContainer, congratsAnimatedStyle]}>
            <CheckCircle size={80} color="#4CAF50" fill="#4CAF50" />
            <Text style={styles.congratsText}>Great Job!</Text>
          </Animated.View>
        )}
      </View>

      {/* Animal Options */}
      <View style={styles.animalsContainer}>
        {animals.map((animal) => (
          <Animated.View key={animal.id} style={animalAnimatedStyle}>
            <TouchableOpacity
              style={styles.animalOption}
              onPress={() => handleAnimalGuess(animal)}
              disabled={!gameStarted}
            >
              <Image
                source={{ uri: animal.image }}
                style={styles.animalImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Instructions */}
      {!gameStarted && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Tap the play button to hear an animal sound, then choose the correct animal!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  flagContainer: {
    flexDirection: 'row',
    width: 40,
    height: 30,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flag: {
    flex: 1,
  },
  flagBlue: {
    backgroundColor: '#0057B7',
  },
  flagYellow: {
    backgroundColor: '#FFD700',
  },
  scoreContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonContainer: {
    marginBottom: 40,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  congratsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  animalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  animalOption: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  animalImage: {
    width: '100%',
    height: '100%',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
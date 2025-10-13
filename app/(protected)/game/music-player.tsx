import { styles } from "@/styles/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MusicPlayerProps {
  audioUrl: any;
}

export default function MusicPlayer({ audioUrl }: MusicPlayerProps) {
  const player = useAudioPlayer(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Update playback status
  useEffect(() => {
    let mounted = true;
    const sub = player.addListener("playbackStatusUpdate", (status) => {
      if (!mounted) return;
      if (status.isLoaded) {
        setPosition(status.currentTime);
        setDuration(status.duration);
      }
      if (status.didJustFinish) {
        if (player.isLoaded) {
          player.pause(); // stop playback
        }
        setIsPlaying(false);
      }
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [player]);

  // For smooth slide bar animation
  useEffect(() => {
    let animationFrame: number;

    const updatePosition = () => {
      if (player.isLoaded && player.playing) {
        setPosition(player.currentTime);
        setDuration(player.duration);
      }
      animationFrame = requestAnimationFrame(updatePosition);
    };

    animationFrame = requestAnimationFrame(updatePosition);

    return () => cancelAnimationFrame(animationFrame);
  }, [player]);

  const handlePress = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      // If song is over, reset to beginning
      if (player.currentTime >= player.duration && player.duration > 0) {
        player.seekTo(0);
        setPosition(0);
      }
      player.play();
      setIsPlaying(true);
    }
  };

  const replaySong = () => {
    player.seekTo(0);
    player.play();
    setIsPlaying(true);
  };

  const handleSeek = (seekTo: number) => {
    if (player.isLoaded) {
      player.pause();
      setIsPlaying(false);
      player.seekTo(seekTo);
    }
    setPosition(seekTo);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          thumbTintColor="#ee2121ff"
          minimumTrackTintColor="#ee2121ff"
          maximumTrackTintColor="#fff"
          style={{ width: "60%", alignSelf: "center", marginTop: 20 }}
        />

        <Text style={styles.smallestText}>
          {formatTime(position)}/{formatTime(duration)}
        </Text>
      </View>

      <View style={styles.songOptionsContainer}>
        <TouchableOpacity onPress={() => setIsRecording(!isRecording)}>
          <Feather
            name="mic"
            size={50}
            color={isRecording ? "#1cb808fa" : "#f1ededfa"}
            style={styles.sideIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePress}>
          <AntDesign
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={80}
            color="#fff"
            style={styles.middleIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={replaySong}>
          <Feather
            name="refresh-ccw"
            size={50}
            color="#f1ededfa"
            style={styles.sideIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

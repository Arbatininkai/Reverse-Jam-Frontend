import { styles } from "@/styles/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { setIsAudioActiveAsync, useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface MusicPlayerProps {
  audioUrl: string;
  recorderState: any;
  startRecording: () => void;
  stopRecording: () => void;
  recordedUri: string | null;
  showRecording?: boolean;
}

export default function MusicPlayer({
  audioUrl,
  recorderState,
  startRecording,
  stopRecording,
  recordedUri,
  showRecording = true,
}: MusicPlayerProps) {
  const player = useAudioPlayer(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRecording = async () => {
      if (!audioUrl || !player) return;
      try {
        // Stop any current playback first
        if (player.isLoaded) {
          await player.pause();
          await setIsAudioActiveAsync(false);
        }

        setIsPlaying(false);
        setPosition(0);
        setIsReady(false);
        player.loop = false;
        await player.remove();

        if (!isMounted) return;

        await player.replace({ uri: audioUrl });

        if (!isMounted) return;

        // Initialize without playing
        await player.seekTo(0);
        player.volume = 1;
        setIsReady(true);
      } catch (err) {
        console.error("Failed to load audio:", err);
      }
    };
    loadRecording();
  }, [audioUrl, player]);

  // Update playback status
  useEffect(() => {
    if (!player || !isReady) return;
    let mounted = true;
    const sub = player.addListener("playbackStatusUpdate", (status) => {
      if (!mounted) return;
      if (!status.isLoaded) return;
      setPosition(status.currentTime);
      setDuration(status.duration);
      if (status.didJustFinish) {
        if (player.isLoaded) {
          player.pause();
          player.seekTo(0);
        }
        setIsPlaying(false);
      }
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [player, isReady]);

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

  const handlePress = async () => {
    if (!isReady) return;

    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
        await setIsAudioActiveAsync(false);
      } else {
        // If song is over, reset to beginning
        if (player.currentTime >= player.duration && player.duration > 0) {
          await player.seekTo(0);
          setPosition(0);
        }
        await setIsAudioActiveAsync(true);
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const replaySong = async () => {
    if (!isReady) return;
    await player.seekTo(0);
    setPosition(0);
    await setIsAudioActiveAsync(true);
    await player.play();
    setIsPlaying(true);
  };

  const handleSeek = async (seekTo: number) => {
    if (!player?.isLoaded) return;

    try {
      player.volume = 0;
      player.play();
      player.pause();
      setIsPlaying(false);
      setIsAudioActiveAsync(false);

      await player.seekTo(seekTo);
      setPosition(seekTo);

      await new Promise((r) => setTimeout(r, 100));

      player.volume = 1;
      setIsAudioActiveAsync(true);
      if (isPlaying) {
        await player.play();
      }
    } catch (err) {
      console.error("Error while seeking:", err);
    }
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
        {isReady && duration > 0 ? (
          <>
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
          </>
        ) : (
          <ActivityIndicator color="white" size={40} />
        )}
      </View>

      <View style={styles.songOptionsContainer}>
        {showRecording && (
          <TouchableOpacity
            onPress={() =>
              recorderState.isRecording ? stopRecording() : startRecording()
            }
            disabled={recordedUri ? true : false}
          >
            <Feather
              name="mic"
              size={50}
              color={
                recorderState.isRecording
                  ? "#1cb808fa"
                  : recordedUri
                  ? "rgba(129, 126, 126, 0.98)"
                  : "#f1ededfa"
              }
              style={styles.sideIcon}
              disabled={recordedUri ? true : false}
            />
          </TouchableOpacity>
        )}

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

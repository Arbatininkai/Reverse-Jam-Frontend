import { MaterialIcons } from "@expo/vector-icons";
import { setIsAudioActiveAsync, useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function RecordingPlayer({ uri: recordedUri }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let didRun = false;
  const player = useAudioPlayer(undefined);

  // Load recording whenever the URI changes
  useEffect(() => {
    const loadRecording = async () => {
      if (didRun) return;
      didRun = true;

      if (!recordedUri || !player) return;

      try {
        setIsLoading(true);
        setIsReady(false);
        setIsPlaying(false);
        setPosition(0);

        // Remove any previously loaded audio
        await player.remove();
        player.loop = false;

        // Replace with new recording
        await player.replace({ uri: recordedUri });
        await player.seekTo(0);
        player.pause();

        let tries = 0;
        while (tries < 20 && (!player.duration || player.duration === 0)) {
          await new Promise((r) => setTimeout(r, 100));
          tries++;
        }

        setIsReady(true);
      } catch (err) {
        console.error("Failed to load audio:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecording();
  }, [recordedUri, player]);

  // Playback listener
  useEffect(() => {
    if (!player || !isReady) return;
    const sub = player.addListener("playbackStatusUpdate", (status) => {
      setPosition(status.currentTime);
      if (status.didJustFinish) {
        if (player.isLoaded) player.pause();
        setIsPlaying(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [player, isReady]);

  // Track playback position
  useEffect(() => {
    if (!player || !isReady) return;
    let animationFrame: number;
    const updatePosition = () => {
      if (player.isLoaded && player.playing) {
        setPosition(player.currentTime);
      }
      animationFrame = requestAnimationFrame(updatePosition);
    };
    animationFrame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrame);
  }, [player, isReady]);

  const handlePlayPause = async () => {
    if (!player || !isReady) return;

    if (isPlaying) {
      await player.pause();
      setIsPlaying(false);
      await setIsAudioActiveAsync(false);
    } else {
      if (player.currentTime >= player.duration && player.duration > 0) {
        await player.seekTo(0);
        setPosition(0);
      }
      await setIsAudioActiveAsync(true);
      await player.play();
      setIsPlaying(true);
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
    <View style={{ marginTop: 20, marginBottom: 20, alignItems: "center" }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <><TouchableOpacity
            onPress={handlePlayPause}
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              backgroundColor: "#ffffff22",
              borderWidth: 4,
              borderColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={60}
              color="white" 
            />
          </TouchableOpacity><Text style={{ color: "white", marginTop: 10 }}>
              {formatTime(position)} / {formatTime(player?.duration || 0)}
            </Text>
        </>
      )}
    </View>
  );
}

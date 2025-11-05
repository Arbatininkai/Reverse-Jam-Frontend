import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { setIsAudioActiveAsync, useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function RecordingPlayer({ uri: recordedUri }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const player = useAudioPlayer(undefined);

  useEffect(() => {
    const loadRecording = async () => {
      if (!recordedUri || !player) return;
      try {
        setIsPlaying(false);
        setPosition(0);
        setIsReady(false);
        player.loop = false;
        await player.remove();
        await player.replace({ uri: recordedUri });

        player.volume = 0;
        player.play();
        player.pause();
        setIsPlaying(false);
        await player.seekTo(0);
        setIsAudioActiveAsync(false);

        let tries = 0;
        while (tries < 20 && (!player.duration || player.duration === 0)) {
          await new Promise((r) => setTimeout(r, 100));
          tries++;
        }
        setIsReady(true);
        setIsLoading(false);
        player.volume = 1;
        setIsAudioActiveAsync(true);
      } catch (err) {
        console.error("Failed to load audio:", err);
      }
    };
    loadRecording();
  }, [recordedUri, player]);

  // Playback listener
  useEffect(() => {
    if (!player || !isReady) return;
    const sub = player.addListener("playbackStatusUpdate", async (status) => {
      setPosition(status.currentTime);
      if (status.didJustFinish) {
        if (player.isLoaded) {
          player.pause();
        }
        setIsPlaying(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [player, isReady]);

  // Update playback position
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
    } else {
      if (player.currentTime >= player.duration && player.duration > 0) {
        await player.seekTo(0);
        setPosition(0);
      }
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
    <View
      style={{
        backgroundColor: "#1cb808fa",
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 8,
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        width: "35%",
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Text style={{ color: "white", fontSize: 12 }}>
            {formatTime(position)} / {formatTime(player?.duration)}
          </Text>
          <Text style={{ color: "white", fontSize: 16 }}>Play Recording</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={{ alignSelf: "center" }}
            >
              <AntDesign
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={40}
                color="#fff"
              />
            </TouchableOpacity>
            <MaterialCommunityIcons name="waveform" size={50} color="white" />
          </View>
        </>
      )}
    </View>
  );
}

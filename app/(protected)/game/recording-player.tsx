import { AntDesign } from "@expo/vector-icons";
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
    let isMounted = true;
    const loadRecording = async () => {
      if (!recordedUri || !player) return;

      try {
        if (player.isLoaded) {
          try {
            await player.pause();
          } catch (err) {
            console.error("Failed to pause audio:", err);
          }
          await setIsAudioActiveAsync(false);
        }

        setIsLoading(true);
        setIsReady(false);
        setIsPlaying(false);
        setPosition(0);

        await player.remove();
        player.loop = false;

        if (!isMounted) return;

        await player.replace({ uri: recordedUri });

        if (!isMounted) return;

        await player.seekTo(0);
        await player.pause();

        let tries = 0;
        while (
          tries < 20 &&
          isMounted &&
          (!player.duration || player.duration === 0)
        ) {
          await new Promise((r) => setTimeout(r, 100));
          tries++;
        }

        if (isMounted) {
          setIsReady(true);
        }
      } catch (err) {
        console.error("Failed to load audio:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
    <View
      style={{
        width: 120,
        height: 110,
        borderRadius: 30,
        backgroundColor: "#983A3A",
        borderWidth: 4,
        marginBottom: 15,
        marginTop: 10,
        borderColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <Text style={{ color: "white", fontSize: 12 }}>
            {formatTime(position)} / {formatTime(player?.duration || 0)}
          </Text>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={{ alignSelf: "center", marginTop: 5 }}
          >
            <AntDesign
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

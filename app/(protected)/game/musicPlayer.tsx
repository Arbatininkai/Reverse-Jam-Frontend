import { styles } from "@/styles/styles";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

const previewUrl =
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/72/a3/ab/72a3ab79-0066-f773-6618-7a53adc250b3/mzaf_17921540907592750976.plus.aac.p.m4a";

export default function MusicPlayer() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = async () => {
    if (!sound) {
      // Create sound if it doesn't exist
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: previewUrl,
      });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <TouchableOpacity onPress={togglePlayPause}>
      {isPlaying ? (
        <AntDesign
          name="pause-circle"
          size={80}
          color="#fff"
          style={styles.middleIcon}
        />
      ) : (
        <AntDesign
          name="play-circle"
          size={80}
          color="#fff"
          style={styles.middleIcon}
        />
      )}
    </TouchableOpacity>
  );
}

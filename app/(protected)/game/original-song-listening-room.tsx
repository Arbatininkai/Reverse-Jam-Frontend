import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { Storage } from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MusicPlayer from "./music-player";

type Track = {
  name: string;
  artist: string;
  url: string;
  originalUrl: string;
  coverUrl?: string;
  lyrics?: string;
};

export default function OriginalSongListeningRoom() {
  const { lobby: signalRLobby } = useSignalR();

  const { id, round } = useLocalSearchParams<{ id: string; round?: string }>();
  const router = useRouter();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const lobbyId = Array.isArray(id) ? id[0] : id;
  const roundIndex =
    typeof round === "string"
      ? Math.max(0, parseInt(round, 10) || 0)
      : signalRLobby?.currentRound || 0;

  useEffect(() => {
    const loadSong = async () => {
      if (!lobbyId) return;
      const storedSongs = await Storage.getItem(`song-${lobbyId}`);
      if (!storedSongs) return;

      try {
        const parsed: Track[] = JSON.parse(storedSongs);
        setTracks(parsed);
        const track = parsed[roundIndex] || parsed[0];
        setCurrentTrack(track);
      } catch {
        console.error("Error parsing songs");
      }
    };

    loadSong();
  }, [lobbyId, roundIndex]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectoinTitleText, { marginTop: 80 }]}>
            Listen To The Original
          </Text>

          {currentTrack && (
            <>
              <Text style={styles.smallerText}>{currentTrack.artist}</Text>
              <Text style={styles.smallerText}>{currentTrack.name}</Text>

              {currentTrack.coverUrl && (
                <Image
                  source={{ uri: currentTrack.coverUrl }}
                  style={{
                    width: 240,
                    height: 240,
                    alignSelf: "center",
                    marginTop: 20,
                    borderRadius: 12,
                  }}
                />
              )}

              <MusicPlayer
                key={currentTrack.originalUrl}
                audioUrl={currentTrack.originalUrl}
                recorderState={{} as any}
                startRecording={() => {}}
                stopRecording={() => {}}
                recordedUri={null}
                showRecording={false}
              />

              <Text style={[styles.smallerText, { marginTop: 20 }]}>
                Lyrics
              </Text>
              <Text
                style={[
                  styles.smallestText,
                  { marginHorizontal: 24, textAlign: "center" },
                ]}
              >
                {currentTrack.lyrics || "Lyrics will appear here."}
              </Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 30 }]}
            onPress={() =>
              router.replace(`../game/listening-room?id=${lobbyId}`)
            }
          >
            <Text style={styles.buttonText}>Go To Voting</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

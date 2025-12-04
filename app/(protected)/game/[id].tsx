import { AuthContext } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";
import { styles } from "@/styles/styles";
import { useLobbyManager } from "@/utils/leaving-manager";
import { Storage } from "@/utils/utils";
import Entypo from "@expo/vector-icons/Entypo";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MusicPlayer from "./music-player";
import RecordingPlayer from "./recording-player";

const API_BASE_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_URL
    : process.env.EXPO_PUBLIC_BASE_URL;

export default function Game() {
  const router = useRouter();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const lobbyId = Array.isArray(id) ? id[0] : id;

  const { handleDeleteLobby, handleLeaveGame } = useLobbyManager();

  const [lobby, setLobby] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const { user } = useContext(AuthContext)!;
  const tokenId = user?.token;

  const { lobby: signalRLobby } = useSignalR();

  // Make it so that the user cannot swipe back to the previous page
  useEffect(() => {
    const backHandler = () => true; // block hardware back
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backHandler
    );
    return () => subscription.remove();
  }, []);

  // Load lobby data from storage
  useEffect(() => {
    if (signalRLobby) {
      setLobby(signalRLobby);
      Storage.setItem(`lobby-${id}`, JSON.stringify(signalRLobby));
    }
  }, [signalRLobby]);

  // Load selected song
  useEffect(() => {
    const loadSong = async () => {
      const storedSongs = await Storage.getItem(`song-${id}`);
      if (storedSongs) {
        setTracks(JSON.parse(storedSongs));
        setCurrentTrack(JSON.parse(storedSongs)[0]);
      }
    };
    loadSong();
  }, [id]);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    if (uri) setRecordedUri(uri);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.log("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const nextSong = () => {
    setCurrentTrack(tracks[currentTrackIndex + 1]);
    setCurrentTrackIndex(currentTrackIndex + 1);
  };

  const submitRecording = async () => {
    try {
      const formData = new FormData();
      formData.append("File", {
        uri: recordedUri,
        name: `recording-${Date.now()}.m4a`,
        type: "audio/m4a",
      } as any);

      //formData.append("OriginalSongLyrics", currentTrack.lyrics);

      const response = await fetch(
        `${API_BASE_URL}/api/Recordings/upload/${id}/${currentTrackIndex}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenId}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed:  " + response);

      // If this is not the final song, go to the next one
      const totalRounds =
        (signalRLobby && signalRLobby.totalRounds) || tracks.length || 1;
      if (currentTrackIndex !== totalRounds - 1) {
        nextSong();
        setRecordedUri(null);
      } else {
        setCurrentTrack(null);
        setRecordedUri(null);
        router.replace(`../game/original-song-listening-room?id=${id}&round=0`);
      }
    } catch (err) {
      console.error("Error uploading recording:", err);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/main-background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (lobby?.players?.length === 1) {
              handleDeleteLobby(lobbyId);
            } else {
              handleLeaveGame(lobbyId);
            }
          }}
        >
          <Entypo name="cross" size={30} color="#ee2121ff" />
          <Text style={styles.leaveText}>Leave Game</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitleText}>Listen And Repeat</Text>

          <Text style={styles.sectionTitleText}>
            Round: {currentTrackIndex + 1}
          </Text>

          {currentTrack && (
            <>
              <Text style={styles.smallerText}>{currentTrack.artist}</Text>
              <Text style={styles.smallerText}>{currentTrack.name}</Text>

              {currentTrack.coverUrl ? (
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
              ) : (
                <ActivityIndicator color="white" />
              )}

              {currentTrack.url ? (
                <MusicPlayer
                  key={currentTrack.url}
                  audioUrl={currentTrack.url}
                  recorderState={recorderState}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  recordedUri={recordedUri}
                />
              ) : (
                <ActivityIndicator color="white" />
              )}

              <Text style={styles.smallestText}>
                {recordedUri
                  ? "Your recording"
                  : "Click on the microphone icon to start recording."}
              </Text>

              {recordedUri && <RecordingPlayer uri={recordedUri} />}

              {recordedUri && (
                <TouchableOpacity
                  onPress={submitRecording}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>
                    {(() => {
                      const totalRounds =
                        (signalRLobby && signalRLobby.totalRounds) ||
                        tracks.length ||
                        1;
                      return currentTrackIndex !== totalRounds - 1
                        ? "Next Track"
                        : "Submit Recordings";
                    })()}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

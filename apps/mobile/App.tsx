import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MeditationLog, MoodOptions } from "@meditation-log/shared";

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function App() {
  const [minutes, setMinutes] = useState("10");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<MeditationLog[]>([]);

  const mood = useMemo(() => MoodOptions[0], []);

  async function fetchLogs() {
    if (!API_URL) {
      return;
    }

    const response = await fetch(`${API_URL}/api/logs`);
    const data = await response.json();
    setLogs(data.logs ?? []);
  }

  useEffect(() => {
    void fetchLogs();
  }, []);

  async function submit() {
    if (!API_URL) {
      Alert.alert("Missing API URL", "Set EXPO_PUBLIC_API_BASE_URL before running the app.");
      return;
    }

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      minutes: Number(minutes),
      mood,
      notes,
    };

    const response = await fetch(`${API_URL}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      Alert.alert("Save failed", "Could not save this meditation session.");
      return;
    }

    setNotes("");
    await fetchLogs();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meditation Log Mobile</Text>
      <Text style={styles.subtitle}>Mood is currently fixed to: {mood}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minutes}
        onChangeText={setMinutes}
        placeholder="Minutes"
      />
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes"
        multiline
      />
      <Button title="Save session" onPress={() => void submit()} />

      <FlatList
        style={styles.list}
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.date}</Text>
            <Text>{item.minutes} minutes • {item.mood}</Text>
            {item.notes ? <Text>{item.notes}</Text> : null}
          </View>
        )}
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  notes: {
    minHeight: 80,
  },
  list: {
    marginTop: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 4,
  },
  cardTitle: {
    fontWeight: "600",
  },
});

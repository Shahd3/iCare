import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";

const API_BASE = "http://192.168.0.177:8000";

const DEFAULT_COORDS = {
  lat: 24.345942,
  lon: 54.539434,
};

async function fetchNearbyPharmacies(lat, lon, radius = 3000) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radius),
  }).toString();

  const res = await fetch(`${API_BASE}/pharmacy/nearby?${params}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export default function PharmacyScreen() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { lat, lon } = DEFAULT_COORDS;
        const data = await fetchNearbyPharmacies(lat, lon, 3000);

        setPharmacies(data.pharmacies || []);
      } catch (err) {
        console.log("Pharmacy fetch error:", err);
        setError("Could not load nearby pharmacies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openMaps = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((e) =>
      console.log("Failed to open maps URL:", e)
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.small}>{item.address || "Abu Dhabi, UAE"}</Text>

      <Text style={styles.small}>Distance: {item.distance_km} km</Text>

      <Text style={styles.small}>
        Opening hours: {item.opening_hours || "N/A"}
      </Text>

      {item.phone && item.phone !== "N/A" && (
        <Text style={styles.small}>Phone: {item.phone}</Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => openMaps(item.maps_url)}
        >
          <Text style={styles.mapBtnText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
      <Text style={styles.headerSub}>
        Based on your current area (approximate). Always confirm location and
        opening hours.
      </Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0D315B" />
          <Text style={styles.loadingText}>Searching around you...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && pharmacies.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No pharmacies found within 3 km.</Text>
        </View>
      )}

      {!loading && !error && pharmacies.length > 0 && (
        <FlatList
          data={pharmacies}
          keyExtractor={(item, idx) => `${item.name}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FCFF",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerTitle: {
    color: "#0D315B",
    fontSize: 22,
    fontWeight: "800",
  },
  headerSub: {
    color: "#1e3b5f",
    opacity: 0.8,
    marginTop: 4,
    marginBottom: 12,
  },
  center: {
    marginTop: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#103A63",
  },
  errorText: {
    color: "#8B0000",
    textAlign: "center",
  },
  emptyText: {
    color: "#103A63",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d7e4f1",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  name: {
    color: "#0D315B",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  small: {
    color: "#103A63",
    fontSize: 13,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  mapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#0D315B",
  },
  mapBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});

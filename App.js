import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState, useEffect, useRef} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [gorev, setGorev] = useState("");
  const [gorevler, setGorevler] = useState([]);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const yuklendi = useRef(false);
  const gorevEkle = () => {
    if (gorev.trim() == "") {
      return;
    }
    setGorevler([
      ...gorevler,
      { id: Date.now(), metin: gorev, tamamlandi: false },
    ]);
    setGorev("");
  };
  const gorevSil = (id) => {
    setGorevler(gorevler.filter((gorev) => gorev.id !== id));
  };
  const gorevTamamla = (id) => {
    setGorevler(
      gorevler.map((gorev) =>
        gorev.id === id ? { ...gorev, tamamlandi: !gorev.tamamlandi } : gorev,
      ),
    );
  };
  const duzenlemeBasla = (id,metin) => {
    setDuzenlenenId(id);
    setGorev(metin);
  };
  const gorevGuncelle = () => {
    if (gorev.trim() == "") {
      return;
    }
    setGorevler(
      gorevler.map((g) =>
        g.id === duzenlenenId ? { ...g, metin: gorev } : g
      )
    );
    setDuzenlenenId(null);
    setGorev("");
  };
  useEffect(() => {
    const gorevleriYukle = async () => {
      const kayitliGorevler = await AsyncStorage.getItem('gorevler');
      if (kayitliGorevler) {
        setGorevler(JSON.parse(kayitliGorevler));
      }
      yuklendi.current = true;
    };
    gorevleriYukle();
  }, []);
  useEffect(() => {
    if (yuklendi.current) {
      AsyncStorage.setItem('gorevler', JSON.stringify(gorevler));
    }
  }, [gorevler]);

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>GÖREVLERİM</Text>
      <View style={styles.inputAlani}>
        <TextInput
          value={gorev}
          onChangeText={setGorev}
          style={styles.input}
          placeholder="Yeni Görev Ekle"
        />
        <TouchableOpacity onPress={duzenlenenId ? gorevGuncelle : gorevEkle} style={styles.buton}>
          <Text style={styles.butonText}>{duzenlenenId ? "Güncelle" : "Ekle"}</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
      <FlatList
        data={gorevler}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.bosListeYazi}>Henüz görev eklenmedi</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.gorevKutu}>
            <Text
              style={[styles.gorevYazi, item.tamamlandi && styles.tamamlandi]}
            >
              {item.metin}
            </Text>
            <View style={styles.butonlar}>
              <TouchableOpacity style={styles.tamamlaButon} onPress={() => gorevTamamla(item.id)}>
                <Text style={styles.butonKucukYazi}>{item.tamamlandi ? "↩" : "✓"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.silButon} onPress={() => gorevSil(item.id)}>
                <Text style={styles.butonKucukYazi}>✗</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.duzenleButon} onPress={() => duzenlemeBasla(item.id, item.metin)}>
                <Text style={styles.butonKucukYazi}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  baslik: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputAlani: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: "center",
  },
  butonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  gorevKutu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  gorevYazi: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  butonlar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  tamamlandi: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  tamamlaButon: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  silButon: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  butonKucukYazi: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  duzenleButon: {
    backgroundColor: '#3498db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bosListeYazi: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
  },
});

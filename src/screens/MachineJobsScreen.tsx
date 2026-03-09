import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { theme } from "../theme";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { jobOrderService } from "../services/JobOrderService";
import { JobOrder } from "../models/JobOrder";
import { JobCompletionScreen } from "./JobCompletionScreen";

export const MachineJobsScreen: React.FC = () => {
  const [scannedMachineId, setScannedMachineId] = useState<string>("");
  const [machineIdInput, setMachineIdInput] = useState<string>("MCH-1001");
  const [openJobs, setOpenJobs] = useState<JobOrder[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // QR okuma durumu ve yetkileri
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleSimulateQRScan = () => {
    setScannedMachineId(machineIdInput);
    loadJobs(machineIdInput);
    setIsScannerActive(false);
  };

  const handleRealQRScan = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Hata", "QR okutmak için kamera iznine ihtiyaç var.");
        return;
      }
    }
    setIsScannerActive(true);
  };

  const handleBarcodeScanned = (scanningResult: any) => {
    const data = scanningResult.data;
    setScannedMachineId(data);
    loadJobs(data);
    setIsScannerActive(false);
    // Ekranda güncellenmesi için simulate field'ını da değiştirebiliriz
    setMachineIdInput(data);
  };

  const loadJobs = (machineId: string) => {
    const jobs = jobOrderService.getOpenJobsForMachine(machineId);
    setOpenJobs(jobs);
  };

  useEffect(() => {
    // Demo amaçlı: 40 gün öncesine ait bir son bakım tarihi vererek takvim bazlı iş emri üretimini tetikliyoruz.
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 40);
    jobOrderService.generateJobsBasedOnCalendar("MCH-1001", pastDate);

    if (jobOrderService.getOpenJobsForMachine("MCH-1001").length === 0) {
      jobOrderService.createJobOrder(
        "MCH-1001",
        "Genel Rutin Kontrol",
        "Sistem başlangıcında atanan rutin kontrol iş emri.",
      );
    }
  }, []);

  // Nếu bir iş seçildiyse JobCompletion modal/ekranını göster
  if (selectedJobId) {
    return (
      <JobCompletionScreen
        jobId={selectedJobId}
        onComplete={() => {
          setSelectedJobId(null);
          loadJobs(scannedMachineId); // Listeyi yenile
        }}
        onCancel={() => setSelectedJobId(null)}
      />
    );
  }

  // Kamera QR ekranı açıksa
  if (isScannerActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraTitle}>Makine QR Kodunu Okutun</Text>
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            />
          </View>
          <Button
            title="İptal - Geri Dön"
            variant="secondary"
            onPress={() => setIsScannerActive(false)}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Akıllı İş Emirleri</Text>
          <Text style={styles.subtitle}>Makine Odası - QR / Lokasyon</Text>
        </View>

        <View style={styles.scanSection}>
          <Button
            title="Gerçek QR Kod Okut (Kamera)"
            onPress={handleRealQRScan}
            style={{ marginBottom: 15 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VEYA (Simülasyon)</Text>
            <View style={styles.dividerLine} />
          </View>

          <Input
            label="Makine ID Elle Girin (Test İçin)"
            value={machineIdInput}
            onChangeText={setMachineIdInput}
          />
          <Button
            title="Bul (Simüle Et)"
            variant="secondary"
            onPress={handleSimulateQRScan}
          />
        </View>

        {scannedMachineId ? (
          <ScrollView style={styles.jobsContainer}>
            <Text style={styles.sectionTitle}>
              {scannedMachineId} İçin Açık İş Emirleri
            </Text>

            {openJobs.length === 0 ? (
              <Text style={styles.noJobsText}>
                Bu makine için açık iş emri bulunmuyor.
              </Text>
            ) : (
              openJobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.jobStatus}>
                      <Text style={styles.jobStatusText}>{job.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.jobDescription}>{job.description}</Text>
                  <Text style={styles.jobDate}>
                    Tarih: {job.createdAt.toLocaleDateString()}
                  </Text>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setSelectedJobId(job.id)}
                  >
                    <Text style={styles.actionButtonText}>Bakımı Tamamla</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              İş emirlerini görmek için lütfen bir makine QR kodunu okutun.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.m },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.m,
  },
  title: { ...theme.typography.header, color: theme.colors.primaryDark },
  subtitle: { ...theme.typography.caption, marginTop: theme.spacing.xs },

  scanSection: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.subtle,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#888",
    fontSize: 12,
  },

  cameraContainer: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: "center",
  },
  cameraTitle: {
    ...theme.typography.header,
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.primaryDark,
  },
  cameraWrapper: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },

  jobsContainer: { flex: 1 },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: "700",
    marginBottom: theme.spacing.m,
  },

  jobCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  jobTitle: {
    ...theme.typography.body,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  jobStatus: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobStatusText: { fontSize: 10, color: "#1976D2", fontWeight: "bold" },
  jobDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  jobDate: { fontSize: 12, color: "#888", marginBottom: theme.spacing.m },

  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.s,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: { color: "white", fontWeight: "bold" },

  noJobsText: {
    textAlign: "center",
    marginTop: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
});

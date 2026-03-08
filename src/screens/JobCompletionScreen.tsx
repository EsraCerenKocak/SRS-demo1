import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { optimizeImage } from '../services/imageOptimizer';
import { jobOrderService } from '../services/JobOrderService';
import { JobStatus } from '../models/JobOrder';

interface Props {
  jobId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const JobCompletionScreen: React.FC<Props> = ({ jobId, onComplete, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState<'before' | 'after' | null>(null);
  
  const [beforePhotoUri, setBeforePhotoUri] = useState<string | null>(null);
  const [afterPhotoUri, setAfterPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Kamera iznine ihtiyacımız var.</Text>
        <Button onPress={requestPermission} title="İzin Ver" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          // Optimize/Compress Image (FR-PMS-03)
          const optimizedUri = await optimizeImage(photo.uri);
          
          if (isCameraActive === 'before') {
            setBeforePhotoUri(optimizedUri);
          } else if (isCameraActive === 'after') {
            setAfterPhotoUri(optimizedUri);
          }
        }
      } catch (e) {
        Alert.alert('Hata', 'Fotoğraf çekilemedi');
      } finally {
        setIsCameraActive(null);
      }
    }
  };

  const handleCompleteJob = () => {
    if (!beforePhotoUri || !afterPhotoUri) {
      Alert.alert('Eksik Bilgi', 'Lütfen öncesi ve sonrası fotoğraflarını çekin.');
      return;
    }
    
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      // İş emri durumunu güncelle
      jobOrderService.updateJobStatus(jobId, JobStatus.COMPLETED);
      setIsUploading(false);
      Alert.alert('Başarılı', 'Bakım tamamlandı ve görseller sisteme kaydedildi.', [
        { text: 'Tamam', onPress: onComplete }
      ]);
    }, 1500);
  };

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelCameraButton} onPress={() => setIsCameraActive(null)}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>İş Emri Tamamlama</Text>
        <Text style={styles.subtitle}>Bakım kanıtı için fotoğraf çekiniz.</Text>

        <View style={styles.photosRow}>
          <TouchableOpacity style={styles.photoBox} onPress={() => setIsCameraActive('before')}>
            {beforePhotoUri ? (
              <Image source={{ uri: beforePhotoUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>+ ÖNCESİ</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoBox} onPress={() => setIsCameraActive('after')}>
            {afterPhotoUri ? (
              <Image source={{ uri: afterPhotoUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>+ SONRASI</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button 
            title="Bakımı Bitir ve Kaydet" 
            onPress={handleCompleteJob} 
            isLoading={isUploading}
            style={{ marginBottom: 16 }}
          />
          {onCancel && (
            <Button 
              title="Geri Dön" 
              variant="secondary" 
              onPress={onCancel} 
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.m },
  title: { ...theme.typography.header, color: theme.colors.primaryDark, marginTop: theme.spacing.xl, textAlign: 'center' },
  subtitle: { ...theme.typography.caption, textAlign: 'center', marginBottom: theme.spacing.xl },
  
  photosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xl },
  photoBox: { width: '48%', aspectRatio: 3/4, backgroundColor: theme.colors.card, borderRadius: theme.borderRadius, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: 'bold' },
  imagePreview: { width: '100%', height: '100%' },
  
  actions: { marginTop: 'auto', marginBottom: theme.spacing.xl },
  
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 50, alignItems: 'center' },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' },
  cancelCameraButton: { position: 'absolute', top: 50, left: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  cancelText: { color: 'white', fontWeight: 'bold' }
});

# Proje Değerlendirme Rehberi: Modül 1 (Teknik Yönetim & Bakım - PMS)

Bu doküman, Modül 1 gereksinimlerinin (FR-PMS-01, FR-PMS-02, FR-PMS-03) projede nasıl yapılandırıldığını ve nasıl test edileceğini gösteren teknik bir değerlendirme rehberidir. Aşağıdaki adımları takip ederek sistemin tüm işlevlerini test edebilir ve ilgili kaynak kodlara ulaşabilirsiniz:

---

### 1️⃣ FR-PMS-01: Akıllı İş Emri (Smart Job Orders)
*Sistem makine çalışma saatine veya takvime göre iş emri oluşturmalı ve Asistan (QR/BLE) ile makine odasına girildiğinde listelemelidir.*

- **Nasıl Test Edilir?**
  1. Uygulamanın alt menüsündeki **"İş Emirleri" (Çanta İkonu)** sekmesine tıklayın.
  2. "Makine ID Onayı (QR Simülasyonu)" alanına `MCH-1001` yazıp **QR Okut (Simüle Et)** butonuna basın.
  3. Ekranda otomatik olarak üretilmiş açık iş emirlerini (Hem saat bazlı hem takvim bazlı) göreceksiniz.
- **İlgili Kodlar Nerede?**
  - **İş Mantığı:** `src/services/JobOrderService.ts` (*Burada `generateJobsBasedOnHours` ve `generateJobsBasedOnCalendar` fonksiyonları mevcuttur.*)
  - **Arayüz:** `src/screens/MachineJobsScreen.tsx`

---

### 2️⃣ FR-PMS-02: Sayaç Validasyonu (Counter Logic)
*Kullanıcı yeni çalışma saati girerken önceki değerden düşük veya mantıksız (günde 25 saat gibi) artışlar engellenmelidir.*

- **Nasıl Test Edilir?**
  1. Ana Ekrandaki **(Sayac)** "Yeni Makine Saati" kutusuna mevcut saatten (örneğin 12000) daha düşük bir sayı yazıp deneyin. Hata verecektir.
  2. **Zaman farkı testi (Mantıksal sınır):** Mevcut saate 1000 saat ekleyip (Örn: 13000) girmeyi deneyin. Sistem, "Son girişten bu yana 1000 saat geçmedi" diyerek (örneğin: `Lokal Hata: Mantıksız değer. X saat içinde Y saat çalışılmış olamaz!`) bu girişi tamamen lokal olarak engelleyecektir.
- **İlgili Kodlar Nerede?**
  - **İş Mantığı:** `src/models/MachineCounter.ts` (*Buradaki `validateNewHoursLocal` fonksiyonu API kullanmadan %100 matematiksel ve lokal çalışır.*)
  - **Arayüz:** `src/screens/MainScreen.tsx` 

---

### 3️⃣ FR-PMS-03: Görsel Kanıt (Visual Evidence)
*Bakım tamamlanırken Öncesi/Sonrası fotoğrafı istenmeli ve sıkıştırılarak gönderilmelidir.*

- **Nasıl Test Edilir?** *(Not: Kameranın açılması için fiziksel telefondan Expo Go ile veya simülatör yerine gerçek cihaz test edilmelidir)*
  1. **"İş Emirleri"** sekmesine gidin ve `MCH-1001` ID'si ile iş emirlerini listeleyin.
  2. Listeden herhangi bir işin altındaki **"Bakımı Tamamla"** butonuna basın.
  3. Karşınıza çıkan ekranda **+ ÖNCESİ** ve **+ SONRASI** kutularına tıklayarak cihazınızın kamerasıyla fotoğraf çekin. Cihaz arka planda resmi %70 oranında sıkıştıracaktır.
  4. "Bakımı Bitir ve Kaydet" diyerek işlemi onaylayabilirsiniz.
- **İlgili Kodlar Nerede?**
  - **İş Mantığı (Sıkıştırma):** `src/services/imageOptimizer.ts` (*`expo-image-manipulator` kullanılarak compress edilir*)
  - **Arayüz ve Kamera İzmi:** `src/screens/JobCompletionScreen.tsx` 

---
*Not: Modül 1 isterleri için API anahtarı zorunluluğu kalktığı için daha önce denenen AI doğrulama yapısı sistemden tamamen arındırılmış, tüm koruma sistemleri yerel (offline) çalışacak şekilde optimize edilmiştir.*

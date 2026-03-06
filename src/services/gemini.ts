export const validateMachineHoursWithGemini = async (
  machineId: string,
  previousHours: number,
  newHours: number
): Promise<{ isValid: boolean; message: string }> => {
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      isValid: false,
      message: 'Gemini API Anahtarı eksik. Lütfen .env dosyasını yapılandırın.',
    };
  }

  const prompt = `
Sen endüstriyel bakım yönetim sisteminde çalışan bir uzman asistan sensör analistisin. 
Makine ID: ${machineId} 
Önceki sayaç saati: ${previousHours} saat 
Yeni girilen sayaç saati: ${newHours} saat.

Görev: Girilen yeni sayacın mantıklı olup olmadığını doğrula. 
Kurallar:
1. Yeni saat önceki saatten küçük olamaz. (Eğer küçükse, geçerli değil de, 'Saçma, sayaç geriye gidemez' gibi bir mesaj ver)
2. İki değer arasındaki fark 24 saat içinde gerçekleşmiş bir girişse, günde 24 saatten fazla artış olamaz. (Şu anki zaman farkını bilmiyoruz ama ekstrem artışları -örn. 1000 saatlik bir zıplama- şüpheli bul)
3. Makine maksimum kapasitesinin makul seviyelerinde olduğunu varsay.

Lütfen sadece bir JSON objesi döndür. Şu formatta olsun (ve başka hiçbir şey veya markdown formatı vs. yazma):
{
  "isValid": true veya false,
  "message": "Kullanıcıya gösterilecek sebebi/onay mesajını Türkçe olarak buraya yaz."
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2, // mantıksal sonuç için düşük temperature
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const textPayload = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // JSON parse etmeye çalış
    const cleanedText = textPayload.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    return {
      isValid: result.isValid,
      message: result.message,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      isValid: false,
      message: 'Gemini API ile doğrulama yapılamadı. Bağlantınızı kontrol edin.',
    };
  }
};

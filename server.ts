import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Lazy getter for GoogleGenAI client to prevent crashing on cold starter / environment validation
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API route for translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { landmarksSequence } = req.body;

      if (!landmarksSequence || landmarksSequence.length === 0) {
        return res.status(400).json({ error: "Missing landmarksSequence" });
      }

      const SIBI_DICTIONARY = [
        { id:"A", desc:"Telapak tangan menghadap depan, jari-jari membentuk huruf A dengan kepalan." },
        { id:"B", desc:"Lima jari lurus rapat, telapak menghadap keluar." },
        { id:"C", desc:"Jari membentuk lengkungan huruf C." },
        { id:"D", desc:"Telunjuk lurus ke atas, jari lain melingkar." },
        { id:"E", desc:"Jari-jari sedikit ditekuk, ibu jari di bawah." },
        { id:"F", desc:"Ibu jari dan telunjuk membentuk lingkaran, tiga jari lainnya lurus." },
        { id:"G", desc:"Telunjuk menunjuk ke samping, ibu jari sejajar." },
        { id:"H", desc:"Telunjuk dan jari tengah lurus ke samping bersama." },
        { id:"I", desc:"Kelingking lurus ke atas, jari lain mengepal." },
        { id:"J", desc:"Kelingking lurus lalu digerakkan melingkar membentuk J." },
        { id:"K", desc:"Telunjuk ke atas, jari tengah condong ke depan, ibu jari di antara keduanya." },
        { id:"L", desc:"Ibu jari dan telunjuk lurus membentuk sudut L." },
        { id:"M", desc:"Tiga jari (telunjuk, tengah, manis) ditekuk di atas ibu jari." },
        { id:"N", desc:"Dua jari (telunjuk, tengah) ditekuk di atas ibu jari." },
        { id:"O", desc:"Semua jari membentuk lingkaran O." },
        { id:"P", desc:"Jari tengah menunjuk ke bawah, ibu jari lurus." },
        { id:"Q", desc:"Ibu jari dan telunjuk menunjuk ke bawah." },
        { id:"R", desc:"Telunjuk dan jari tengah saling menyilang." },
        { id:"S", desc:"Semua jari mengepal, ibu jari di depan jari-jari." },
        { id:"T", desc:"Ibu jari diapit antara telunjuk dan jari tengah." },
        { id:"U", desc:"Telunjuk dan jari tengah lurus ke atas bersama." },
        { id:"V", desc:"Telunjuk dan jari tengah membentuk V." },
        { id:"W", desc:"Tiga jari (telunjuk, tengah, manis) lurus ke atas membentuk W." },
        { id:"X", desc:"Telunjuk dibengkokkan seperti kait." },
        { id:"Y", desc:"Ibu jari dan kelingking lurus ke samping." },
        { id:"Z", desc:"Telunjuk menggambar huruf Z di udara." },
        { id:"0", desc:"Ibu jari dan telunjuk membentuk lingkaran, seperti huruf O." },
        { id:"1", desc:"Telunjuk lurus ke atas." },
        { id:"2", desc:"Dua jari ke atas." },
        { id:"3", desc:"Tiga jari ke atas (ibu jari, telunjuk, tengah)." },
        { id:"4", desc:"Empat jari lurus ke atas, ibu jari ditekuk." },
        { id:"5", desc:"Lima jari lurus terbuka." },
        { id:"6", desc:"Ibu jari dan kelingking lurus, jari lain mengepal." },
        { id:"7", desc:"Telunjuk dan kelingking ke atas." },
        { id:"8", desc:"Ibu jari dan jari tengah bersentuhan, jari lain lurus." },
        { id:"9", desc:"Ibu jari dan telunjuk hampir bersentuhan." },
        { id:"10", desc:"Ibu jari ke atas, tangan diputar." },
        { id:"Halo", desc:"Telapak tangan terbuka dilambaikan." },
        { id:"Terima kasih", desc:"Dua telapak tangan disatukan di depan dada, sedikit membungkuk." },
        { id:"Tolong", desc:"Dua tangan terbuka ke atas, gerakan memohon." },
        { id:"Maaf", desc:"Tangan diletakkan di dada, lalu sedikit digerakkan ke depan." },
        { id:"Ya", desc:"Kepalan tangan digerakkan naik turun." },
        { id:"Tidak", desc:"Telunjuk digerakkan ke kiri dan kanan." },
        { id:"Nama saya", desc:"Telunjuk menunjuk diri sendiri di dada." },
        { id:"Selamat pagi", desc:"Tangan kanan diangkat perlahan dari bawah ke atas sambil terbuka." },
        { id:"Selamat malam", desc:"Tangan digerakkan ke bawah perlahan." },
        { id:"Sampai jumpa", desc:"Tangan dilambaikan berulang." },
        { id:"Ayah", desc:"Ibu jari di pelipis, jari lain terbuka." },
        { id:"Ibu", desc:"Jari kelingking di pipi." },
        { id:"Kakak", desc:"Tangan terbuka di atas kepala." },
        { id:"Adik", desc:"Tangan terbuka di bawah." },
        { id:"Kakek", desc:"Kepalan tangan di dagu, gerakan seperti janggut." },
        { id:"Nenek", desc:"Jari-jari meraba rambut di samping kepala." },
        { id:"Anak", desc:"Kedua tangan bergerak dari atas ke bawah seperti menggendong." },
        { id:"Saudara", desc:"Dua kepalan tangan disentuhkan." },
        { id:"Senang", desc:"Telapak tangan melingkar di pipi, gerakan spiral kecil." },
        { id:"Sedih", desc:"Jari-jari digerakkan turun dari mata." },
        { id:"Marah", desc:"Kepalan tangan digerakkan ke depan dengan tegas." },
        { id:"Takut", desc:"Kedua tangan bergetar di depan dada." },
        { id:"Cinta", desc:"Ibu jari, telunjuk, dan kelingking lurus." },
        { id:"Lapar", desc:"Tangan melingkar di perut." },
        { id:"Capek", desc:"Kedua tangan jatuh ke bawah lemas." },
        { id:"Bingung", desc:"Telunjuk diputar di dekat kepala." },
        { id:"Merah", desc:"Telunjuk menyentuh bibir lalu ditarik ke bawah." },
        { id:"Putih", desc:"Jari-jari terbuka di dada lalu ditarik keluar." },
        { id:"Hitam", desc:"Telunjuk menyentuh alis lalu ditarik ke samping." },
        { id:"Biru", desc:"Tangan dengan jari-jari menunjuk ke langit." },
        { id:"Hijau", desc:"Tangan terbuka digerakkan dari atas ke bawah." },
        { id:"Kuning", desc:"Kepalan tangan Y digerakkan." },
        { id:"Rumah", desc:"Dua tangan membentuk atap di atas kepala." },
        { id:"Sekolah", desc:"Tangan menepuk punggung tangan lain dua kali." },
        { id:"Rumah sakit", desc:"Jari membentuk plus / palang merah di lengan." },
        { id:"Pasar", desc:"Tangan bergerak seperti menukar/menghitung uang." },
        { id:"Kantor", desc:"Kepalan tangan bergerak ke atas seperti membawa tas." },
        { id:"Masjid", desc:"Dua tangan membentuk kubah di atas kepala." },
        { id:"Makan", desc:"Jari-jari rapat dibawa ke mulut berulang." },
        { id:"Minum", desc:"Kepalan tangan diangkat ke mulut seperti memegang gelas." },
        { id:"Tidur", desc:"Telapak tangan ditempelkan ke pipi, kepala miring." },
        { id:"Belajar", desc:"Jari-jari terbuka di atas telapak tangan yang lain." },
        { id:"Bekerja", desc:"Kepalan tangan diputar di depan dada." },
        { id:"Berjalan", desc:"Dua jari berjalan di udara." },
        { id:"Berlari", desc:"Dua jari berjalan cepat di udara." },
        { id:"Menulis", desc:"Jari membuat gerakan menulis di telapak tangan lain." },
        { id:"Membaca", desc:"Dua jari bergerak di atas telapak tangan yang terbuka." },
        { id:"Bermain", desc:"Dua kepalan tangan bergerak bergantian." }
      ];

      const prompt = `[CORE IDENTITY]
Anda adalah STELLA ORBIT, sebuah sistem AI Penerjemah Bahasa Isyarat Inklusif. Misi tunggal Anda adalah membantu rekan-rekan pekerja difabel (Tuli/Bisu) berkomunikasi dengan lancar bersama rekan kerja mereka di lingkungan operasional logistik dan industri.

[REFERENSI KAMUS SIBI (SISTEM ISYARAT BAHASA INDONESIA)]
Untuk membantu Anda memetakan koordinat spasial ke gestur yang tepat, berikut adalah sebagian kamus acuan SIBI:
${SIBI_DICTIONARY.map(d => `- [${d.id}]: ${d.desc}`).join("\n")}

[KETERANGAN TITIK KOORDINAT (21 Keypoints MediaPipe per Tangan)]
0: Pergelangan Tangan (Wrist)
1-4: Ibu Jari (Thumb - Titik 4 adalah Ujung Ibu Jari / Tip)
5-8: Jari Telunjuk (Index - Titik 8 adalah Ujung Telunjuk)
9-12: Jari Tengah (Middle - Titik 12 adalah Ujung Jari Tengah)
13-16: Jari Manis (Ring - Titik 16 adalah Ujung Jari Manis)
17-20: Jari Kelingking (Pinky - Titik 20 adalah Ujung Kelingking)

Panduan Penalaran Spasial:
- Jika jarak y (vertikal) ujung jari (8, 12, 16, 20) lebih kecil dari sendi pangkalnya (5, 9, 13, 17), berarti jari itu sedang diluruskan (extending) ke atas (ingat: nilai y=0 adalah puncak layar/atas).
- Jika jaraknya lebih besar, jari itu ditekuk (bent).
- Jika ujung ibu jari (4) berdekatan (selisih x & y sangat kecil) dengan ujung telunjuk (8), itu membentuk "O" atau "F".
Bandingkan hasil deduksi spasial Anda dengan REFERENSI KAMUS SIBI di atas.
Pilih satu atau lebih gestur yang paling mendekati!

[OPERATIONAL PROTOCOL]
Setiap kali Anda menerima input berupa deskripsi gerakan tangan atau data spasial koordinat (Hand Landmarks), tugas Anda adalah:
1. Analisis pola gerakan spasial tersebut secara menyeluruh dengan mengamati titik-titik ujung jari dan posisinya.
2. Bandingkan pola yang Anda simpulkan dengan REFERENSI KAMUS SIBI di atas. Tetapkan kandidat gestur terkuat.
3. Terjemahkan arti bahasa isyarat tersebut ke dalam satu kalimat bahasa Indonesia yang natural, sopan, dan jelas.
4. Jika terdapat kombinasi gerakan (contoh: membaca dari frame ke frame), rangkai menjadi satu kata/kalimat. Jika gerakan tidak spesifik, buatlah terjemahan paling masuk akal (best effort) dari bentuk tangan. PENTING: Anda dilarang memberikan jawaban "Tidak dikenali", selalu usahakan menerjemahkan walau pun pendekatan (approximation).

[OUTPUT COMPLIANCE]
Anda dilarang keras memberikan teks pengantar atau penutup. Anda WAJIB merespons HANYA dalam format JSON murni terstruktur seperti di bawah ini agar dapat ditampilkan langsung di layar monitor sebagai subtitle:

{
  "gesture_detected": "Deskripsi singkat teknis gestur tangan yang ditangkap",
  "translation_text": "Kalimat hasil terjemahan dalam bahasa Indonesia yang natural"
}

[INPUT DATA]
Berikut adalah sampel keypoints (x,y,z) tangan yang dinormalisasi pada koordinat image 2D dan skala depth. Waktu direkam selama beberapa detik (hingga 5 detik per window). 
Note: x dan y bernilai antara 0 dan 1 (kiri atas adalah 0,0), z merepresentasikan estimasi kedalaman 3D secara relatif.

${JSON.stringify(landmarksSequence)}
`;

      const response = await getGenAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text;
      console.log("Gemini API Raw Output:", responseText);
      let result;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON object found in response");
        }
        result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("JSON parsing error:", e, "Raw output:", responseText);
        return res.status(500).json({ error: "Failed to parse Gemini JSON output", raw: responseText });
      }

      res.json(result);
    } catch (error: any) {
      console.error("Translation error:", error);
      
      // If error is 429 Quota Exceeded, send a friendly warning to the UI
      if (error?.status === 429 || error?.status === 400 || (error.message && error.message.includes("429"))) {
        return res.json({
           gesture_detected: "Rate Limit Exceeded",
           translation_text: "Sistem mencapai batas harian API (Quota Exceeded). Mohon tunggu beberapa saat sebelum mencoba kembali."
        });
      }

      res.status(500).json({ error: error.message || "Translation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

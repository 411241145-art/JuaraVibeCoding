import React, { useState } from 'react';
import { BookOpen, X, Search } from 'lucide-react';

const SIBI_DATA = [
  {cat:"Alfabet",id:"A",hand:"🤚",desc:"Telapak tangan menghadap depan, jari-jari membentuk huruf A dengan kepalan.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"B",hand:"✋",desc:"Lima jari lurus rapat, telapak menghadap keluar.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"C",hand:"🤙",desc:"Jari membentuk lengkungan huruf C.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"D",hand:"👆",desc:"Telunjuk lurus ke atas, jari lain melingkar.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"E",hand:"🤞",desc:"Jari-jari sedikit ditekuk, ibu jari di bawah.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"F",hand:"👌",desc:"Ibu jari dan telunjuk membentuk lingkaran, tiga jari lainnya lurus.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"G",hand:"🫳",desc:"Telunjuk menunjuk ke samping, ibu jari sejajar.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"H",hand:"🫷",desc:"Telunjuk dan jari tengah lurus ke samping bersama.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"I",hand:"🤙",desc:"Kelingking lurus ke atas, jari lain mengepal.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"J",hand:"🤙",desc:"Kelingking lurus lalu digerakkan melingkar membentuk J.",detail:{gerakan:"Dinamis"}},
  {cat:"Alfabet",id:"K",hand:"✌️",desc:"Telunjuk ke atas, jari tengah condong ke depan, ibu jari di antara keduanya.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"L",hand:"🤙",desc:"Ibu jari dan telunjuk lurus membentuk sudut L.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"M",hand:"✊",desc:"Tiga jari (telunjuk, tengah, manis) ditekuk di atas ibu jari.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"N",hand:"✊",desc:"Dua jari (telunjuk, tengah) ditekuk di atas ibu jari.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"O",hand:"🫶",desc:"Semua jari membentuk lingkaran O.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"P",hand:"🤘",desc:"Jari tengah menunjuk ke bawah, ibu jari lurus.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"Q",hand:"🫳",desc:"Ibu jari dan telunjuk menunjuk ke bawah.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"R",hand:"🤞",desc:"Telunjuk dan jari tengah saling menyilang.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"S",hand:"✊",desc:"Semua jari mengepal, ibu jari di depan jari-jari.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"T",hand:"✊",desc:"Ibu jari diapit antara telunjuk dan jari tengah.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"U",hand:"✌️",desc:"Telunjuk dan jari tengah lurus ke atas bersama.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"V",hand:"✌️",desc:"Telunjuk dan jari tengah membentuk V.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"W",hand:"🖖",desc:"Tiga jari (telunjuk, tengah, manis) lurus ke atas membentuk W.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"X",hand:"☝️",desc:"Telunjuk dibengkokkan seperti kait.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"Y",hand:"🤙",desc:"Ibu jari dan kelingking lurus ke samping.",detail:{gerakan:"Statis"}},
  {cat:"Alfabet",id:"Z",hand:"☝️",desc:"Telunjuk menggambar huruf Z di udara.",detail:{gerakan:"Dinamis"}},

  {cat:"Angka",id:"0",hand:"👌",desc:"Ibu jari dan telunjuk membentuk lingkaran.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"1",hand:"☝️",desc:"Telunjuk lurus ke atas.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"2",hand:"✌️",desc:"Dua jari ke atas.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"3",hand:"🖖",desc:"Tiga jari ke atas.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"4",hand:"🖐️",desc:"Empat jari lurus ke atas, ibu jari ditekuk.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"5",hand:"✋",desc:"Lima jari lurus terbuka.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"6",hand:"🤙",desc:"Ibu jari dan kelingking lurus, jari lain mengepal.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"7",hand:"🤘",desc:"Telunjuk dan kelingking ke atas.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"8",hand:"🤌",desc:"Ibu jari dan jari tengah bersentuhan, jari lain lurus.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"9",hand:"🤏",desc:"Ibu jari dan telunjuk hampir bersentuhan.",detail:{gerakan:"Statis"}},
  {cat:"Angka",id:"10",hand:"👍",desc:"Ibu jari ke atas, tangan diputar.",detail:{gerakan:"Dinamis"}},

  {cat:"Umum",id:"Halo",hand:"👋",desc:"Telapak tangan terbuka dilambaikan.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Terima kasih",hand:"🙏",desc:"Dua telapak tangan disatukan di depan dada.",detail:{gerakan:"Statis"}},
  {cat:"Umum",id:"Tolong",hand:"🤲",desc:"Dua tangan terbuka ke atas, gerakan memohon.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Maaf",hand:"🫡",desc:"Tangan diletakkan di dada, lalu sedikit digerakkan ke depan.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Ya",hand:"👍",desc:"Kepalan tangan digerakkan naik turun.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Tidak",hand:"👎",desc:"Telunjuk digerakkan ke kiri dan kanan.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Nama saya",hand:"🫵",desc:"Telunjuk menunjuk diri sendiri di dada.",detail:{gerakan:"Statis"}},
  {cat:"Umum",id:"Selamat pagi",hand:"🌅",desc:"Tangan kanan diangkat perlahan dari bawah ke atas sambil terbuka.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Selamat malam",hand:"🌙",desc:"Tangan digerakkan ke bawah perlahan.",detail:{gerakan:"Dinamis"}},
  {cat:"Umum",id:"Sampai jumpa",hand:"👋",desc:"Tangan dilambaikan berulang.",detail:{gerakan:"Dinamis"}},

  {cat:"Keluarga",id:"Ayah",hand:"🤘",desc:"Ibu jari di pelipis, jari lain terbuka.",detail:{gerakan:"Statis"}},
  {cat:"Keluarga",id:"Ibu",hand:"🤙",desc:"Jari kelingking di pipi.",detail:{gerakan:"Statis"}},
  {cat:"Keluarga",id:"Kakak",hand:"✋",desc:"Tangan terbuka di atas kepala.",detail:{gerakan:"Statis"}},
  {cat:"Keluarga",id:"Adik",hand:"🤚",desc:"Tangan terbuka di bawah.",detail:{gerakan:"Statis"}},
  {cat:"Keluarga",id:"Kakek",hand:"👴",desc:"Kepalan tangan di dagu, gerakan seperti janggut.",detail:{gerakan:"Dinamis"}},
  {cat:"Keluarga",id:"Nenek",hand:"👵",desc:"Jari-jari meraba rambut di samping kepala.",detail:{gerakan:"Dinamis"}},
  {cat:"Keluarga",id:"Anak",hand:"🫶",desc:"Kedua tangan bergerak dari atas ke bawah seperti menggendong.",detail:{gerakan:"Dinamis"}},
  {cat:"Keluarga",id:"Saudara",hand:"🤝",desc:"Dua kepalan tangan disentuhkan.",detail:{gerakan:"Statis"}},

  {cat:"Emosi",id:"Senang",hand:"😊",desc:"Telapak tangan melingkar di pipi, gerakan spiral kecil.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Sedih",hand:"😢",desc:"Jari-jari digerakkan turun dari mata.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Marah",hand:"😤",desc:"Kepalan tangan digerakkan ke depan dengan tegas.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Takut",hand:"😨",desc:"Kedua tangan bergetar di depan dada.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Cinta",hand:"🤟",desc:"Ibu jari, telunjuk, dan kelingking lurus.",detail:{gerakan:"Statis"}},
  {cat:"Emosi",id:"Lapar",hand:"🤌",desc:"Tangan melingkar di perut.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Capek",hand:"😮‍💨",desc:"Kedua tangan jatuh ke bawah lemas.",detail:{gerakan:"Dinamis"}},
  {cat:"Emosi",id:"Bingung",hand:"🤔",desc:"Telunjuk diputar di dekat kepala.",detail:{gerakan:"Dinamis"}},

  {cat:"Tempat",id:"Rumah",hand:"🏠",desc:"Dua tangan membentuk atap di atas kepala.",detail:{gerakan:"Statis"}},
  {cat:"Tempat",id:"Sekolah",hand:"🏫",desc:"Tangan menepuk punggung tangan lain dua kali.",detail:{gerakan:"Dinamis"}},
  {cat:"Tempat",id:"Rumah sakit",hand:"🏥",desc:"Jari membentuk palang merah di lengan.",detail:{gerakan:"Statis"}},
  {cat:"Tempat",id:"Pasar",hand:"🛒",desc:"Tangan bergerak seperti menukar uang.",detail:{gerakan:"Dinamis"}},
  {cat:"Tempat",id:"Kantor",hand:"💼",desc:"Kepalan tangan bergerak ke atas seperti membawa tas.",detail:{gerakan:"Dinamis"}},
  {cat:"Tempat",id:"Masjid",hand:"🕌",desc:"Dua tangan membentuk kubah di atas kepala.",detail:{gerakan:"Statis"}},

  {cat:"Aktivitas",id:"Makan",hand:"🍽️",desc:"Jari-jari rapat dibawa ke mulut berulang.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Minum",hand:"🥤",desc:"Kepalan tangan diangkat ke mulut seperti memegang gelas.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Tidur",hand:"😴",desc:"Telapak tangan ditempelkan ke pipi, kepala miring.",detail:{gerakan:"Statis"}},
  {cat:"Aktivitas",id:"Belajar",hand:"📚",desc:"Jari-jari terbuka di atas telapak tangan yang lain.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Bekerja",hand:"🔧",desc:"Kepalan tangan diputar di depan dada.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Berjalan",hand:"🚶",desc:"Dua jari berjalan di udara.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Berlari",hand:"🏃",desc:"Dua jari berjalan cepat di udara.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Menulis",hand:"✍️",desc:"Jari membuat gerakan menulis di telapak tangan lain.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Membaca",hand:"📖",desc:"Dua jari bergerak di atas telapak tangan yang terbuka.",detail:{gerakan:"Dinamis"}},
  {cat:"Aktivitas",id:"Bermain",hand:"🎮",desc:"Dua kepalan tangan bergerak bergantian.",detail:{gerakan:"Dinamis"}},
];

const CATEGORIES = ["Semua", ...Array.from(new Set(SIBI_DATA.map(d => d.cat)))];

export default function SibiDictionary() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Semua");
  const [selectedWord, setSelectedWord] = useState<typeof SIBI_DATA[0] | null>(null);

  const filteredData = SIBI_DATA.filter(d => {
    const matchCat = activeCat === "Semua" || d.cat === activeCat;
    const matchQ = d.id.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Kamus SIBI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Kamus Isyarat SIBI
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Search & Filter */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari kata atau gestur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCat(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeCat === cat 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid or Empty */}
              {filteredData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>Tidak ada hasil untuk pencarian ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredData.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedWord(item)}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:bg-slate-800 hover:border-emerald-500/50 transition-all group relative"
                    >
                      <div className="text-4xl text-center mb-3 group-hover:scale-110 transition-transform">
                        {item.hand}
                      </div>
                      <div className="text-center font-medium text-slate-200">{item.id}</div>
                      <div className="text-center text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{item.detail.gerakan}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Selected Item Detail Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedWord(null)}>
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedWord(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-7xl mb-6">{selectedWord.hand}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedWord.id}</h3>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono uppercase mb-4">
              {selectedWord.detail.gerakan}
            </span>
            <p className="text-slate-400 text-center leading-relaxed mb-6">
              {selectedWord.desc}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

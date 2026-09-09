package data

import "quranku-backend/models"

var IqroBooks = []models.IqroLevel{
	{
		Level:       1,
		Title:       "Iqro Jilid 1",
		Description: "Mengenal Huruf Tunggal Hijaiyah Berharakat Fathah (A - Ba - Ta - Tsa)",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Huruf Alif & Ba (A - Ba)",
				Guidance: "Bacalah pendek-pendek, jangan diseret. Suara 'A' dibuka mulutnya, 'Ba' dari pertemuan kedua bibir.",
				Letters: []models.IqroLetter{
					{Arab: "اَ", Latin: "A", Makhraj: "Tenggorokan bagian bawah (Tenggorokan paling dalam)"},
					{Arab: "بَ", Latin: "Ba", Makhraj: "Kedua bibir tertutup rapat lalu dibuka"},
					{Arab: "اَ بَ", Latin: "A - Ba", Makhraj: "Kombinasi huruf A dan Ba"},
					{Arab: "بَ اَ", Latin: "Ba - A", Makhraj: "Kombinasi huruf Ba dan A"},
					{Arab: "اَ اَ", Latin: "A - A", Makhraj: "Dua huruf Alif berharakat fathah"},
					{Arab: "بَ بَ", Latin: "Ba - Ba", Makhraj: "Dua huruf Ba berharakat fathah"},
				},
			},
			{
				Page:     2,
				Title:    "Huruf Ta & Tsa (Ta - Tsa)",
				Guidance: "Huruf Ta ujung lidah menyentuh pangkal gigi seri atas. Tsa ujung lidah dikeluarkan sedikit di antara gigi seri.",
				Letters: []models.IqroLetter{
					{Arab: "تَ", Latin: "Ta", Makhraj: "Ujung lidah menempel pada pangkal dua gigi seri atas"},
					{Arab: "ثَ", Latin: "Tsa", Makhraj: "Ujung lidah dikeluarkan sedikit disentuhkan ke ujung gigi seri atas"},
					{Arab: "بَ تَ", Latin: "Ba - Ta", Makhraj: "Kombinasi huruf Ba dan Ta"},
					{Arab: "تَ بَ", Latin: "Ta - Ba", Makhraj: "Kombinasi huruf Ta dan Ba"},
					{Arab: "اَ تَ ثَ", Latin: "A - Ta - Tsa", Makhraj: "Tiga huruf bersambung bacaan pendek"},
					{Arab: "ثَ بَ تَ", Latin: "Tsa - Ba - Ta", Makhraj: "Latihan pembeda titik huruf Ba (1), Ta (2), Tsa (3)"},
				},
			},
			{
				Page:     3,
				Title:    "Huruf Jim, Ha, Kho (Ja - Ha - Kho)",
				Guidance: "Huruf Jim dari tengah lidah, Ha dari tengah tenggorokan bersih, Kho mendengkur halus di atas tenggorokan.",
				Letters: []models.IqroLetter{
					{Arab: "جَ", Latin: "Ja", Makhraj: "Tengah lidah menempel ke langit-langit mulut"},
					{Arab: "حَ", Latin: "Ha", Makhraj: "Tengah tenggorokan, suara bersih tanpa desah kasar"},
					{Arab: "خَ", Latin: "Kho", Makhraj: "Ujung tenggorokan mendekati tekak, suara agak mendengkur"},
					{Arab: "جَ حَ خَ", Latin: "Ja - Ha - Kho", Makhraj: "Kombinasi tiga bentuk serupa beda titik"},
					{Arab: "تَ حَ ثَ", Latin: "Ta - Ha - Tsa", Makhraj: "Variasi Ta, Ha, Tsa"},
					{Arab: "جَ اَ خَ", Latin: "Ja - A - Kho", Makhraj: "Variasi Ja, A, Kho"},
				},
			},
			{
				Page:     4,
				Title:    "Huruf Dal, Dzal, Ro, Zai",
				Guidance: "Bedakan tipis dan tebalnya. Dzal ujung lidah keluar sedikit, Ro bergetar ujung lidah.",
				Letters: []models.IqroLetter{
					{Arab: "دَ", Latin: "Da", Makhraj: "Ujung lidah menempel pada pangkal gigi seri atas"},
					{Arab: "ذَ", Latin: "Dza", Makhraj: "Ujung lidah disentuhkan ke ujung dua gigi seri atas"},
					{Arab: "رَ", Latin: "Ro", Makhraj: "Punggung ujung lidah menyentuh langit-langit depan"},
					{Arab: "زَ", Latin: "Za", Makhraj: "Ujung lidah di atas dua gigi seri bawah (berdesis)"},
					{Arab: "دَ ذَ رَ زَ", Latin: "Da - Dza - Ro - Za", Makhraj: "Latihan empat huruf berurutan"},
					{Arab: "رَ زَ دَ", Latin: "Ro - Za - Da", Makhraj: "Variasi bacaan cepat"},
				},
			},
		},
	},
	{
		Level:       2,
		Title:       "Iqro Jilid 2",
		Description: "Mengenal Huruf Sambung & Bacaan Panjang (Mad Thobi'i 2 Harakat)",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Bentuk Sambung Huruf di Awal, Tengah, dan Akhir",
				Guidance: "Perhatikan perubahan bentuk huruf Ba, Ta, Tsa, Nun, Ya saat bersambung.",
				Letters: []models.IqroLetter{
					{Arab: "بَبَ", Latin: "Ba - Ba", Makhraj: "Dua huruf bersambung pendek"},
					{Arab: "تَبَتَ", Latin: "Ta - Ba - Ta", Makhraj: "Tiga huruf bersambung posisi awal, tengah, akhir"},
					{Arab: "يَتَبَ", Latin: "Ya - Ta - Ba", Makhraj: "Bentuk Ya di awal kalimat"},
					{Arab: "نَبَتَ", Latin: "Na - Ba - Ta", Makhraj: "Bentuk Nun di awal kalimat"},
				},
			},
			{
				Page:     2,
				Title:    "Pengenalan Mad Thobi'i (Fathah diikuti Alif)",
				Guidance: "Bila fathah diikuti alif, dibaca panjang 2 harakat (satu ayunan).",
				Letters: []models.IqroLetter{
					{Arab: "بَا", Latin: "Baa (2 Harakat)", Makhraj: "Dibaca panjang dua harakat"},
					{Arab: "تَا", Latin: "Taa (2 Harakat)", Makhraj: "Dibaca panjang dua harakat"},
					{Arab: "بَادَ", Latin: "Baa - Da", Makhraj: "Huruf pertama panjang, kedua pendek"},
					{Arab: "تَابَ", Latin: "Taa - Ba", Makhraj: "Huruf pertama panjang, kedua pendek"},
					{Arab: "نَادَى", Latin: "Naa - Daa", Makhraj: "Kedua huruf dibaca panjang 2 harakat"},
				},
			},
		},
	},
	{
		Level:       3,
		Title:       "Iqro Jilid 3",
		Description: "Mengenal Harakat Kasrah (I) dan Dhammah (U) Serta Mad Ya & Wawu",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Harakat Kasrah (Bunyi 'I') & Dhammah (Bunyi 'U')",
				Guidance: "Kasrah berbunyi 'I' murni (bukan E). Dhammah berbunyi 'U' murni dengan memonyongkan bibir.",
				Letters: []models.IqroLetter{
					{Arab: "اِ", Latin: "I", Makhraj: "Kasrah bersuara 'I'"},
					{Arab: "اُ", Latin: "U", Makhraj: "Dhammah bersuara 'U' dengan memonyongkan bibir"},
					{Arab: "بِ بُ", Latin: "Bi - Bu", Makhraj: "Ba kasrah dan Ba dhammah"},
					{Arab: "تِ تُ", Latin: "Ti - Tu", Makhraj: "Ta kasrah dan Ta dhammah"},
					{Arab: "سَمِعَ", Latin: "Sa - Mi - 'A", Makhraj: "Latihan variasi Fathah dan Kasrah"},
					{Arab: "كُتِبَ", Latin: "Ku - Ti - Ba", Makhraj: "Latihan variasi Dhammah, Kasrah, Fathah"},
				},
			},
			{
				Page:     2,
				Title:    "Mad Thobi'i Kasrah + Ya Sukun (Ii) dan Dhammah + Wawu Sukun (Uu)",
				Guidance: "Kasrah diikuti Ya sukun dibaca 'Ii' panjang 2 harakat. Dhammah diikuti Wawu sukun dibaca 'Uu' panjang 2 harakat.",
				Letters: []models.IqroLetter{
					{Arab: "فِيْ", Latin: "Fii (2 Harakat)", Makhraj: "Panjang 2 harakat"},
					{Arab: "قِيْلَ", Latin: "Qii - La", Makhraj: "Qii panjang, La pendek"},
					{Arab: "يَقُوْلُ", Latin: "Ya - Quu - Lu", Makhraj: "Quu panjang 2 harakat"},
					{Arab: "تُوْبُوْا", Latin: "Tuu - Buu", Makhraj: "Keduanya panjang 2 harakat"},
				},
			},
		},
	},
	{
		Level:       4,
		Title:       "Iqro Jilid 4",
		Description: "Mengenal Tanwin (An, In, Un) dan Tanda Sukun (Mati)",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Harakat Tanwin (Fathatain, Kasratain, Dhammatain)",
				Guidance: "Tanwin berbunyi seolah diakhiri huruf Nun mati (An, In, Un).",
				Letters: []models.IqroLetter{
					{Arab: "بً", Latin: "Ban", Makhraj: "Fathatain berbunyi -an"},
					{Arab: "بٍ", Latin: "Bin", Makhraj: "Kasratain berbunyi -in"},
					{Arab: "بٌ", Latin: "Bun", Makhraj: "Dhammatain berbunyi -un"},
					{Arab: "عَلِيْمًا", Latin: "'Aliiman", Makhraj: "Lii panjang 2 harakat, Man pendek"},
					{Arab: "غَفُوْرٌ", Latin: "Ghafuurun", Makhraj: "Fuu panjang 2 harakat, Run pendek"},
				},
			},
			{
				Page:     2,
				Title:    "Tanda Sukun / Huruf Mati (Qalqalah & Non-Qalqalah)",
				Guidance: "Huruf Qalqalah (Ba, Jim, Dal, Tha, Qaf) saat sukun memantul. Huruf lainnya tidak memantul.",
				Letters: []models.IqroLetter{
					{Arab: "اَبْ", Latin: "Ab (Memantul)", Makhraj: "Qalqalah Sugra memantul ringan"},
					{Arab: "اَجْ", Latin: "Aj (Memantul)", Makhraj: "Qalqalah Sugra memantul ringan"},
					{Arab: "اَدْ", Latin: "Ad (Memantul)", Makhraj: "Qalqalah Sugra memantul ringan"},
					{Arab: "اَمْ", Latin: "Am (Tidak Memantul)", Makhraj: "Mim mati bibir tertutup rapat"},
					{Arab: "يَعْلَمُ", Latin: "Ya' - La - Mu", Makhraj: "'Ain mati tertahan di tengah tenggorokan"},
				},
			},
		},
	},
	{
		Level:       5,
		Title:       "Iqro Jilid 5",
		Description: "Mengenal Waqaf (Berhenti), Alif Lam Qomariyah & Syamsiyah",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Cara Berhenti (Waqaf) pada Akhir Kalimat",
				Guidance: "Huruf hidup di akhir kalimat disukunkan saat berhenti. Ta Marbuthah menjadi bunyi Ha sukun.",
				Letters: []models.IqroLetter{
					{Arab: "الْعَالَمِيْنَ", Latin: "Al-'Aalamiin (Disukunkan)", Makhraj: "Waqaf huruf akhir disukunkan"},
					{Arab: "رَحْمَةً", Latin: "Rahmah (Menjadi Ha sukun)", Makhraj: "Ta Marbuthah menjadi Ha sukun saat waqaf"},
					{Arab: "اَحَدٌ", Latin: "Ahad (Memantul)", Makhraj: "Dal disukunkan memantul lebih jelas (Qalqalah Kubra)"},
				},
			},
			{
				Page:     2,
				Title:    "Alif Lam Qomariyah (Jelas) & Alif Lam Syamsiyah (Melebur)",
				Guidance: "Al-Qomariyah dibaca jelas huruf L-nya. Al-Syamsiyah langsung masuk ke huruf berikutnya bertasydid.",
				Letters: []models.IqroLetter{
					{Arab: "اَلْحَمْدُ", Latin: "Al-Hamdu (Al-Qomariyah)", Makhraj: "Lam dibaca jelas dan terang"},
					{Arab: "اَلشَّمْسُ", Latin: "Asy-Syamsu (Al-Syamsiyah)", Makhraj: "Lam melebur langsung ke huruf Syin"},
					{Arab: "اَلرَّحْمٰنُ", Latin: "Ar-Rahmaanu (Al-Syamsiyah)", Makhraj: "Lam melebur langsung ke huruf Ro bertasydid"},
				},
			},
		},
	},
	{
		Level:       6,
		Title:       "Iqro Jilid 6",
		Description: "Mengenal Tasydid, Ghunnah, Hukum Nun Mati & Iqlab / Idgham Menuju Al-Qur'an",
		Lessons: []models.IqroLesson{
			{
				Page:     1,
				Title:    "Tasydid pada Huruf Nun & Mim (Ghunnah Musyaddadah)",
				Guidance: "Nun dan Mim bertasydid WAJIB didengungkan selama 2 sampai 3 harakat.",
				Letters: []models.IqroLetter{
					{Arab: "اِنَّ", Latin: "Inna (Dengung 2-3 harakat)", Makhraj: "Ghunnah ditahan di pangkal hidung"},
					{Arab: "ثُمَّ", Latin: "Tsumma (Dengung 2-3 harakat)", Makhraj: "Ghunnah ditahan di pangkal hidung"},
					{Arab: "مِنَ الْجِنَّةِ وَالنَّاسِ", Latin: "Minal jinnati wan-naas", Makhraj: "Latihan membaca ayat utuh ber-Ghunnah"},
				},
			},
			{
				Page:     2,
				Title:    "Persiapan Membaca Mushaf Al-Qur'an (Surah Pendek)",
				Guidance: "Selamat! Anda telah siap membaca Al-Qur'an dengan tartil dan tajwid yang benar.",
				Letters: []models.IqroLetter{
					{Arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", Latin: "Bismillaahir-rahmaanir-rahiim", Makhraj: "Lafadz Basmalah lengkap dengan tajwid tartil"},
					{Arab: "قُلْ هُوَ اللَّهُ أَحَدٌ", Latin: "Qul huwallahu ahad", Makhraj: "Surah Al-Ikhlas ayat 1"},
					{Arab: "اللَّهُ الصَّمَدُ", Latin: "Allaahush-shamad", Makhraj: "Surah Al-Ikhlas ayat 2"},
				},
			},
		},
	},
}

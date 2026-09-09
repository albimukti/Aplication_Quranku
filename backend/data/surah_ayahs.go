package data

import "quranku-backend/models"

var EmbeddedSurahs = map[int][]models.Ayah{
	1: { // Al-Fatihah
		{Number: 1, NumberInSurah: 1, Juz: 1, Page: 1, Arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", Latin: "Bismillaahir-rahmaanir-rahiim", Translation: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 1, Page: 1, Arab: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", Latin: "Alhamdu lillaahi rabbil 'aalamiin", Translation: "Segala puji bagi Allah, Tuhan seluruh alam,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 1, Page: 1, Arab: "الرَّحْمَٰنِ الرَّحِيمِ", Latin: "Ar-rahmaanir-rahiim", Translation: "Yang Maha Pengasih, Maha Penyayang,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3"},
		{Number: 4, NumberInSurah: 4, Juz: 1, Page: 1, Arab: "مَالِكِ يَوْمِ الدِّينِ", Latin: "Maaliki yaumid-diin", Translation: "Pemilik hari pembalasan.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3"},
		{Number: 5, NumberInSurah: 5, Juz: 1, Page: 1, Arab: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", Latin: "Iyyaaka na'budu wa iyyaaka nasta'iin", Translation: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3"},
		{Number: 6, NumberInSurah: 6, Juz: 1, Page: 1, Arab: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", Latin: "Ihdinash-shiraathal mustaqiim", Translation: "Tunjukilah kami jalan yang lurus,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001006.mp3"},
		{Number: 7, NumberInSurah: 7, Juz: 1, Page: 1, Arab: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", Latin: "Shiraathalladziina an'amta 'alaihim ghairil maghdhuubi 'alaihim waladh-dhaalliin", Translation: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3"},
	},
	93: { // Ad-Duha
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 596, Arab: "وَالضُّحَىٰ", Latin: "Wadh-dhuhaa", Translation: "Demi waktu duha (ketika matahari naik sepenggalah),", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/093001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 596, Arab: "وَاللَّيْلِ إِذَا سَجَىٰ", Latin: "Wal-laili idzaa sajaa", Translation: "dan demi malam apabila telah sunyi,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/093002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 596, Arab: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", Latin: "Maa wadda'aka rabbuka wamaa qalaa", Translation: "Tuhanmu tidak meninggalkan engkau (Muhammad) dan tidak (pula) membencimu,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/093003.mp3"},
		{Number: 4, NumberInSurah: 4, Juz: 30, Page: 596, Arab: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ", Latin: "Walal-aakhiratu khairul laka minal-uulaa", Translation: "dan sungguh, yang kemudian itu lebih baik bagimu daripada yang permulaan.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/093004.mp3"},
		{Number: 5, NumberInSurah: 5, Juz: 30, Page: 596, Arab: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", Latin: "Walasaufa yu'thiika rabbuka fatardhaa", Translation: "Dan sungguh, kelak Tuhanmu pasti memberikan karunia-Nya kepadamu, sehingga engkau menjadi puas.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/093005.mp3"},
	},
	94: { // Asy-Syarh
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 596, Arab: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", Latin: "Alam nasyrah laka shadrak", Translation: "Bukankah Kami telah melapangkan dadamu (Muhammad)?", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/094001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 596, Arab: "وَوَضَعْنَا عَنكَ وِزْرَكَ", Latin: "Wawadha'naa 'anka wizrak", Translation: "dan Kami pun telah menurunkan bebanmu darimu,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/094002.mp3"},
		{Number: 5, NumberInSurah: 5, Juz: 30, Page: 596, Arab: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", Latin: "Fa inna ma'al-'usri yusraa", Translation: "Maka sesungguhnya bersama kesulitan ada kemudahan,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/094005.mp3"},
		{Number: 6, NumberInSurah: 6, Juz: 30, Page: 596, Arab: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", Latin: "Inna ma'al-'usri yusraa", Translation: "sesungguhnya bersama kesulitan ada kemudahan.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/094006.mp3"},
	},
	97: { // Al-Qadr
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 598, Arab: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", Latin: "Innaa anzalnaahu fii lailatil-qadr", Translation: "Sesungguhnya Kami telah menurunkannya (Al-Qur'an) pada malam qadar.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/097001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 598, Arab: "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ", Latin: "Wamaa adraaka maa lailatul-qadr", Translation: "Dan tahukah kamu apakah malam kemuliaan itu?", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/097002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 598, Arab: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ", Latin: "Lailatul-qadri khairum min alfi syahr", Translation: "Malam kemuliaan itu lebih baik daripada seribu bulan.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/097003.mp3"},
	},
	103: { // Al-'Asr
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 601, Arab: "وَالْعَصْرِ", Latin: "Wal-'ashr", Translation: "Demi masa,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/103001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 601, Arab: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", Latin: "Innal-insaana lafii khusr", Translation: "sungguh, manusia berada dalam kerugian,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/103002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 601, Arab: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", Latin: "Illalladziina aamanuu wa 'amilush-shaalihaati wa tawaashau bil-haqqi wa tawaashau bish-shabr", Translation: "kecuali orang-orang yang beriman dan mengerjakan kebajikan serta saling menasihati untuk kebenaran dan saling menasihati untuk kesabaran.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/103003.mp3"},
	},
	108: { // Al-Kautsar
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 602, Arab: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", Latin: "Innaa a'thainaakal-kautsar", Translation: "Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/108001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 602, Arab: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", Latin: "Fashalli lirabbika wanhar", Translation: "Maka laksanakanlah sholat karena Tuhanmu, dan berkurbanlah.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/108002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 602, Arab: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", Latin: "Inna syaani'aka huwal-abtar", Translation: "Sungguh, orang-orang yang membencimu dialah yang terputus (dari rahmat Allah).", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/108003.mp3"},
	},
	110: { // An-Nasr
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 603, Arab: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", Latin: "Idzaa jaa-a nasrullaahi wal-fath", Translation: "Apabila telah datang pertolongan Allah dan kemenangan,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/110001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 603, Arab: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", Latin: "Wa ra-aitan-naasa yadkhuluuna fii diinillaahi afwaajaa", Translation: "dan engkau melihat manusia berbondong-bondong masuk agama Allah,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/110002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 603, Arab: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", Latin: "Fasabbih bihamdi rabbika wastaghfirh, innahu kaana tawwaabaa", Translation: "maka bertasbihlah dengan memuji Tuhanmu dan mohonlah ampunan kepada-Nya. Sungguh, Dia Maha Penerima tobat.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/110003.mp3"},
	},
	112: { // Al-Ikhlas
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 604, Arab: "قُلْ هُوَ اللَّهُ أَحَدٌ", Latin: "Qul huwallaahu ahad", Translation: "Katakanlah (Muhammad), \"Dialah Allah, Yang Maha Esa.\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 604, Arab: "اللَّهُ الصَّمَدُ", Latin: "Allaahush-shamad", Translation: "Allah tempat meminta segala sesuatu.", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/112002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 604, Arab: "لَمْ يَلِدْ وَلَمْ يُولَدْ", Latin: "Lam yalid wa lam yuulad", Translation: "(Allah) tidak beranak dan tidak pula diperanakkan,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/112003.mp3"},
		{Number: 4, NumberInSurah: 4, Juz: 30, Page: 604, Arab: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", Latin: "Wa lam yakul lahu kufuwan ahad", Translation: "dan tidak ada sesuatu yang setara dengan Dia.\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/112004.mp3"},
	},
	113: { // Al-Falaq
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 604, Arab: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", Latin: "Qul a'uudzu birabbil-falaq", Translation: "Katakanlah, \"Aku berlindung kepada Tuhan yang menguasai subuh (fajar),\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 604, Arab: "مِن شَرِّ مَا خَلَقَ", Latin: "Min syarri maa khalaq", Translation: "dari kejahatan (makhluk yang) Dia ciptakan,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/113002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 604, Arab: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", Latin: "Wa min syarri ghaasiqin idzaa waqab", Translation: "dan dari kejahatan malam apabila telah gelap gulita,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/113003.mp3"},
		{Number: 4, NumberInSurah: 4, Juz: 30, Page: 604, Arab: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", Latin: "Wa min syarrin-naffaatsaati fil-'uqad", Translation: "dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/113004.mp3"},
		{Number: 5, NumberInSurah: 5, Juz: 30, Page: 604, Arab: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", Latin: "Wa min syarri haasidin idzaa hasad", Translation: "dan dari kejahatan orang yang dengki apabila dia dengki.\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/113005.mp3"},
	},
	114: { // An-Nas
		{Number: 1, NumberInSurah: 1, Juz: 30, Page: 604, Arab: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", Latin: "Qul a'uudzu birabbin-naas", Translation: "Katakanlah, \"Aku berlindung kepada Tuhannya manusia,\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114001.mp3"},
		{Number: 2, NumberInSurah: 2, Juz: 30, Page: 604, Arab: "مَلِكِ النَّاسِ", Latin: "Malikin-naas", Translation: "Raja manusia,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114002.mp3"},
		{Number: 3, NumberInSurah: 3, Juz: 30, Page: 604, Arab: "إِلَٰهِ النَّاسِ", Latin: "Ilaahin-naas", Translation: "sembahan manusia,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114003.mp3"},
		{Number: 4, NumberInSurah: 4, Juz: 30, Page: 604, Arab: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", Latin: "Min syarril-waswaasil-khannaas", Translation: "dari kejahatan (bisikan) setan yang bersembunyi,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114004.mp3"},
		{Number: 5, NumberInSurah: 5, Juz: 30, Page: 604, Arab: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", Latin: "Alladzii yuwaswisu fii shuduurin-naas", Translation: "yang membisikkan (kejahatan) ke dalam dada manusia,", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114005.mp3"},
		{Number: 6, NumberInSurah: 6, Juz: 30, Page: 604, Arab: "مِنَ الْجِنَّةِ وَالنَّاسِ", Latin: "Minal-jinnati wan-naas", Translation: "dari (golongan) jin dan manusia.\"", AudioURL: "https://everyayah.com/data/Alafasy_128kbps/114006.mp3"},
	},
}

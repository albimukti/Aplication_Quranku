package data

type City struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Province  string  `json:"province"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timezone  string  `json:"timezone"` // WIB, WITA, WIT
}

var IndonesianCities = []City{
	{ID: "jkt", Name: "DKI Jakarta", Province: "DKI Jakarta", Latitude: -6.2088, Longitude: 106.8456, Timezone: "WIB"},
	{ID: "bdg", Name: "Bandung", Province: "Jawa Barat", Latitude: -6.9175, Longitude: 107.6191, Timezone: "WIB"},
	{ID: "sby", Name: "Surabaya", Province: "Jawa Timur", Latitude: -7.2575, Longitude: 112.7521, Timezone: "WIB"},
	{ID: "smg", Name: "Semarang", Province: "Jawa Tengah", Latitude: -6.9667, Longitude: 110.4167, Timezone: "WIB"},
	{ID: "mdn", Name: "Medan", Province: "Sumatera Utara", Latitude: 3.5952, Longitude: 98.6722, Timezone: "WIB"},
	{ID: "mks", Name: "Makassar", Province: "Sulawesi Selatan", Latitude: -5.1477, Longitude: 119.4327, Timezone: "WITA"},
	{ID: "plg", Name: "Palembang", Province: "Sumatera Selatan", Latitude: -2.9909, Longitude: 104.7565, Timezone: "WIB"},
	{ID: "bpp", Name: "Balikpapan", Province: "Kalimantan Timur", Latitude: -1.2379, Longitude: 116.8289, Timezone: "WITA"},
	{ID: "dps", Name: "Denpasar", Province: "Bali", Latitude: -8.6705, Longitude: 115.2126, Timezone: "WITA"},
	{ID: "bda", Name: "Banda Aceh", Province: "Aceh", Latitude: 5.5483, Longitude: 95.3238, Timezone: "WIB"},
	{ID: "pdg", Name: "Padang", Province: "Sumatera Barat", Latitude: -0.9471, Longitude: 100.4172, Timezone: "WIB"},
	{ID: "pku", Name: "Pekanbaru", Province: "Riau", Latitude: 0.5071, Longitude: 101.4478, Timezone: "WIB"},
	{ID: "btm", Name: "Batam", Province: "Kepulauan Riau", Latitude: 1.1301, Longitude: 104.0529, Timezone: "WIB"},
	{ID: "jmb", Name: "Jambi", Province: "Jambi", Latitude: -1.6101, Longitude: 103.6131, Timezone: "WIB"},
	{ID: "bkl", Name: "Bengkulu", Province: "Bengkulu", Latitude: -3.8004, Longitude: 102.2655, Timezone: "WIB"},
	{ID: "bdr", Name: "Bandar Lampung", Province: "Lampung", Latitude: -5.4500, Longitude: 105.2667, Timezone: "WIB"},
	{ID: "pkr", Name: "Pangkal Pinang", Province: "Bangka Belitung", Latitude: -2.1333, Longitude: 106.1167, Timezone: "WIB"},
	{ID: "srg", Name: "Serang", Province: "Banten", Latitude: -6.1200, Longitude: 106.1500, Timezone: "WIB"},
	{ID: "tgr", Name: "Tangerang", Province: "Banten", Latitude: -6.1783, Longitude: 106.6319, Timezone: "WIB"},
	{ID: "bgr", Name: "Bogor", Province: "Jawa Barat", Latitude: -6.5971, Longitude: 106.8060, Timezone: "WIB"},
	{ID: "bks", Name: "Bekasi", Province: "Jawa Barat", Latitude: -6.2383, Longitude: 106.9756, Timezone: "WIB"},
	{ID: "dpk", Name: "Depok", Province: "Jawa Barat", Latitude: -6.4025, Longitude: 106.7942, Timezone: "WIB"},
	{ID: "crb", Name: "Cirebon", Province: "Jawa Barat", Latitude: -6.7320, Longitude: 108.5523, Timezone: "WIB"},
	{ID: "slo", Name: "Surakarta (Solo)", Province: "Jawa Tengah", Latitude: -7.5755, Longitude: 110.8243, Timezone: "WIB"},
	{ID: "jog", Name: "Yogyakarta", Province: "DI Yogyakarta", Latitude: -7.7956, Longitude: 110.3695, Timezone: "WIB"},
	{ID: "mlg", Name: "Malang", Province: "Jawa Timur", Latitude: -7.9666, Longitude: 112.6326, Timezone: "WIB"},
	{ID: "ptk", Name: "Pontianak", Province: "Kalimantan Barat", Latitude: -0.0263, Longitude: 109.3425, Timezone: "WIB"},
	{ID: "bjm", Name: "Banjarmasin", Province: "Kalimantan Selatan", Latitude: -3.3194, Longitude: 114.5908, Timezone: "WITA"},
	{ID: "smr", Name: "Samarinda", Province: "Kalimantan Timur", Latitude: -0.5022, Longitude: 117.1536, Timezone: "WITA"},
	{ID: "mnd", Name: "Manado", Province: "Sulawesi Utara", Latitude: 1.4748, Longitude: 124.8421, Timezone: "WITA"},
	{ID: "plu", Name: "Palu", Province: "Sulawesi Tengah", Latitude: -0.8917, Longitude: 119.8707, Timezone: "WITA"},
	{ID: "kdr", Name: "Kendari", Province: "Sulawesi Tenggara", Latitude: -3.9985, Longitude: 122.5126, Timezone: "WITA"},
	{ID: "gto", Name: "Gorontalo", Province: "Gorontalo", Latitude: 0.5435, Longitude: 123.0568, Timezone: "WITA"},
	{ID: "mat", Name: "Mataram (Lombok)", Province: "Nusa Tenggara Barat", Latitude: -8.5833, Longitude: 116.1167, Timezone: "WITA"},
	{ID: "kpg", Name: "Kupang", Province: "Nusa Tenggara Timur", Latitude: -10.1772, Longitude: 123.6070, Timezone: "WITA"},
	{ID: "amb", Name: "Ambon", Province: "Maluku", Latitude: -3.6954, Longitude: 128.1814, Timezone: "WIT"},
	{ID: "jpr", Name: "Jayapura", Province: "Papua", Latitude: -2.5337, Longitude: 140.7181, Timezone: "WIT"},
}

export type Locale = 'ms' | 'en';

export const translations = {
  ms: {
    // Top banner & Header
    stateBanner: 'Kerajaan Negeri Kedah Darul Aman — Portal Rasmi Aduan Komuniti',
    appName: 'Sistem Aduan Komuniti Kedah',
    appSubtitle: 'Kedah Community Connect',
    langToggle: 'English',
    navSignIn: 'Log Masuk',
    navRegister: 'Daftar',
    navMyReports: 'Aduan Saya',
    navNewReport: 'Aduan Baru',
    navAdminQueue: 'Senarai Aduan',
    navAnalytics: 'Analitik',
    navSettings: 'Tetapan',
    navDeptQueue: 'Giliran Jabatan',
    navNotifications: 'Notifikasi',
    navSignOut: 'Log Keluar',
    footerCopyright: `© ${new Date().getFullYear()} Kerajaan Negeri Kedah Darul Aman`,
    footerRights: 'Sistem Aduan Komuniti Kedah (SACK) · Semua hak terpelihara',

    // Landing Page
    landingStateBadge: 'Kerajaan Negeri Kedah Darul Aman',
    landingHeroTitle: 'Sistem Pengurusan Aduan Awam & Komuniti',
    landingHeroDesc:
      'Platform rasmi bagi warga Kedah menyampaikan maklum balas, kerosakan jalan, lampu awam, perparitan, dan kemudahan komuniti terus kepada Pihak Berkuasa Tempatan (PBT) dan agensi berkaitan secara pantas dan telus.',
    landingCreateAcc: 'Daftar Akaun Penduduk',
    landingSignIn: 'Log Masuk',
    landingDashboard: 'Buka Papan Pemuka',
    landingLearnMore: 'Ketahui Cara Kerja ↓',

    // Stats
    statDistricts: '12 Daerah',
    statDistrictsSub: 'Liputan Seluruh Kedah',
    statHours: '24/7',
    statHoursSub: 'Penyerahan Digital',
    statTransparent: '100%',
    statTransparentSub: 'Telus & Boleh Dikesan',
    statAgencies: 'PBT & JKR',
    statAgenciesSub: 'Tindakan Bersepadu',

    // How it works
    workflowTitle: 'Aliran Tindakan Aduan',
    workflowDesc:
      'Setiap aduan yang anda hantar diproses mengikut prosedur operasi piawai (SOP) jabatan.',
    workflowSubmitNow: 'Hantar aduan sekarang →',
    step1Title: '1. Penyerahan Bersama Bukti',
    step1Desc:
      'Pilih kategori seperti jalan rosak atau lampu padam, huraikan masalah, masukkan lokasi atau koordinat GPS, dan sertakan gambar lampiran.',
    step2Title: '2. Pengesahan & Penugasan',
    step2Desc:
      'Pegawai tadbir menyemak kesahihan aduan dan mengagihkannya kepada jabatan bertanggungjawab seperti Kerja Raya, Kesihatan Awam, atau Landskap.',
    step3Title: '3. Pembaikan & Makluman',
    step3Desc:
      'Pasukan lapangan melaksanakan tindakan pembaikan dan memuat naik laporan penyelesaian. Pengadu dimaklumkan secara automatik menerusi sistem.',

    // Showcase section
    showcaseBadge: 'Fasiliti & Infrastruktur Awam',
    showcaseTitle: 'Bersama Menjaga Kesejahteraan Negeri Jelapang Padi',
    showcaseDesc:
      'Dari kawasan bandar, pekan bersejarah, persisiran pulau Langkawi hingga ke kawasan luar bandar, maklumat anda membantu agensi bertindak dengan lebih cekap demi keselamatan dan keselesaan semua rakyat.',
    showcaseRoads: 'Penyelenggaraan Jalan',
    showcaseRoadsSub: 'Jalan berlubang & bahu jalan',
    showcaseLights: 'Pencahayaan & Trafik',
    showcaseLightsSub: 'Lampu jalan & lampu isyarat',
    showcaseDrainage: 'Saliran & Parit',
    showcaseDrainageSub: 'Mencegah takungan air banjir',
    showcaseWaste: 'Pembersihan Awam',
    showcaseWasteSub: 'Pengurusan sisa & taman',
    showcaseNightTitle: 'Pekan & Komersial',
    showcaseNightDesc: 'Keselamatan lampu jalan dan kebersihan perniagaan komuniti.',
    showcaseCoastalTitle: 'Laluan Persisir & Pulau',
    showcaseCoastalDesc: 'Infrastruktur pelancongan dan akses komuniti desa.',

    // Auth Pages
    authWelcomeBack: 'Selamat Kembali',
    authPortalAccess: 'Akses Portal Rasmi',
    authKedahCares: 'Kedah Sejahtera & Prihatin',
    authPortalDesc:
      'Memudahkan urusan aduan fasiliti awam antara rakyat dan pihak berkuasa tempatan secara terus dan telus.',
    authLoginSubtitle: 'Sila masukkan kelayakan akaun anda untuk mengakses perkhidmatan aduan.',
    authEmail: 'Alamat E-mel',
    authPassword: 'Kata Laluan',
    authPasswordMin8: 'Kata Laluan (minimum 8 aksara)',
    authSigningIn: 'Sedang log masuk...',
    authSignInBtn: 'Log Masuk',
    authNewResident: 'Belum mendaftar sebagai penduduk?',
    authRegisterNow: 'Daftar sekarang',
    authRegTitle: 'Daftar Akaun',
    authRegSubtitle: 'Daftar secara percuma untuk menyertai komuniti prihatin Kedah.',
    authVoiceCounts: 'Suara Anda, Kesejahteraan Kedah',
    authVoiceDesc:
      'Daftar satu akaun penduduk untuk menghantar laporan, menyemak tindakan agensi secara langsung, dan menerima notifikasi penyelesaian.',
    authFullName: 'Nama Penuh (seperti MyKad)',
    authCreatingAcc: 'Mendaftar...',
    authCreateAccBtn: 'Cipta Akaun Penduduk',
    authAlreadyHaveAcc: 'Sudah mempunyai akaun berdaftar?',
    authLoginHere: 'Log masuk di sini',
    authErrorLogin: 'E-mel atau kata laluan tidak sah',
    authErrorRegister: 'Tidak dapat mendaftar',

    // Reports List Page
    reportsTitle: 'Aduan Saya',
    reportsSubtitle: 'Pantau status isu yang telah anda laporkan.',
    reportsNewBtn: '+ Hantar Aduan Baru',
    reportsSearchPlaceholder: 'Cari tajuk, rujukan atau lokasi...',
    reportsAllStatus: 'Semua status',
    reportsLoading: 'Memuatkan aduan...',
    reportsEmpty: 'Tiada aduan yang sepadan dengan tapisan semasa.',
    reportsSubmitFirst: 'Hantar aduan pertama anda',
    reportsUncategorized: 'Tidak dikategori',

    // New Report Page
    newReportOfficialBanner: 'Borang Rasmi Aduan Awam',
    newReportTitle: 'Hantar Aduan Komuniti',
    newReportSubtitle:
      'Sila berikan maklumat lengkap mengenai kerosakan atau isu yang dialami supaya tindakan lapangan dapat diagihkan dengan tepat.',
    newReportCategory: 'Kategori Isu',
    newReportLocation: 'Kawasan / Lokasi Am',
    newReportLocationPlaceholder: 'cth: Alor Setar, berhampiran Aman Central',
    newReportTitleField: 'Tajuk Aduan (5–120 aksara)',
    newReportTitlePlaceholder: 'cth: Lampu jalan rosak berhampiran persimpangan Jalan Stadium',
    newReportDescField: 'Huraian Terperinci (20–3,000 aksara)',
    newReportDescPlaceholder:
      'Sila nyatakan butiran kerosakan, mercu tanda berdekatan, anggaran keluasan, dan risiko keselamatan jika ada...',
    newReportGpsTitle: 'Koordinat GPS (Pilihan)',
    newReportGpsDesc:
      'Membantu skuad teknikal PBT mengesan lokasi aduan menggunakan navigasi satelit.',
    newReportLat: 'Latitud',
    newReportLon: 'Longitud',
    newReportPhotos: 'Gambar Lampiran (Maksimum 5 fail, JPEG / PNG / WebP, 5 MiB setiap satu)',
    newReportCancel: 'Batal',
    newReportSubmitting: 'Menghantar Aduan...',
    newReportSubmitBtn: 'Hantar Aduan Rasmi',
    newReportError: 'Gagal menghantar aduan',

    // Report Detail Page
    detailLoading: 'Memuatkan butiran aduan...',
    detailNotFound: 'Aduan tidak dijumpai',
    detailCategory: 'Kategori',
    detailAssigned: 'Diarahkan',
    detailCancelReport: 'Batalkan Aduan',
    detailCancelConfirm: 'Dibatalkan oleh penduduk',
    detailTimeline: 'Garis Masa Status',
    detailUpdatedBy: 'Dikemaskini oleh',
    detailUpdatesNotes: 'Kemaskini & Nota',
    detailNoNotes: 'Tiada nota lagi.',
    detailStaff: 'Kakitangan',
    detailAttachments: 'Lampiran',
    detailNoAttachments: 'Tiada lampiran dimuat naik.',
    detailView: 'Lihat',

    // Admin Queue Page
    adminQueueTitle: 'Giliran Aduan Pentadbir',
    adminQueueSubtitle: 'Semak, tolak, atau hala aduan kepada unit berkenaan.',
    adminReviewBtn: 'Mula Semakan',
    adminAssignBtn: 'Agihkan',
    adminRejectBtn: 'Tolak',
    adminRejectPrompt: 'Masukkan alasan penolakan (minimum 10 aksara):',

    // Admin Analytics
    analyticsTitle: 'Analitik Platform',
    analyticsTotalReports: 'Jumlah Aduan',
    analyticsResolved: 'Diselesaikan',
    analyticsAvgTime: 'Purata Masa Penyelesaian',
    analyticsByStatus: 'Aduan Mengikut Status',
    analyticsByCategory: 'Aduan Mengikut Kategori',
    analyticsLoading: 'Memuatkan analitik...',
    analyticsHours: 'jam',

    // Admin Settings
    settingsTitle: 'Kategori & Jabatan',
    settingsCategories: 'Kategori Isu',
    settingsNewCategoryPlaceholder: 'Nama kategori baharu',
    settingsAddBtn: 'Tambah',
    settingsDepartments: 'Jabatan Perkhidmatan',
    settingsNewDeptPlaceholder: 'Nama jabatan baharu',
    settingsActive: 'Aktif',
    settingsInactive: 'Tidak Aktif',

    // Department Queue Page
    deptQueueTitle: 'Giliran Kerja Jabatan',
    deptQueueSubtitle:
      'Urus aduan yang diarahkan kepada jabatan anda, tambah nota kemajuan dan rekod penyelesaian.',
    deptLoading: 'Memuatkan aduan yang ditetapkan...',
    deptEmpty: 'Tiada aduan yang ditetapkan kepada jabatan anda buat masa ini.',
    deptStartWork: 'Mula Kerja',
    deptDispatchedComment: 'Pasukan lapangan telah digerakkan',
    deptResolve: 'Tandai Selesai',
    deptResolvePrompt: 'Masukkan ringkasan penyelesaian (minimum 10 aksara):',
    deptPublicUpdate: 'Tambah Kemaskini Awam',
    deptInternalNote: 'Tambah Nota Dalaman',
    deptNotePrompt: (visibility: string) => `Masukkan nota ${visibility.toLowerCase()}:`,

    // Notifications Page
    notifTitle: 'Notifikasi',
    notifLoading: 'Memuatkan notifikasi...',
    notifEmpty: 'Tiada notifikasi buat masa ini.',
    notifViewReport: 'Lihat Aduan',
    notifMarkRead: 'Tandai dibaca',
  },

  en: {
    // Top banner & Header
    stateBanner: 'Government of Kedah Darul Aman — Official Community Complaint Portal',
    appName: 'Kedah Community Complaint System',
    appSubtitle: 'Kedah Community Connect',
    langToggle: 'Bahasa Melayu',
    navSignIn: 'Sign In',
    navRegister: 'Register',
    navMyReports: 'My Reports',
    navNewReport: 'New Report',
    navAdminQueue: 'Admin Queue',
    navAnalytics: 'Analytics',
    navSettings: 'Settings',
    navDeptQueue: 'Department Queue',
    navNotifications: 'Notifications',
    navSignOut: 'Sign Out',
    footerCopyright: `© ${new Date().getFullYear()} Government of Kedah Darul Aman`,
    footerRights: 'Kedah Community Complaint System (SACK) · All rights reserved',

    // Landing Page
    landingStateBadge: 'State Government of Kedah Darul Aman',
    landingHeroTitle: 'Public & Community Complaint Management System',
    landingHeroDesc:
      'The official platform for Kedah residents to submit reports on road damages, public lighting, drainage, and community facilities directly to Local Authorities and relevant agencies promptly and transparently.',
    landingCreateAcc: 'Create Resident Account',
    landingSignIn: 'Sign In',
    landingDashboard: 'Open Dashboard',
    landingLearnMore: 'Learn How It Works ↓',

    // Stats
    statDistricts: '12 Districts',
    statDistrictsSub: 'Full Kedah Coverage',
    statHours: '24/7',
    statHoursSub: 'Digital Submissions',
    statTransparent: '100%',
    statTransparentSub: 'Transparent & Trackable',
    statAgencies: 'Local Councils & JKR',
    statAgenciesSub: 'Integrated Response',

    // How it works
    workflowTitle: 'Complaint Resolution Workflow',
    workflowDesc:
      'Every report you submit is processed in accordance with official department operating standards.',
    workflowSubmitNow: 'Submit a report now →',
    step1Title: '1. Submit with Evidence',
    step1Desc:
      'Select a category such as damaged roads or unlit streetlamps, describe the issue, enter the location or GPS coordinates, and attach photos.',
    step2Title: '2. Verification & Routing',
    step2Desc:
      'Administrative officers verify the validity of the complaint and assign it to the responsible department such as Public Works, Health, or Landscape.',
    step3Title: '3. Repair & Notification',
    step3Desc:
      'Field teams carry out maintenance and upload completion evidence. Complainants receive automated progress notifications directly in the system.',

    // Showcase section
    showcaseBadge: 'Public Facilities & Infrastructure',
    showcaseTitle: 'Safeguarding the Rice Bowl State of Malaysia Together',
    showcaseDesc:
      'From city centers and historic towns to Langkawi island shores and rural townships, your reports help government agencies respond effectively for the safety and comfort of all residents.',
    showcaseRoads: 'Road Maintenance',
    showcaseRoadsSub: 'Potholes & road shoulders',
    showcaseLights: 'Lighting & Traffic',
    showcaseLightsSub: 'Streetlights & traffic signals',
    showcaseDrainage: 'Drainage & Canals',
    showcaseDrainageSub: 'Preventing flash flood waters',
    showcaseWaste: 'Public Sanitation',
    showcaseWasteSub: 'Waste disposal & public parks',
    showcaseNightTitle: 'Towns & Commercial Centers',
    showcaseNightDesc: 'Streetlamp safety and community business cleanliness.',
    showcaseCoastalTitle: 'Coastal & Island Corridors',
    showcaseCoastalDesc: 'Tourism infrastructure and rural community access.',

    // Auth Pages
    authWelcomeBack: 'Welcome Back',
    authPortalAccess: 'Official Portal Access',
    authKedahCares: 'Prosperous & Caring Kedah',
    authPortalDesc:
      'Streamlining public amenity resolution between residents and local municipal councils with transparency.',
    authLoginSubtitle: 'Please enter your account credentials to access complaint services.',
    authEmail: 'Email Address',
    authPassword: 'Password',
    authPasswordMin8: 'Password (minimum 8 characters)',
    authSigningIn: 'Signing in...',
    authSignInBtn: 'Sign In',
    authNewResident: 'Not registered as a resident yet?',
    authRegisterNow: 'Register now',
    authRegTitle: 'Create Resident Account',
    authRegSubtitle: 'Register for free to join the caring Kedah community.',
    authVoiceCounts: 'Your Voice, A Better Kedah',
    authVoiceDesc:
      'Register a single citizen account to submit reports, track agency actions live, and receive completion notifications.',
    authFullName: 'Full Name (as per MyKad)',
    authCreatingAcc: 'Registering...',
    authCreateAccBtn: 'Create Account',
    authAlreadyHaveAcc: 'Already registered?',
    authLoginHere: 'Sign in here',
    authErrorLogin: 'Invalid email or password',
    authErrorRegister: 'Unable to register',

    // Reports List Page
    reportsTitle: 'My Reports',
    reportsSubtitle: 'Track the status of your submitted issues.',
    reportsNewBtn: '+ Submit New Report',
    reportsSearchPlaceholder: 'Search title, reference or location...',
    reportsAllStatus: 'All statuses',
    reportsLoading: 'Loading reports...',
    reportsEmpty: 'No reports match your current filter.',
    reportsSubmitFirst: 'Submit your first report',
    reportsUncategorized: 'Uncategorized',

    // New Report Page
    newReportOfficialBanner: 'Official Public Complaint Form',
    newReportTitle: 'Submit Community Report',
    newReportSubtitle:
      'Please provide comprehensive details regarding the issue so field action can be accurately routed.',
    newReportCategory: 'Issue Category',
    newReportLocation: 'General Area / Landmark',
    newReportLocationPlaceholder: 'e.g. Alor Setar, near Aman Central',
    newReportTitleField: 'Report Title (5–120 characters)',
    newReportTitlePlaceholder: 'e.g. Faulty streetlight near Jalan Stadium intersection',
    newReportDescField: 'Detailed Description (20–3,000 characters)',
    newReportDescPlaceholder:
      'Please state defect details, nearby landmarks, approximate scale, and safety hazards if any...',
    newReportGpsTitle: 'GPS Coordinates (Optional)',
    newReportGpsDesc:
      'Helps local municipal technicians pinpoint the exact location with satellite navigation.',
    newReportLat: 'Latitude',
    newReportLon: 'Longitude',
    newReportPhotos: 'Photo Attachments (Maximum 5 files, JPEG / PNG / WebP, 5 MiB each)',
    newReportCancel: 'Cancel',
    newReportSubmitting: 'Submitting Report...',
    newReportSubmitBtn: 'Submit Official Report',
    newReportError: 'Failed to submit report',

    // Report Detail Page
    detailLoading: 'Loading report details...',
    detailNotFound: 'Report not found',
    detailCategory: 'Category',
    detailAssigned: 'Assigned to',
    detailCancelReport: 'Cancel Report',
    detailCancelConfirm: 'Cancelled by resident',
    detailTimeline: 'Status Timeline',
    detailUpdatedBy: 'Updated by',
    detailUpdatesNotes: 'Updates & Notes',
    detailNoNotes: 'No notes added yet.',
    detailStaff: 'Staff',
    detailAttachments: 'Attachments',
    detailNoAttachments: 'No attachments uploaded.',
    detailView: 'View',

    // Admin Queue Page
    adminQueueTitle: 'Administrator Report Queue',
    adminQueueSubtitle: 'Review, reject, or route reports to the responsible units.',
    adminReviewBtn: 'Start Review',
    adminAssignBtn: 'Assign',
    adminRejectBtn: 'Reject',
    adminRejectPrompt: 'Enter rejection reason (minimum 10 characters):',

    // Admin Analytics
    analyticsTitle: 'Platform Analytics',
    analyticsTotalReports: 'Total Reports',
    analyticsResolved: 'Resolved',
    analyticsAvgTime: 'Avg. Resolution Time',
    analyticsByStatus: 'Reports by Status',
    analyticsByCategory: 'Reports by Category',
    analyticsLoading: 'Loading analytics...',
    analyticsHours: 'hrs',

    // Admin Settings
    settingsTitle: 'Categories & Departments',
    settingsCategories: 'Issue Categories',
    settingsNewCategoryPlaceholder: 'New category name',
    settingsAddBtn: 'Add',
    settingsDepartments: 'Service Departments',
    settingsNewDeptPlaceholder: 'New department name',
    settingsActive: 'Active',
    settingsInactive: 'Inactive',

    // Department Queue Page
    deptQueueTitle: 'Department Work Queue',
    deptQueueSubtitle:
      'Manage complaints assigned to your department, record progress updates and log resolutions.',
    deptLoading: 'Loading assigned reports...',
    deptEmpty: 'No reports are currently assigned to your department.',
    deptStartWork: 'Start Work',
    deptDispatchedComment: 'Field team dispatched',
    deptResolve: 'Mark Resolved',
    deptResolvePrompt: 'Enter resolution summary (minimum 10 characters):',
    deptPublicUpdate: 'Add Public Update',
    deptInternalNote: 'Add Internal Note',
    deptNotePrompt: (visibility: string) => `Enter ${visibility.toLowerCase()} note:`,

    // Notifications Page
    notifTitle: 'Notifications',
    notifLoading: 'Loading notifications...',
    notifEmpty: 'You have no notifications at this time.',
    notifViewReport: 'View Report',
    notifMarkRead: 'Mark as read',
  },
} as const;

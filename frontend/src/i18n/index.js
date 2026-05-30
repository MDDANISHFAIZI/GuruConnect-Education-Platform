import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        brandName: "GuruConnect",
        findTutors: "Find Teachers Near You",
        dashboard: "Dashboard",
        login: "Sign In",
        register: "Sign Up",
        logout: "Log Out",
        tagline: "Hyperlocal Education Platform"
      },
      hero: {
        title: "Find the Best Tuition Teachers in Your Neighborhood",
        subtitle: "A hyperlocal educator network built for villages, towns, and local communities across India. Easily discover verified home tutors within 2 kilometers.",
        ctaFind: "Find Teachers Near Me 🔍",
        ctaTeach: "Become a Teacher 👨‍🏫",
        statsTeachers: "1,200+ Teachers",
        statsStudents: "10,000+ Students",
        statsVillages: "450+ Villages & Towns",
        howItWorks: "How It Works",
        step1: "1. Detect Location",
        step1Text: "Find verified tutors exactly within 2 kilometers of your home.",
        step2: "2. Connect Directly",
        step2Text: "Chat, view qualifications, fees, and schedule a free demo class.",
        step3: "3. Manage Digitally",
        step3Text: "Teachers track attendance and log fee payments directly on mobile.",
        philosophyTitle: "Our Core Social Philosophy",
        philosophyDesc: "We believe in equal opportunity. GuruConnect gives equal exposure to new and experienced local tutors alike, promoting neighborhood talent without corporate ranking biases.",
      },
      discovery: {
        title: "Local Teachers Near You",
        searchPlaceholder: "Search by subject (Maths, English, Science...)",
        filterClass: "Select Class",
        filterMode: "Teaching Mode",
        filterFee: "Max Monthly Fee (₹)",
        filterDistance: "Max Distance (km)",
        activeBadges: {
          today: "Active Today",
          week: "Active This Week",
          inactive: "Inactive"
        },
        modeOptions: {
          all: "All Modes",
          online: "Online",
          offline: "Offline",
          both: "Both"
        },
        noTutorsNearby: "No teachers found within 2 km.",
        distanceKm: "{{distance}} km away",
        demoAvailable: "Demo Class Available",
        noDemo: "Demo Class on Request",
        rateBtn: "Rate / Review",
        viewProfile: "View Details",
        experienceYears: "{{exp}} years experience",
        subjectsTaught: "Subjects: ",
        classesTaught: "Classes: ",
        feesLabel: "Monthly Fees: ",
        timingsLabel: "Timings: ",
        addressLabel: "Address: ",
        verifiedBadge: "Verified Educator",
        reviewsHeading: "Student Reviews",
        writeReview: "Write a Review",
        ratingLabel: "Select Rating (Stars)",
        commentLabel: "Write your feedback...",
        submitReview: "Submit Review",
        reviewsEmpty: "No reviews yet. Be the first to write one!",
        successReview: "Review added successfully!"
      },
      emptyState: {
        title: "We are not available in your area yet, but we are expanding soon!",
        hindiTitleAlternative: "हम जल्द ही आपके क्षेत्र में उपलब्ध होंगे!",
        subtitle: "GuruConnect is currently launching village-by-village. Be the first to bring modern education management to your locality!",
        notifyBtn: "Notify Me When Available",
        becomeTutorBtn: "Become the First Teacher in This Area",
        notifyModalTitle: "Stay Tuned!",
        notifyModalText: "Provide your contact number, and we will alert you the moment educators register in your area.",
        phoneLabel: "Phone Number",
        submitNotify: "Keep Me Updated",
        successNotify: "Success! We registered your interest and will ping you once teachers log in!"
      },
      auth: {
        roleSelect: "Are you a Student / Parent or a Local Teacher?",
        studentRole: "I am a Student / Parent",
        teacherRole: "I am a Tuition Teacher",
        loginHeading: "Welcome Back",
        loginSub: "Sign in to access your attendance, fees, and discovery profile.",
        registerHeading: "Create an Account",
        registerSub: "Join India's hyperlocal social learning revolution.",
        nameLabel: "Full Name",
        emailLabel: "Email Address",
        passwordLabel: "Password",
        phoneLabel: "Mobile Number",
        registerBtn: "Register Now",
        loginBtn: "Sign In",
        noAccount: "New to GuruConnect?",
        haveAccount: "Already have an account?",
        validationError: "Please fill out all registration fields carefully.",
        logoutSuccess: "Logged out successfully."
      },
      dashboard: {
        welcome: "Welcome back, {{name}}",
        sidebar: {
          profile: "My Profile",
          attendance: "Attendance Tracker",
          fees: "Fee Ledger",
          reviews: "Moderation & Reviews",
          users: "User Panel",
          stats: "Platform Insights",
          favorites: "Saved Teachers"
        },
        teacher: {
          title: "Tuition Center Dashboard",
          statsActiveStudents: "Students Tracked",
          statsActiveBadge: "Status: Active Today",
          attendanceHeading: "Mark Student Attendance",
          studentNamePlaceholder: "Enter offline student name...",
          markPresent: "Present",
          markAbsent: "Absent",
          attendanceHistory: "Daily Attendance Ledger",
          dateCol: "Date",
          studentCol: "Student Name",
          statusCol: "Status",
          feeHeading: "Manage Student Monthly Fees",
          feeMonth: "Billing Month (e.g., May 2026)",
          feeAmount: "Amount (₹)",
          logPayment: "Log Payment Record",
          feeLedger: "Tuition Fee Bookkeeping",
          paidStatus: "Paid",
          unpaidStatus: "Unpaid",
          markPaid: "Mark Paid",
          deleteBtn: "Delete Log",
          profileTabTitle: "Tuition Center Profile Information",
          profileHelpText: "Fill out these details correctly to enable nearby parents to discover your home academy on OpenStreetMap.",
          subjectsPlaceholder: "Maths, Science, Hindi (comma separated)",
          classesPlaceholder: "Class 5, Class 8, Class 10 (comma separated)",
          modeLabel: "Class Mode",
          demoLabel: "Offer Free Demo Class?",
          gpsButton: "Auto-Detect My Academy Coordinates 📍",
          gpsSuccess: "Coordinates detected! Drag the map marker if you need to adjust.",
          gpsManual: "Or tap your exact building location on the map below:",
          saveProfileBtn: "Update Live Profile"
        },
        student: {
          title: "Student Discovery Center",
          favTitle: "Your Saved Neighborhood Teachers",
          favHelp: "Bookmark your favorite local tutors from the nearby map to access their timings, fee structures, and attendance registers easily.",
          contactedTitle: "My Contacted Tutors",
          noFavs: "You haven't bookmarked any teacher profiles yet.",
          myClassTrack: "Track My Classes",
          statsBadge: "Student Member"
        },
        admin: {
          title: "GuruConnect Admin Control",
          statsTotalUsers: "Total Registered Users",
          statsTotalTutors: "Total Tutors Active",
          statsWaitlistCount: "Unserved Waitlist Hotspots",
          hotspotsHeading: "Top Demanded Waitlist Locations",
          usersTab: "Registered Users Management",
          reviewsTab: "Tuition Reviews Moderation",
          deleteUserConfirm: "Delete User",
          deleteReviewConfirm: "Delete Spam Review",
          adminBadge: "System Admin"
        }
      },
      placeholders: {
        whatsappLabel: "💬 WhatsApp Integration Placeholder",
        whatsappDesc: "Future Feature: Chat with local parents directly on WhatsApp without sharing personal phone logs.",
        aiLabel: "🤖 AI Neighborhood Recommendations",
        aiDesc: "Future Feature: Smart matchmaking prioritizing rural students with local educators sharing vernacular specialties.",
        onlineClassesLabel: "🎥 Integrated Online Virtual Room",
        onlineClassesDesc: "Future Feature: Low-bandwidth native live streaming designed for 3G/4G connections in rural India.",
        verificationLabel: "🛡️ Panchayat / Teacher Verification",
        verificationDesc: "Future Feature: Background checks verified via Aadhar and local Gram Panchayat endorsements.",
        premiumLabel: "⭐ Premium Tuition Marketing plans",
        premiumDesc: "Future Feature: Low-cost local promotion boosts for small home tuition centers."
      }
    }
  },
  hi: {
    translation: {
      nav: {
        brandName: "गुरुकनेक्ट",
        findTutors: "अपने पास के शिक्षक खोजें",
        dashboard: "डैशबोर्ड",
        login: "लॉगिन",
        register: "पंजीकरण",
        logout: "लॉगआउट",
        tagline: "स्थानीय शिक्षा मंच"
      },
      hero: {
        title: "अपने पड़ोस में सबसे अच्छे ट्यूशन शिक्षक खोजें",
        subtitle: "भारत भर के गांवों, कस्बों और स्थानीय समुदायों के लिए बनाया गया एक स्थानीय शिक्षक नेटवर्क। अपने घर के 2 किलोमीटर के भीतर सत्यापित होम ट्यूटर आसानी से खोजें।",
        ctaFind: "अपने पास के शिक्षक खोजें 🔍",
        ctaTeach: "शिक्षक बनें 👨‍🏫",
        statsTeachers: "1,200+ शिक्षक",
        statsStudents: "10,000+ छात्र",
        statsVillages: "450+ गांव और कस्बे",
        howItWorks: "यह कैसे काम करता है",
        step1: "1. स्थान का पता लगाएं",
        step1Text: "अपने घर के ठीक 2 किलोमीटर के भीतर सत्यापित ट्यूटर्स खोजें।",
        step2: "2. सीधा संपर्क करें",
        step2Text: "चैट करें, योग्यताएं, फीस देखें, और एक मुफ्त डेमो क्लास शेड्यूल करें।",
        step3: "3. डिजिटल प्रबंधन करें",
        step3Text: "शिक्षक सीधे मोबाइल पर उपस्थिति और फीस भुगतान को ट्रैक कर सकते हैं।",
        philosophyTitle: "हमारी मूल सामाजिक विचारधारा",
        philosophyDesc: "हम समान अवसर में विश्वास करते हैं। गुरुकनेक्ट नए और अनुभवी स्थानीय ट्यूटर्स दोनों को समान अवसर प्रदान करता है, जिससे बिना किसी भेदभाव के स्थानीय प्रतिभा को बढ़ावा मिलता है।",
      },
      discovery: {
        title: "आपके पास के स्थानीय शिक्षक",
        searchPlaceholder: "विषय से खोजें (गणित, अंग्रेजी, विज्ञान...)",
        filterClass: "कक्षा चुनें",
        filterMode: "पढ़ाने का माध्यम",
        filterFee: "अधिकतम मासिक फीस (₹)",
        filterDistance: "अधिकतम दूरी (किमी)",
        activeBadges: {
          today: "आज सक्रिय",
          week: "इस सप्ताह सक्रिय",
          inactive: "निष्क्रिय"
        },
        modeOptions: {
          all: "सभी माध्यम",
          online: "ऑनलाइन",
          offline: "ऑफलाइन",
          both: "दोनों"
        },
        noTutorsNearby: "2 किलोमीटर के भीतर कोई शिक्षक नहीं मिले।",
        distanceKm: "{{distance}} किमी दूर",
        demoAvailable: "डेमो क्लास उपलब्ध",
        noDemo: "अनुरोध पर डेमो क्लास",
        rateBtn: "रेटिंग / समीक्षा",
        viewProfile: "विवरण देखें",
        experienceYears: "{{exp}} साल का अनुभव",
        subjectsTaught: "विषय: ",
        classesTaught: "कक्षाएं: ",
        feesLabel: "मासिक फीस: ",
        timingsLabel: "समय: ",
        addressLabel: "पता: ",
        verifiedBadge: "सत्यापित शिक्षक",
        reviewsHeading: "छात्र समीक्षाएं",
        writeReview: "समीक्षा लिखें",
        ratingLabel: "रेटिंग चुनें (स्टार्स)",
        commentLabel: "अपनी प्रतिक्रिया लिखें...",
        submitReview: "समीक्षा जमा करें",
        reviewsEmpty: "अभी तक कोई समीक्षा नहीं है। पहली समीक्षा आप लिखें!",
        successReview: "समीक्षा सफलतापूर्वक जोड़ी गई!"
      },
      emptyState: {
        title: "हम अभी आपके क्षेत्र में उपलब्ध नहीं हैं, लेकिन जल्द ही आ रहे हैं!",
        hindiTitleAlternative: "हम जल्द ही आपके क्षेत्र में उपलब्ध होंगे!",
        subtitle: "गुरुकनेक्ट वर्तमान में गांव-दर-गांव शुरू हो रहा है। अपने इलाके में आधुनिक शिक्षा प्रबंधन लाने वाले पहले व्यक्ति बनें!",
        notifyBtn: "उपलब्ध होने पर मुझे सूचित करें",
        becomeTutorBtn: "इस क्षेत्र में पहले शिक्षक बनें",
        notifyModalTitle: "हमारे साथ बने रहें!",
        notifyModalText: "अपना संपर्क नंबर प्रदान करें, और जैसे ही आपके क्षेत्र में शिक्षक पंजीकृत होंगे, हम आपको सचेत कर देंगे।",
        phoneLabel: "फ़ोन नंबर",
        submitNotify: "मुझे अपडेट रखें",
        successNotify: "सफलता! हमने आपकी रुचि दर्ज कर ली है और शिक्षक के आने पर हम आपको सूचित करेंगे!"
      },
      auth: {
        roleSelect: "क्या आप एक छात्र / अभिभावक हैं या एक स्थानीय शिक्षक?",
        studentRole: "मैं एक छात्र / अभिभावक हूँ",
        teacherRole: "मैं एक ट्यूशन शिक्षक हूँ",
        loginHeading: "आपका स्वागत है",
        loginSub: "अपनी उपस्थिति, फीस और खोज प्रोफाइल तक पहुंचने के लिए लॉगिन करें।",
        registerHeading: "खाता बनाएं",
        registerSub: "भारत की स्थानीय सामाजिक शिक्षण क्रांति में शामिल हों।",
        nameLabel: "पूरा नाम",
        emailLabel: "ईमेल पता",
        passwordLabel: "पासवर्ड",
        phoneLabel: "मोबाइल नंबर",
        registerBtn: "अभी पंजीकरण करें",
        loginBtn: "लॉगिन करें",
        noAccount: "गुरुकनेक्ट पर नए हैं?",
        haveAccount: "पहले से ही एक खाता है?",
        validationError: "कृपया सभी पंजीकरण फ़ील्ड सावधानीपूर्वक भरें।",
        logoutSuccess: "सफलतापूर्वक लॉगआउट हो गया।"
      },
      dashboard: {
        welcome: "आपका स्वागत है, {{name}}",
        sidebar: {
          profile: "मेरी प्रोफ़ाइल",
          attendance: "उपस्थिति ट्रैकर",
          fees: "फीस बहीखाता",
          reviews: "समीक्षा और मॉडरेशन",
          users: "उपयोगकर्ता पैनल",
          stats: "मंच अंतर्दृष्टि",
          favorites: "पसंदीदा शिक्षक"
        },
        teacher: {
          title: "ट्यूशन सेंटर डैशबोर्ड",
          statsActiveStudents: "ट्रैक किए गए छात्र",
          statsActiveBadge: "स्थिति: आज सक्रिय",
          attendanceHeading: "छात्र उपस्थिति दर्ज करें",
          studentNamePlaceholder: "ऑफलाइन छात्र का नाम दर्ज करें...",
          markPresent: "उपस्थित (Present)",
          markAbsent: "अनुपस्थित (Absent)",
          attendanceHistory: "दैनिक उपस्थिति बहीखाता",
          dateCol: "तिथि",
          studentCol: "छात्र का नाम",
          statusCol: "स्थिति",
          feeHeading: "छात्र मासिक फीस प्रबंधित करें",
          feeMonth: "बिलिंग महीना (जैसे, May 2026)",
          feeAmount: "राशि (₹)",
          logPayment: "भुगतान रिकॉर्ड सहेजें",
          feeLedger: "ट्यूशन फीस बहीखाता",
          paidStatus: "जमा हो गई",
          unpaidStatus: "बाकी है",
          markPaid: "भुगतान दर्ज करें",
          deleteBtn: "रिकॉर्ड हटाएं",
          profileTabTitle: "ट्यूशन सेंटर प्रोफ़ाइल जानकारी",
          profileHelpText: "अपने होम एकेडमी को ओपनस्ट्रीटमैप पर खोजने योग्य बनाने के लिए इन विवरणों को सही ढंग से भरें।",
          subjectsPlaceholder: "गणित, विज्ञान, हिंदी (अल्पविराम से अलग करें)",
          classesPlaceholder: "कक्षा 5, कक्षा 8, कक्षा 10 (अल्पविराम से अलग करें)",
          modeLabel: "कक्षा का माध्यम",
          demoLabel: "मुफ्त डेमो क्लास की पेशकश करें?",
          gpsButton: "मेरी एकेडमी स्थान का पता लगाएं 📍",
          gpsSuccess: "निर्देशांक मिल गए! यदि आवश्यकता हो तो मैप मार्कर को समायोजित करें।",
          gpsManual: "या नीचे दिए गए मानचित्र पर अपने सटीक भवन स्थान पर टैप करें:",
          saveProfileBtn: "प्रोफ़ाइल अपडेट करें"
        },
        student: {
          title: "छात्र खोज केंद्र",
          favTitle: "आपके पसंदीदा पड़ोसी शिक्षक",
          favHelp: "अपने आस-पास के मानचित्र से अपने पसंदीदा शिक्षकों को बुकमार्क करें ताकि उनके समय, फीस और उपस्थिति बहीखाता को आसानी से देखा जा सके।",
          contactedTitle: "मेरे संपर्क किए गए शिक्षक",
          noFavs: "आपने अभी तक किसी भी शिक्षक को पसंदीदा सूची में शामिल नहीं किया है।",
          myClassTrack: "मेरी कक्षाओं को ट्रैक करें",
          statsBadge: "छात्र सदस्य"
        },
        admin: {
          title: "गुरुकनेक्ट व्यवस्थापक नियंत्रण",
          statsTotalUsers: "कुल पंजीकृत उपयोगकर्ता",
          statsTotalTutors: "कुल सक्रिय शिक्षक",
          statsWaitlistCount: "अनदेखे हॉटस्पॉट क्षेत्र",
          hotspotsHeading: "शीर्ष मांग वाले क्षेत्र (वेटलिस्ट)",
          usersTab: "उपयोगकर्ता प्रबंधन",
          reviewsTab: "ट्यूशन समीक्षाएं मॉडरेशन",
          deleteUserConfirm: "उपयोगकर्ता हटाएं",
          deleteReviewConfirm: "समीक्षा हटाएं",
          adminBadge: "सिस्टम एडमिन"
        }
      },
      placeholders: {
        whatsappLabel: "💬 व्हाट्सएप डायरेक्ट चैट",
        whatsappDesc: "भावी सुविधा: व्यक्तिगत फोन नंबर साझा किए बिना सीधे व्हाट्सएप पर स्थानीय माता-पिता के साथ चैट करें।",
        aiLabel: "🤖 एआई पड़ोस सिफारिशें",
        aiDesc: "भावी सुविधा: स्थानीय बोली विशेषताओं को साझा करने वाले शिक्षकों के साथ ग्रामीण छात्रों को प्राथमिकता देने वाली स्मार्ट सिफारिशें।",
        onlineClassesLabel: "🎥 एकीकृत ऑनलाइन लाइव क्लास",
        onlineClassesDesc: "भावी सुविधा: भारत के ग्रामीण क्षेत्रों में 3G/4G कनेक्शन के लिए डिजाइन की गई कम-बैंडविड्थ लाइव क्लास।",
        verificationLabel: "🛡️ पंचायत / शिक्षक सत्यापन",
        verificationDesc: "भावी सुविधा: आधार और स्थानीय ग्राम पंचायत समर्थन के माध्यम से सत्यापित पृष्ठभूमि जांच।",
        premiumLabel: "⭐ प्रीमियम ट्यूशन प्रचार योजनाएं",
        premiumDesc: "भावी सुविधा: छोटे होम ट्यूशन सेंटरों के लिए कम लागत वाले स्थानीय विज्ञापन प्रचार।"
      }
    }
  }
};

const savedLang = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;

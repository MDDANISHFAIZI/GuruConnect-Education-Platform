// Student Curriculum & Personalization Config for Indian School Education (Classes 1 - 12)

export const CLASS_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

export const SUBJECT_OPTIONS = [
  { id: 'Maths', name: 'Maths', icon: '📐' },
  { id: 'Science', name: 'Science', icon: '🔬' },
  { id: 'English', name: 'English', icon: '📖' },
  { id: 'Hindi', name: 'Hindi', icon: '🇮🇳' },
  { id: 'Social Studies', name: 'Social Studies', icon: '🌍' },
  { id: 'Computer Science', name: 'Computer Science', icon: '💻' }
];

export const BOARD_OPTIONS = [
  { id: 'CBSE', label: 'CBSE (Central Board)' },
  { id: 'ICSE', label: 'ICSE / CISCE' },
  { id: 'State Board', label: 'State Board' },
  { id: 'Other', label: 'Other Board' }
];

export const LANGUAGE_OPTIONS = [
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'हिंदी (Hindi)' }
];

// Grade & Subject Syllabus-Aligned Topic Prompts
const SYLLABUS_TOPICS = {
  // Primary (Classes 1 - 5)
  primary: {
    'Maths': [
      'Teach me simple fractions with fun examples',
      'How to add and subtract 3-digit numbers easily',
      'Explain shapes and geometry basics',
      'Help me understand word problems in maths'
    ],
    'Science': [
      'What are living and non-living things?',
      'Explain the parts of a plant and what they do',
      'Why do we need water and clean air?',
      'How do animals adapt to their surroundings?'
    ],
    'English': [
      'What is a noun, verb, and adjective with examples?',
      'Help me write a short paragraph about my pet',
      'Explain rhyming words and simple sentences',
      'Teach me punctuation rules with examples'
    ],
    'Hindi': [
      'संज्ञा और सर्वनाम को सरल उदाहरणों से समझाएं',
      'विलोम शब्द और पर्यायवाची शब्द सिखाएं',
      'एक सुंदर कहानी का सार समझाएं'
    ],
    'Social Studies': [
      'What is our solar system and the planets?',
      'Teach me about safety rules at home and school',
      'Why do we celebrate national festivals?'
    ],
    'Computer Science': [
      'What are the main parts of a computer?',
      'Explain the difference between hardware and software'
    ]
  },

  // Middle School (Classes 6 - 8)
  middle: {
    'Maths': [
      'Teach me fractions with examples',
      'Help me solve this homework question step by step',
      'How to solve simple linear equations step by step',
      'Explain integers, negative numbers, and number lines',
      'Explain the perimeter and area formulas'
    ],
    'Science': [
      'Explain photosynthesis in simple words',
      'Create a quiz on electricity',
      'Summarize my science notes',
      'What is the difference between acids, bases, and salts?',
      'Explain electric circuits, switches, and conductors'
    ],
    'English': [
      'Explain active and passive voice with 5 clear examples',
      'How to write a formal letter to the school principal',
      'Teach me direct and indirect speech rules',
      'Explain tenses: present, past, and future with sentences'
    ],
    'Hindi': [
      'संधि और समास के बुनियादी नियम समझाएं',
      'मुहावरे और लोकोक्तियों के अर्थ और वाक्य प्रयोग',
      'औपचारिक पत्र लिखने का सही प्रारूप'
    ],
    'Social Studies': [
      'Explain the preamble and key features of the Indian Constitution',
      'How does the Earth rotate and revolve to create seasons?',
      'What were the main achievements of the Harappan Civilization?'
    ],
    'Computer Science': [
      'What is an algorithm and how to draw a flowchart?',
      'Explain computer networks and internet safety'
    ]
  },

  // High School (Classes 9 - 10)
  high: {
    'Maths': [
      'How to solve quadratic equations by factorisation and formula',
      'Explain trigonometric ratios and identities (sin, cos, tan)',
      'Help me solve linear equations in two variables step by step',
      'Explain arithmetic progressions (AP) nth term formula',
      'How to solve surface areas and volumes problems'
    ],
    'Science': [
      'Explain Newton\'s three laws of motion with real-life examples',
      'How do chemical reactions and balancing equations work?',
      'Explain Ohm\'s law, electric current, and resistance',
      'Explain life processes: respiration and human circulatory system',
      'What is reflection and refraction of light with mirror formulas?'
    ],
    'English': [
      'How to write an analytical paragraph based on charts or data',
      'Explain poetic devices: metaphor, simile, personification',
      'Key theme summary of class syllabus literature chapters'
    ],
    'Hindi': [
      'रस, अलंकार और छंद की परिभाषा और उदाहरण',
      'अपठित गद्यांश को हल करने के आसान तरीके'
    ],
    'Social Studies': [
      'Explain the rise of nationalism in India and the freedom struggle',
      'What are renewable vs non-renewable resources and conservation?',
      'Explain the three organs of government: Legislature, Executive, Judiciary'
    ],
    'Computer Science': [
      'Explain variables, loops, and conditions in Python',
      'What is cybersecurity, cyber hygiene, and data privacy?'
    ]
  },

  // Senior Secondary (Classes 11 - 12)
  senior: {
    'Maths': [
      'Explain limits and derivatives fundamental concepts',
      'How to solve integration problems using substitution',
      'Explain matrices, determinants, and systems of equations'
    ],
    'Science': [
      'Explain thermodynamics laws and Carnot engine efficiency',
      'What is wave optics and Young\'s double slit experiment?',
      'Explain organic chemistry reaction mechanisms and functional groups'
    ],
    'English': [
      'How to write an article, report, and speech for board exams',
      'In-depth thematic analysis of prescribed literature texts'
    ],
    'Hindi': [
      'साहित्यिक निबंध और समसामयिक विषयों पर आलेख लेखन'
    ],
    'Social Studies': [
      'Analyze the economic policies and planning in post-independence India',
      'Key constitutional amendments and fundamental rights jurisprudence'
    ],
    'Computer Science': [
      'Explain Object-Oriented Programming (OOP) in Python',
      'SQL queries: SELECT, JOIN, GROUP BY with sample tables'
    ]
  }
};

/**
 * Returns 4-6 recommended learning topics tailored strictly to student's class and subjects.
 */
export function getRecommendedPrompts(studentClass, userSubjects = [], language = 'English') {
  const isHindi = language && language.toLowerCase() === 'hindi';

  // Determine grade tier
  const classMatch = (studentClass || '').match(/\d+/);
  const classNum = classMatch ? parseInt(classMatch[0], 10) : 7;

  let tierKey = 'middle';
  if (classNum <= 5) tierKey = 'primary';
  else if (classNum <= 8) tierKey = 'middle';
  else if (classNum <= 10) tierKey = 'high';
  else tierKey = 'senior';

  const tierData = SYLLABUS_TOPICS[tierKey] || SYLLABUS_TOPICS.middle;

  // Filter by user selected subjects (or default to Maths & Science if empty)
  const activeSubjects = (userSubjects && userSubjects.length > 0)
    ? userSubjects
    : ['Maths', 'Science'];

  const prompts = [];

  // Pick prompts strictly from the student's selected subjects
  activeSubjects.forEach(sub => {
    const list = tierData[sub] || [];
    list.forEach(item => {
      if (item && !prompts.some(p => p.text === item)) {
        prompts.push({
          subject: sub,
          text: item
        });
      }
    });
  });

  // If no prompts found at all for selected subjects, fallback gracefully
  if (prompts.length === 0) {
    Object.keys(tierData).forEach(sub => {
      if (prompts.length < 5) {
        const item = tierData[sub]?.[0];
        if (item && !prompts.some(p => p.text === item)) {
          prompts.push({ subject: sub, text: item });
        }
      }
    });
  }

  // Return top 5-6 prompts matching student's active subjects
  if (isHindi) {
    return prompts.slice(0, 6).map(p => ({
      ...p,
      badge: p.subject
    }));
  }

  return prompts.slice(0, 6);
}

export const DISEASE_DB = {
  turmeric: [
    {
      disease: 'पत्ती पर धब्बा (Leaf Spot)',
      symptoms: [
        'पत्तियों पर छोटे भूरे धब्बे, जो बढ़ते-बढ़ते पीले घेर के साथ दिखते हैं',
        'ज्यादा होने पर पत्तियों के सिरे सूखने लगते हैं',
      ],
      cause: 'फफूंद (फंगस) का संक्रमण, जो ज्यादा नमी और पत्ते गीले रहने पर बढ़ता है।',
      treatment: [
        'बहुत संक्रमित पत्ते हटाएँ और खेत में हवा का आवागमन बढ़ाएँ',
        'अगर रोग फैल रहा हो तो 7–10 दिन के अंतर पर अनुशंसित फफूंदनाशी का छिड़काव करें',
      ],
      pesticide: 'Mancozeb 75% WP या Copper oxychloride (लेबल/स्थानीय सलाह अनुसार)।',
      prevention: [
        'शाम देर से ऊपर से सिंचाई (ओवरहेड) न करें',
        'खेत साफ रखें और उचित दूरी/स्पेसिंग बनाएँ',
        'रोग-मुक्त बीज गांठ/राइजोम उपयोग करें',
      ],
    },
    {
      disease: 'गांठ सड़न (Rhizome Rot)',
      symptoms: [
        'पत्ते पीले पड़ना और पौधे का झुक जाना',
        'गांठ/राइजोम नरम होकर सड़ना, पानी जैसा और बदबू आना',
      ],
      cause: 'खराब निकास/जलभराव वाली मिट्टी में मिट्टी जनित फफूंद का संक्रमण।',
      treatment: [
        'तुरंत निकास सुधारें; खेत में पानी जमा न होने दें',
        'बहुत प्रभावित पौधों/गुच्छों को निकालकर नष्ट करें',
        'प्रभावित जगह पर सलाह अनुसार मिट्टी में दवा घोलकर ड्रेन्चिंग करें',
      ],
      pesticide: 'Metalaxyl + Mancozeb (लेबल अनुसार) मिट्टी ड्रेन्चिंग।',
      prevention: [
        'उठी हुई क्यारी (Raised bed) और अच्छा निकास रखें',
        'रोपाई/बुवाई से पहले बीज गांठ/राइजोम का उपचार करें',
        'फसल चक्र (Rotation) अपनाएँ',
      ],
    },
    {
      disease: 'बैक्टीरियल विल्ट (Bacterial Wilt)',
      symptoms: [
        'शुरू में बिना ज्यादा पीलापन के पौधा अचानक मुरझाना',
        'गांठ के अंदर भूरे रंग की धारियाँ/रंग बदलना',
      ],
      cause: 'बैक्टीरिया का संक्रमण, जो पानी और औजारों/टूल्स से फैल सकता है।',
      treatment: [
        'संक्रमित पौधे निकालकर नष्ट करें',
        'संक्रमित हिस्से की मिट्टी/पानी को दूसरे हिस्से में न जाने दें',
        'औजार साफ रखें और सिंचाई पानी का सही प्रबंधन करें',
      ],
      pesticide: 'Copper आधारित दवा (सहायक; लेबल/स्थानीय सलाह अनुसार)।',
      prevention: [
        'साफ और रोग-मुक्त रोपण सामग्री लें',
        'औजारों को कीटाणुरहित करें',
        'जलभराव से बचें और एक ही खेत में लगातार हल्दी न लें',
      ],
    },
  ],

  tomato: [
    {
      disease: 'अर्ली ब्लाइट (Early Blight)',
      symptoms: [
        'पुराने पत्तों पर गोल-गोल घेरों वाले धब्बे (टारगेट स्पॉट)',
        'पत्ते पीले होकर समय से पहले झड़ना',
      ],
      cause: 'फफूंद का संक्रमण; गर्म और नम मौसम में तेजी से फैलता है।',
      treatment: [
        'नीचे के संक्रमित पत्ते हटाएँ; पत्तों को बार-बार गीला न करें',
        'सुरक्षात्मक फफूंदनाशी छिड़काव करें और जरूरत हो तो 7–10 दिन बाद दोहराएँ',
      ],
      pesticide: 'Mancozeb / Chlorothalonil (लेबल/स्थानीय सलाह अनुसार)।',
      prevention: [
        '2–3 साल फसल चक्र अपनाएँ',
        'मिट्टी के छींटे कम करने के लिए मल्चिंग करें',
        'उचित दूरी रखें और स्टेकिंग/सपोर्ट दें',
      ],
    },
    {
      disease: 'लेट ब्लाइट (Late Blight)',
      symptoms: [
        'पत्तों पर पानी जैसे धब्बे जो बाद में भूरे/काले हो जाते हैं',
        'नमी में पत्ते के नीचे सफेद फफूंद जैसी परत दिखना',
      ],
      cause: 'ठंडे और नम मौसम के बाद होने वाला संक्रमण (लेट ब्लाइट प्रकार)।',
      treatment: [
        'पहले लक्षण पर तुरंत दवा शुरू करें',
        'संक्रमित हिस्से हटाएँ; गीले खेत में अनावश्यक काम न करें',
      ],
      pesticide: 'Metalaxyl + Mancozeb / Cymoxanil मिश्रण (लेबल अनुसार)।',
      prevention: [
        'स्वस्थ पौध/सीडलिंग लगाएँ',
        'अधिक सिंचाई से बचें; निकास अच्छा रखें',
        'मौसम देखकर बारिश से पहले सुरक्षात्मक छिड़काव करें',
      ],
    },
    {
      disease: 'लीफ कर्ल वायरस (Leaf Curl Virus)',
      symptoms: [
        'पत्ते ऊपर की ओर मुड़ना और नसें मोटी दिखना',
        'पौधा बौना रहना और फल कम लगना',
      ],
      cause: 'यह वायरस अधिकतर सफेद मक्खी (Whitefly) से फैलता है।',
      treatment: [
        'बहुत प्रभावित पौधों को शुरू में ही निकाल दें',
        'सफेद मक्खी नियंत्रण के लिए IPM अपनाएँ (पीले स्टिकी ट्रैप, नीम, और जरूरत पर लेबल अनुसार दवा)',
      ],
      pesticide: 'Imidacloprid / Thiamethoxam (लेबल अनुसार; दवा बदल-बदलकर दें)।',
      prevention: [
        'नर्सरी में कीट-रोधी जाली/नेट का उपयोग करें',
        'खेत साफ रखें और खरपतवार नियंत्रण करें',
        'जहाँ उपलब्ध हों वहाँ सहनशील किस्में लें',
      ],
    },
  ],

  potato: [
    {
      disease: 'लेट ब्लाइट (Late Blight)',
      symptoms: ['पत्तों पर गहरे धब्बे, किनारों पर हल्का हरा घेरा', 'भंडारण में कंद (ट्यूबर) सड़ना'],
      cause: 'ठंडे और नम मौसम में तेजी से फैलने वाला संक्रमण।',
      treatment: ['पहला लक्षण दिखते ही दवा शुरू करें', 'बहुत ज्यादा हो तो पत्तियाँ/टॉप काटकर कंद को बचाएँ'],
      pesticide: 'Metalaxyl + Mancozeb / Mandipropamid (लेबल अनुसार)।',
      prevention: ['प्रमाणित बीज लें', 'जलभराव और बहुत घनी फसल से बचें', 'जोखिम वाले मौसम में समय पर छिड़काव शेड्यूल रखें'],
    },
    {
      disease: 'अर्ली ब्लाइट (Early Blight)',
      symptoms: ['पुराने पत्तों पर गोल घेरों वाले भूरे धब्बे', 'धीरे-धीरे पत्ते पीले होकर झड़ना'],
      cause: 'फफूंद का संक्रमण; पौधा कमजोर हो तो ज्यादा बढ़ता है।',
      treatment: ['संतुलित खाद और सिंचाई रखें', 'पहले लक्षण पर सुरक्षात्मक दवा छिड़कें'],
      pesticide: 'Mancozeb (लेबल अनुसार)।',
      prevention: ['फसल चक्र, साफ बीज, और अवशेष प्रबंधन'],
    },
    {
      disease: 'ब्लैक स्कर्फ (Black Scurf)',
      symptoms: ['कंद की सतह पर काले, खुरदरे दाने/परत', 'ज्यादा होने पर अंकुरण कमजोर'],
      cause: 'मिट्टी जनित फफूंद; ठंडी-गीली मिट्टी में बढ़ता है।',
      treatment: ['बहुत ठंडी/गीली मिट्टी में बुवाई न करें', 'बुवाई से पहले बीज उपचार करें'],
      pesticide: 'बीज उपचार फफूंदनाशी (लेबल अनुसार)।',
      prevention: ['बीज ग्रेडिंग, फसल चक्र और अच्छा निकास'],
    },
  ],

  wheat: [
    {
      disease: 'पीला रतुआ (Yellow Rust)',
      symptoms: ['पत्तों पर पीली धारियाँ/पाउडर जैसे दाने', 'दानों का भराव कम होना'],
      cause: 'ठंडे और नम मौसम में बढ़ने वाला फफूंदी रोग।',
      treatment: ['धारियाँ दिखते ही अनुशंसित दवा छिड़कें', 'अधिक नाइट्रोजन से बचें'],
      pesticide: 'Propiconazole / Tebuconazole (लेबल अनुसार)।',
      prevention: ['रतुआ-रोधी किस्म, समय पर बुवाई, संतुलित खाद'],
    },
    {
      disease: 'लूज स्मट (Loose Smut)',
      symptoms: ['बालियों में दाने की जगह काला पाउडर जैसा दिखना'],
      cause: 'बीज से फैलने वाला फफूंदी रोग।',
      treatment: ['केवल स्वस्थ/उपचारित बीज ही बोएँ'],
      pesticide: 'Carboxin आधारित बीज उपचार (लेबल अनुसार)।',
      prevention: ['प्रमाणित बीज और बीज उपचार'],
    },
  ],

  rice: [
    {
      disease: 'ब्लास्ट (Blast)',
      symptoms: ['पत्तों पर हीरे जैसे धब्बे', 'गले (नेक) पर लगने से बालियाँ टूटना/सूखना'],
      cause: 'फफूंदी रोग; ज्यादा नमी और अधिक यूरिया से जोखिम बढ़ता है।',
      treatment: ['अगर रोग फैल रहा हो तो दवा छिड़कें', 'अधिक यूरिया से बचें; दूरी सही रखें'],
      pesticide: 'Tricyclazole / Azoxystrobin मिश्रण (लेबल अनुसार)।',
      prevention: ['रोधी किस्में, संतुलित खाद, खेत की सफाई'],
    },
    {
      disease: 'बैक्टीरियल लीफ ब्लाइट (BLB)',
      symptoms: ['पत्ती के सिरे/किनारे से पीला होकर सूखना', 'ज्यादा होने पर दूधिया रिसाव'],
      cause: 'बारिश/सिंचाई के छींटों से फैलने वाला बैक्टीरियल संक्रमण।',
      treatment: ['निकास सुधारें और अधिक नाइट्रोजन न दें', 'सहायक छिड़काव स्थानीय सलाह अनुसार'],
      pesticide: 'Copper आधारित दवा (सहायक; लेबल अनुसार)।',
      prevention: ['अच्छा बीज, सफाई, और संतुलित खाद'],
    },
  ],

  onion: [
    {
      disease: 'पर्पल ब्लॉच (Purple Blotch)',
      symptoms: ['पत्तों पर बैंगनी/भूरे धब्बे', 'पत्ते सूखने से गांठ/कंद छोटे रहना'],
      cause: 'नमी में बढ़ने वाला फफूंदी रोग।',
      treatment: ['ऊपर से सिंचाई न करें', 'पहले लक्षण पर दवा छिड़कें'],
      pesticide: 'Mancozeb / Propiconazole (लेबल अनुसार)।',
      prevention: ['उचित दूरी, संक्रमित अवशेष हटाएँ, फसल चक्र'],
    },
    {
      disease: 'डाउनी मिल्ड्यू (Downy Mildew)',
      symptoms: ['पत्तों पर हल्के धब्बे और धूसर परत', 'गीले मौसम में पत्ते गिर/ढह जाना'],
      cause: 'ठंडे-गीले मौसम में बढ़ने वाला संक्रमण।',
      treatment: ['दवा शुरू करें और हवा का आवागमन बढ़ाएँ', 'शाम देर से सिंचाई न करें'],
      pesticide: 'Metalaxyl मिश्रण (लेबल अनुसार)।',
      prevention: ['अच्छा निकास, बहुत घनी रोपाई से बचें'],
    },
  ],

  cotton: [
    {
      disease: 'बैक्टीरियल ब्लाइट (Bacterial Blight)',
      symptoms: ['पत्तों पर कोनेदार धब्बे', 'तने पर काले धब्बे/ब्लैक आर्म'],
      cause: 'बारिश के छींटों से फैलने वाला बैक्टीरियल संक्रमण।',
      treatment: ['ऊपर से सिंचाई और अधिक नाइट्रोजन से बचें', 'जरूरत हो तो कॉपर आधारित सहायक छिड़काव करें'],
      pesticide: 'Copper oxychloride (सहायक; लेबल अनुसार)।',
      prevention: ['रोधी किस्म, बीज उपचार, और सफाई'],
    },
    {
      disease: 'लीफ कर्ल (वायरस) (Leaf Curl)',
      symptoms: ['पत्ते मुड़ना/मोटे होना, पौधा बौना', 'ज्यादा होने पर फूल/डोडे गिरना'],
      cause: 'वायरस, जो सफेद मक्खी से फैलता है।',
      treatment: ['IPM से सफेद मक्खी नियंत्रण करें', 'बहुत प्रभावित पौधे जल्दी निकालें'],
      pesticide: 'सफेद मक्खी नियंत्रण हेतु लेबल अनुसार दवा (रोटेशन रखें)।',
      prevention: ['समय पर बुवाई, खरपतवार नियंत्रण, अधिक नाइट्रोजन से बचें'],
    },
  ],

  sugarcane: [
    {
      disease: 'रेड रॉट (Red Rot)',
      symptoms: ['पत्ते सूखना', 'गन्ने के अंदर लाल रंग और सफेद धब्बे/पैच'],
      cause: 'फफूंदी रोग; संक्रमित बीज गन्ने (सेट) से फैलता है।',
      treatment: ['स्वस्थ बीज गन्ना लें; संक्रमित गुच्छे हटाएँ', 'बुवाई से पहले सेट उपचार करें'],
      pesticide: 'सेट उपचार फफूंदनाशी (लेबल अनुसार)।',
      prevention: ['रोधी किस्म और खेत की सफाई'],
    },
  ],

  maize: [
    {
      disease: 'टर्सिकम लीफ ब्लाइट (Turcicum Leaf Blight)',
      symptoms: ['पत्तों पर लंबे सिगार जैसे धब्बे', 'दाने का भराव कम होना'],
      cause: 'नमी में बढ़ने वाला फफूंदी रोग।',
      treatment: ['अगर तेजी से फैल रहा हो तो दवा छिड़कें', 'संतुलित खाद रखें'],
      pesticide: 'Mancozeb / Propiconazole (लेबल अनुसार)।',
      prevention: ['रोधी किस्में, अवशेष प्रबंधन, फसल चक्र'],
    },
  ],

  chilli: [
    {
      disease: 'एन्थ्रेक्नोज/फल सड़न (Anthracnose)',
      symptoms: ['फल पर धँसे हुए काले धब्बे', 'फल गिरना और सड़ना'],
      cause: 'नमी में बढ़ने वाला फफूंदी संक्रमण।',
      treatment: ['संक्रमित फल हटाएँ', 'फूल/फल अवस्था में दवा छिड़कें'],
      pesticide: 'Carbendazim + Mancozeb मिश्रण (लेबल अनुसार)।',
      prevention: ['खेत की सफाई रखें और ऊपर से सिंचाई न करें'],
    },
    {
      disease: 'लीफ कर्ल वायरस (Leaf Curl Virus)',
      symptoms: ['पत्ते मुड़ना, पौधा छोटा रहना, फल कम लगना'],
      cause: 'यह वायरस सफेद मक्खी/थ्रिप्स से फैलता है।',
      treatment: ['IPM से वाहक कीट नियंत्रण करें', 'बहुत संक्रमित पौधे निकालें'],
      pesticide: 'वाहक कीट के लिए लेबल अनुसार दवा (रोटेशन रखें)।',
      prevention: ['स्वस्थ पौध, नेट नर्सरी, खरपतवार नियंत्रण'],
    },
  ],

  soybean: [
    {
      disease: 'रस्ट (Rust)',
      symptoms: ['पत्ते के नीचे लाल-भूरे दाने/फोड़े', 'पत्ते जल्दी झड़ना'],
      cause: 'फफूंदी रोग; नमी में फैलाव बढ़ता है।',
      treatment: ['शुरू में दिखते ही दवा छिड़कें'],
      pesticide: 'Tebuconazole / Propiconazole (लेबल अनुसार)।',
      prevention: ['रोधी किस्म, समय पर बुवाई, बहुत घनी फसल से बचें'],
    },
  ],

  mustard: [
    {
      disease: 'अल्टरनेरिया झुलसा (Alternaria Blight)',
      symptoms: ['पत्तों/फलियों पर घेरों वाले काले धब्बे', 'फलियाँ सिकुड़ना'],
      cause: 'ठंडे-नम मौसम में बढ़ने वाला फफूंदी रोग।',
      treatment: ['धब्बे दिखते ही दवा छिड़कें'],
      pesticide: 'Mancozeb (लेबल अनुसार)।',
      prevention: ['बीज उपचार, उचित दूरी, फसल चक्र'],
    },
  ],

  groundnut: [
    {
      disease: 'टिक्का/लीफ स्पॉट (Tikka Leaf Spot)',
      symptoms: ['पत्तों पर भूरे/काले धब्बे', 'पत्ते झड़ने से दाना भराव कम होना'],
      cause: 'नमी में सामान्य फफूंदी रोग।',
      treatment: ['जोखिम वाले समय में नियमित छिड़काव शेड्यूल रखें'],
      pesticide: 'Chlorothalonil / Mancozeb (लेबल अनुसार)।',
      prevention: ['फसल चक्र, अवशेष प्रबंधन, संतुलित खाद'],
    },
  ],

  pulses: [
    {
      disease: 'विल्ट (Wilt)',
      symptoms: ['पौधे का अचानक झुकना और सूखना', 'अंदर की नलिकाओं में भूरा रंग'],
      cause: 'मिट्टी जनित फफूंद/रोगजनक।',
      treatment: ['संक्रमित पौधे निकालें', 'निकास सुधारें और लगातार दालें न लें'],
      pesticide: 'बीज उपचार फफूंदनाशी (लेबल अनुसार)।',
      prevention: ['रोधी किस्में, फसल चक्र, बीज उपचार'],
    },
  ],
};

const hashToInt = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

export const normalizeCropKey = (cropLabel) => {
  const s0 = String(cropLabel || '').toLowerCase();
  const s = s0
    .replace(/[\u200B-\u200D\uFEFF]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Hindi script (देवनागरी) support
  if (s.includes('धान') || s.includes('चावल')) return 'rice';
  if (s.includes('हल्दी')) return 'turmeric';
  if (s.includes('मिर्च')) return 'chilli';
  if (s.includes('मूंगफली')) return 'groundnut';
  if (s.includes('सरसों')) return 'mustard';
  if (s.includes('सोयाबीन') || s.includes('सोया')) return 'soybean';
  if (s.includes('मक्का') || s.includes('भुट्टा')) return 'maize';
  if (s.includes('कपास') || s.includes('कापूस')) return 'cotton';
  if (s.includes('गन्ना') || s.includes('ईख')) return 'sugarcane';
  if (s.includes('प्याज') || s.includes('पियाज')) return 'onion';
  if (s.includes('आलू')) return 'potato';
  if (s.includes('टमाटर')) return 'tomato';
  if (s.includes('गेहूं') || s.includes('गेहूँ')) return 'wheat';
  if (s.includes('दाल')) return 'pulses';

  // Roman Hindi / English (including common misspellings)
  if (s.includes('rice') || s.includes('paddy') || s.includes('dhan') || s.includes('dhaan') || s.includes('chawal')) return 'rice';
  if (s.includes('turmeric') || s.includes('haldi')) return 'turmeric';
  if (s.includes('chilli') || s.includes('chili') || s.includes('mirch')) return 'chilli';
  if (s.includes('groundnut') || s.includes('peanut') || s.includes('moongfali')) return 'groundnut';
  if (s.includes('mustard') || s.includes('sarson')) return 'mustard';
  if (s.includes('soy')) return 'soybean';
  if (s.includes('maize') || s.includes('corn') || s.includes('makka')) return 'maize';
  if (s.includes('cotton') || s.includes('cotten') || s.includes('kapas')) return 'cotton';
  if (s.includes('sugarcane') || s.includes('ganna')) return 'sugarcane';
  if (s.includes('onion') || s.includes('pyaaz')) return 'onion';
  if (s.includes('potato') || s.includes('aloo')) return 'potato';
  if (s.includes('tomato') || s.includes('tamatar') || s.includes('tamater')) return 'tomato';
  if (s.includes('wheat') || s.includes('gehun') || s.includes('gehu')) return 'wheat';
  if (s.includes('pulse') || s.includes('dal') || s.includes('pigeon pea') || s.includes('chickpea') || s.includes('gram') || s.includes('tur ')) return 'pulses';
  return s.trim();
};

export const pickDiseaseForCrop = (cropLabel, seedStr = '') => {
  const cropKey = normalizeCropKey(cropLabel);
  const list = DISEASE_DB[cropKey];
  if (!list || list.length === 0) return null;

  const idx = hashToInt(`${cropKey}|${seedStr}`) % list.length;
  return { cropKey, ...list[idx] };
};

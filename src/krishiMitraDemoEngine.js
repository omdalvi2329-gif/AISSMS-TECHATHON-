import { normalizeCropKey, pickDiseaseForCrop } from './krishiMitraDiseaseDb';

const randFrom = (arr, seedInt) => {
  if (!arr || arr.length === 0) return '';
  const idx = Math.abs(seedInt) % arr.length;
  return arr[idx];
};

const hashToInt = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

const normalizeHinglish = (input) => {
  let t = String(input || '').toLowerCase();
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, ' ');
  t = t.replace(/[_/\\|]+/g, ' ');
  t = t.replace(/[^\p{L}\p{N}\s]/gu, ' ');

  const fixes = [
    // Common crop misspellings / roman variants
    [/\btamater\b/gi, 'tamatar'],
    [/\btamato\b/gi, 'tomato'],
    [/\bcotten\b/gi, 'cotton'],
    [/\bkotton\b/gi, 'cotton'],
    [/\bkapas\b/gi, 'cotton'],
    [/\bgehu\b/gi, 'gehun'],
    [/\bgehun\b/gi, 'wheat'],
    [/\bgehoo\b/gi, 'wheat'],
    [/\bdhan\b/gi, 'paddy'],
    [/\bdhaan\b/gi, 'paddy'],
    [/\bchawal\b/gi, 'rice'],
    [/\bpyaaz\b/gi, 'onion'],
    [/\baloo\b/gi, 'potato'],
    [/\bmirch\b/gi, 'chilli'],
    [/\bhaldi\b/gi, 'turmeric'],
  ];

  for (const [re, rep] of fixes) t = t.replace(re, rep);
  t = t.replace(/\s+/g, ' ').trim();
  return t;
};

const normalizeText = (s) => normalizeHinglish(s);

const hasAny = (text, keywords) => {
  for (const k of keywords) {
    if (text.includes(k)) return true;
  }
  return false;
};

const cropCatalog = {
  turmeric: {
    name: 'हल्दी',
    aliases: ['turmeric', 'haldi', 'हल्दी', 'curcuma', 'haldi powder', 'कच्ची हल्दी'],
    mandi: ['Sangli', 'Nizamabad', 'Erode'],
    exportMarkets: ['UAE', 'Bangladesh', 'USA', 'Malaysia'],
  },
  tomato: {
    name: 'टमाटर',
    aliases: ['tomato', 'tamatar', 'टमाटर', 'टोमॅटो'],
    mandi: ['Pune', 'Kolar', 'Nashik'],
    exportMarkets: ['Nepal', 'UAE', 'Sri Lanka'],
  },
  potato: {
    name: 'आलू',
    aliases: ['potato', 'aloo', 'आलू', 'पोटॅटो'],
    mandi: ['Agra', 'Indore', 'Hooghly'],
    exportMarkets: ['UAE', 'Nepal', 'Oman'],
  },
  wheat: {
    name: 'गेहूं',
    aliases: ['wheat', 'gehun', 'गेहूं', 'गेहूँ'],
    mandi: ['Indore', 'Kota', 'Ludhiana'],
    exportMarkets: ['Bangladesh', 'UAE', 'Indonesia'],
  },
  rice: {
    name: 'धान',
    aliases: ['rice', 'paddy', 'धान', 'chawal', 'चावल', 'paddy rice'],
    mandi: ['Raipur', 'Kakinada', 'Bardhaman'],
    exportMarkets: ['Saudi Arabia', 'UAE', 'Iran', 'Africa'],
  },
  onion: {
    name: 'प्याज',
    aliases: ['onion', 'pyaz', 'प्याज', 'पियाज'],
    mandi: ['Lasalgaon', 'Pune', 'Mahua'],
    exportMarkets: ['Bangladesh', 'Sri Lanka', 'UAE'],
  },
  cotton: {
    name: 'कपास',
    aliases: ['cotton', 'kapas', 'कपास', 'कापूस'],
    mandi: ['Nagpur', 'Yavatmal', 'Guntur'],
    exportMarkets: ['Bangladesh', 'Vietnam', 'China'],
  },
  sugarcane: {
    name: 'गन्ना',
    aliases: ['sugarcane', 'ganna', 'गन्ना', 'ईख'],
    mandi: ['Kolhapur', 'Meerut', 'Mandya'],
    exportMarkets: ['Ethanol/Industrial demand (domestic)', 'Raw sugar (export)'],
  },
  maize: {
    name: 'मक्का',
    aliases: ['maize', 'corn', 'makka', 'मक्का', 'भुट्टा'],
    mandi: ['Davangere', 'Nizamabad', 'Chhindwara'],
    exportMarkets: ['Vietnam', 'Malaysia', 'Bangladesh'],
  },
  chilli: {
    name: 'मिर्च',
    aliases: ['chilli', 'chili', 'mirch', 'मिर्च', 'लाल मिर्च'],
    mandi: ['Guntur', 'Byadgi', 'Khammam'],
    exportMarkets: ['Thailand', 'Vietnam', 'UAE', 'USA'],
  },
  soybean: {
    name: 'सोयाबीन',
    aliases: ['soybean', 'soyabean', 'soya', 'सोयाबीन', 'सोया'],
    mandi: ['Indore', 'Ujjain', 'Akola'],
    exportMarkets: ['Bangladesh', 'Nepal'],
  },
  mustard: {
    name: 'सरसों',
    aliases: ['mustard', 'sarson', 'सरसों', 'राई'],
    mandi: ['Alwar', 'Bharatpur', 'Sriganganagar'],
    exportMarkets: ['Oil/meal demand (domestic)', 'Nepal'],
  },
  groundnut: {
    name: 'मूंगफली',
    aliases: ['groundnut', 'peanut', 'moongfali', 'मूंगफली', 'शेंगदाणा'],
    mandi: ['Junagadh', 'Rajkot', 'Anantapur'],
    exportMarkets: ['Indonesia', 'Vietnam', 'Philippines', 'UAE'],
  },
  pulses: {
    name: 'दालें',
    aliases: ['pulses', 'dal', 'दाल', 'दालें', 'chana', 'चना', 'tur', 'अरहर', 'gram', 'चना दाल'],
    mandi: ['Latur', 'Akola', 'Bhopal'],
    exportMarkets: ['UAE', 'Nepal'],
  },
};

const cropKeys = Object.keys(cropCatalog);

const buildCropKeywordCombos = () => {
  const taskKeywords = {
    greeting: ['नमस्ते', 'हेलो', 'हाय', 'राम राम', 'नमस्कार', 'hello', 'hi'],
    crop_info: ['खेती', 'कैसे करें', 'जानकारी', 'किस्म', 'variety', 'duration', 'समय'],
    seed_sowing: ['बीज', 'बुवाई', 'रोपाई', 'seed rate', 'seed', 'nursery', 'पौध'],
    soil_info: ['मिट्टी', 'पीएच', 'pH', 'soil', 'जाँच', 'टेस्ट'],
    fertilizer_query: ['खाद', 'उर्वरक', 'यूरिया', 'DAP', 'एनपीके', 'MOP', 'जिंक', 'बोरॉन', 'fertilizer'],
    irrigation_query: ['सिंचाई', 'पानी', 'ड्रिप', 'स्प्रिंकलर', 'water', 'irrigation'],
    disease_query: ['रोग', 'बीमारी', 'कीट', 'पत्ता पीला', 'दाग', 'फफूंद', 'विल्ट', 'झुलसा', 'curl', 'spots', 'disease'],
    crop_price: ['भाव', 'दाम', 'रेट', 'मंडी', 'आज का भाव', 'price', 'rate', 'mandi'],
    msp_scheme: ['MSP', 'एमएसपी', 'सरकारी योजना', 'योजना', 'सब्सिडी', 'pm kisan', 'पीएम किसान'],
    export_query: ['निर्यात', 'export', 'पोर्ट', 'shipment', 'कस्टम', 'दस्तावेज'],
    livestock_query: ['पशुपालन', 'गाय', 'भैंस', 'बकरी', 'मुर्गी', 'दूध', 'डेयरी', 'livestock'],
    organic_farming: ['जैविक', 'organic', 'वर्मी कम्पोस्ट', 'गोबर खाद', 'जीवामृत'],
    modern_farming: ['मल्चिंग', 'पॉलीहाउस', 'ग्रीनहाउस', 'टिशू कल्चर', 'precision', 'मशीन'],
    smart_farming: ['स्मार्ट खेती', 'सेंसर', 'IOT', 'ड्रोन', 'एआई', 'smart'],
    weather_query: ['मौसम', 'बारिश', 'तापमान', 'आर्द्रता', 'forecast', 'weather'],
    insurance: ['फसल बीमा', 'बीमा', 'PMFBY', 'क्लेम', 'insurance'],
    loan: ['कृषि ऋण', 'लोन', 'किसान क्रेडिट कार्ड', 'KCC', 'ब्याज', 'loan'],
    storage: ['भंडारण', 'स्टोरेज', 'गोदाम', 'cold storage', 'नमी', 'कीड़े'],
    profit: ['लाभ', 'कमाई', 'मुनाफा', 'खर्च', 'बचत', 'value addition', 'ब्रांडिंग'],
  };

  const combos = [];
  for (const ck of cropKeys) {
    const aliases = cropCatalog[ck].aliases;
    for (const [, kws] of Object.entries(taskKeywords)) {
      for (const a of aliases) {
        for (const kw of kws) {
          combos.push(`${a} ${kw}`);
        }
      }
    }
  }
  return combos;
};

export const DEMO_COMBO_COUNT = buildCropKeywordCombos().length;

const isOffTopic = (text) => {
  const off = [
    'coding', 'programming', 'javascript', 'react', 'python', 'java', 'कोडिंग', 'प्रोग्रामिंग',
    'politics', 'election', 'government party', 'राजनीति', 'चुनाव',
    'movie', 'bollywood', 'hollywood', 'फिल्म', 'मूवी',
    'cricket', 'ipl', 'football', 'क्रिकेट',
    'stocks', 'share market', 'शेयर', 'स्टॉक',
  ];
  return hasAny(text, off);
};

const detectCropKeyFromText = (text, fallbackCropLabel) => {
  const t = normalizeText(text);
  for (const ck of cropKeys) {
    for (const a of cropCatalog[ck].aliases) {
      if (t.includes(String(a).toLowerCase())) return ck;
    }
  }
  const fb = normalizeCropKey(fallbackCropLabel);
  if (cropCatalog[fb]) return fb;
  return null;
};

const detectIntent = (text, hasImage) => {
  const t = normalizeText(text);

  if (hasAny(t, ['hi', 'hello', 'namaste', 'namaskar', 'good morning', 'good evening', 'hey', 'हाय', 'नमस्ते', 'राम राम', 'नमस्कार'])) return 'greeting';

  if (hasImage || hasAny(t, ['upload', 'image', 'photo', 'leaf', 'spot', 'spots', 'fungus', 'disease', 'blight', 'rot', 'wilt', 'yellow', 'curl', 'कीट', 'रोग', 'बीमारी', 'पत्ता पीला', 'दाग', 'झुलसा', 'विल्ट'])) return 'disease_query';

  if (hasAny(t, ['भाव', 'दाम', 'रेट', 'मंडी', 'आज का भाव', 'price', 'rate', 'mandi', 'market price'])) return 'crop_price';
  if (hasAny(t, ['निर्यात', 'export', 'shipment', 'custom', 'port', 'hs code', 'कस्टम', 'दस्तावेज'])) return 'export_query';
  if (hasAny(t, ['msp', 'एमएसपी', 'योजना', 'सरकारी योजना', 'सब्सिडी', 'pm-kisan', 'pm kisan', 'पीएम किसान'])) return 'msp_scheme';
  if (hasAny(t, ['बीमा', 'फसल बीमा', 'pmfby', 'insurance', 'क्लेम', 'दावा'])) return 'insurance';
  if (hasAny(t, ['ऋण', 'लोन', 'kcc', 'किसान क्रेडिट कार्ड', 'loan', 'ब्याज'])) return 'loan';
  if (hasAny(t, ['भंडारण', 'स्टोरेज', 'गोदाम', 'cold storage', 'नमी', 'storage'])) return 'storage';
  if (hasAny(t, ['लाभ', 'मुनाफा', 'कमाई', 'खर्च', 'profit', 'value addition', 'ब्रांडिंग'])) return 'profit';
  if (hasAny(t, ['बीज', 'बुवाई', 'रोपाई', 'seed rate', 'seed', 'nursery', 'पौध', 'seedling'])) return 'seed_sowing';
  if (hasAny(t, ['मिट्टी', 'पीएच', 'pH', 'soil', 'जाँच', 'टेस्ट'])) return 'soil_info';
  if (hasAny(t, ['खाद', 'उर्वरक', 'यूरिया', 'dap', 'npk', 'mop', 'fertilizer', 'जिंक', 'बोरॉन', 'खत'])) return 'fertilizer_query';
  if (hasAny(t, ['सिंचाई', 'पानी', 'drip', 'sprinkler', 'irrigation', 'water'])) return 'irrigation_query';
  if (hasAny(t, ['मौसम', 'बारिश', 'तापमान', 'आर्द्रता', 'forecast', 'weather', 'humidity'])) return 'weather_query';
  if (hasAny(t, ['जैविक', 'organic', 'वर्मी', 'वर्मी कम्पोस्ट', 'जीवामृत', 'गोबर खाद'])) return 'organic_farming';
  if (hasAny(t, ['पशुपालन', 'गाय', 'भैंस', 'बकरी', 'मुर्गी', 'दूध', 'डेयरी', 'livestock', 'dairy'])) return 'livestock_query';
  if (hasAny(t, ['मल्चिंग', 'पॉलीहाउस', 'ग्रीनहाउस', 'टिशू कल्चर', 'precision', 'मशीन', 'mechanization'])) return 'modern_farming';
  if (hasAny(t, ['स्मार्ट खेती', 'sensor', 'सेंसर', 'iot', 'ड्रोन', 'drone', 'एआई', 'ai', 'smart'])) return 'smart_farming';
  if (hasAny(t, ['कैसे करें', 'जानकारी', 'किस्म', 'duration', 'समय', 'खेती'])) return 'crop_info';

  return 'unknown';
};

const allowedIntents = new Set([
  'greeting',
  'crop_info',
  'crop_price',
  'disease_query',
  'irrigation_query',
  'fertilizer_query',
  'msp_scheme',
  'unknown',
]);

const buildRefusalHindi = () =>
  'माफ़ कीजिए, मैं केवल कृषि/फसल/बाजार भाव/रोग/सिंचाई/खाद और सरकारी योजना से जुड़े सवालों में मदद कर सकता हूँ।';

const buildDetailedGreeting = ({ name }) => {
  const n = name || 'किसान भाई';
  return [
    `नमस्ते ${n}! मैं KrishiMitra AI हूँ।`,
    'मैं खेती, फसल, रोग/कीट, खाद, सिंचाई, बाजार भाव और सरकारी योजनाओं में मदद करता हूँ।',
    'आप अपनी फसल का नाम और समस्या 1–2 पंक्तियों में लिख दें।',
    'यदि संभव हो तो अपना जिला/मंडी का नाम भी बताइए।',
    'मैं आपको व्यावहारिक, किसान‑मित्र सलाह दूँगा।',
    'आप पूछ सकते हैं: भाव, खाद, सिंचाई, रोग के लक्षण, योजना/सब्सिडी।',
  ].join('\n');
};

const buildDetailedCropInfo = ({ cropName, seedInt }) => {
  const c = cropName || 'यह फसल';
  const tipA = seedInt % 2 === 0 ? 'खेत में जलभराव न होने दें और समय पर खरपतवार नियंत्रण करें।' : 'बीज/पौध हमेशा प्रमाणित और स्वस्थ लें।';
  const tipB = seedInt % 3 === 0 ? 'रोग‑कीट की शुरुआत में ही पहचान कर नियंत्रित करना आसान होता है।' : 'मिट्टी परीक्षण कराकर खाद की मात्रा सही तय करें।';
  return [
    `${c} की खेती के लिए सही मौसम, मिट्टी और समय का चयन सबसे जरूरी है।`,
    'उचित किस्म चुनें और खेत में सही दूरी/स्पेसिंग रखें।',
    'बुवाई/रोपाई से पहले खेत की तैयारी और बेसल खाद ठीक से दें।',
    'सिंचाई मिट्टी की नमी देखकर करें; जलभराव से बचें।',
    tipA,
    tipB,
    'आप चाहें तो फसल का चरण (बुवाई/फूल/फल) और जिला बताइए, सलाह और सटीक हो जाएगी।',
  ].join('\n');
};

const buildDetailedMarket = ({ cropKey, seedInt, context }) => {
  const crop = cropCatalog[cropKey] || { name: context?.crop || 'फसल', mandi: ['स्थानीय मंडी'] };
  const mandi = randFrom(crop.mandi, seedInt);
  const price = formatPrice(seedInt, cropKey, context || {});
  const demandLevels = ['कम', 'मध्यम', 'अच्छी', 'बहुत अच्छी'];
  const demand = randFrom(demandLevels, seedInt + 11);
  return [
    `आज ${crop.name} का बाजार भाव कई बातों पर निर्भर करता है (मांग‑आपूर्ति, गुणवत्ता, और मंडी)।`,
    `संदर्भ मंडी: ${mandi} | अनुमानित रेंज: ${price.value} ${price.unit} (स्थानीय रेट अलग हो सकता है)।`,
    `मांग की स्थिति: ${demand} — ग्रेडिंग/नमी/साफ‑सफाई से रेट बेहतर मिलता है।`,
    'बेचने से पहले माल को साफ, सूखा और ग्रेड करके रखें।',
    'अक्सर सुबह की बोली में रेट थोड़ा बेहतर मिल जाता है।',
    'अपने जिला/मंडी का नाम बताएँ, मैं उसी हिसाब से व्यावहारिक सलाह दूँगा।',
  ].join('\n');
};

const buildDetailedFertilizer = ({ cropName, seedInt }) => {
  const c = cropName || 'फसल';
  const micro = seedInt % 2 === 0 ? 'जिंक/बोरॉन की कमी दिखे तो सूक्ष्म पोषक तत्व का स्प्रे करें।' : 'मैग्नीशियम/सल्फर की कमी भी पीलापन बढ़ा सकती है—लक्षण देखकर सुधार करें।';
  return [
    `${c} के लिए संतुलित उर्वरक देना बहुत जरूरी है, खासकर NPK का सही संतुलन।`,
    'बुवाई/रोपाई के समय DAP या NPK को बेसल डोज में दें।',
    'वृद्धि के समय यूरिया को किस्तों में टॉप‑ड्रेसिंग के रूप में दें।',
    'फूल आने/फल बनने के समय पोटाश देना लाभदायक रहता है।',
    micro,
    'सबसे बेहतर है कि मिट्टी परीक्षण की रिपोर्ट के आधार पर मात्रा तय करें।',
    'अगर आप फसल का चरण और एकड़/हेक्टेयर बताएं तो मैं डोज और स्पष्ट बता दूँगा।',
  ].join('\n');
};

const buildDetailedIrrigation = ({ cropName, stage }) => {
  const c = cropName || 'फसल';
  const st = stage || 'फूल/फल वाली अवस्था';
  return [
    `${c} में ${st} बहुत महत्वपूर्ण समय होता है, इसलिए सिंचाई सावधानी से करें।`,
    'इस समय हल्की लेकिन नियमित सिंचाई करें ताकि मिट्टी में नमी बनी रहे।',
    'ज्यादा पानी देने से फूल/फल गिर सकते हैं, इसलिए जलभराव बिल्कुल न होने दें।',
    'ड्रिप सिंचाई सबसे उपयुक्त रहती है, इससे पानी बचता है और नमी नियंत्रित रहती है।',
    'तेज गर्मी में सुबह या शाम के समय सिंचाई करें।',
    'मिट्टी की नमी देखकर ही सिंचाई तय करें—तय तारीख से नहीं।',
  ].join('\n');
};

const buildDetailedDisease = ({ cropLabel, messageSeed }) => {
  const cropKey = normalizeCropKey(cropLabel);
  if (!cropKey || cropKey === '' || !cropCatalog[cropKey]) {
    return [
      'फोटो देखकर रोग/कीट का शक है, पर फसल का नाम साफ़ नहीं है।',
      'कृपया बताइए—यह कौन सी फसल है? (कपास/टमाटर/धान/प्याज आदि)',
      'फसल का नाम मिलते ही मैं लक्षण, कारण और सरल उपचार बता दूँगा।',
      'अगर संभव हो तो 2–3 लक्षण भी लिख दें (दाग/पीला/झुलसा/मुरझाना)।',
      'तस्वीर साफ हो तो पहचान ज्यादा सही होती है।',
    ].join('\n');
  }

  const d = pickDiseaseForCrop(cropKey, messageSeed);
  const cropName = cropCatalog[cropKey]?.name || cropLabel || 'फसल';
  if (!d) {
    return [
      `${cropName} में रोग/कीट की जानकारी अभी पर्याप्त नहीं है।`,
      'कृपया 2–3 लक्षण लिखें (दाग/पीला/झुलसा/मुरझाना) या साफ फोटो भेजें।',
      'तुरंत के लिए जलभराव रोकें और बहुत संक्रमित पत्ते अलग करें।',
      'बिना जरूरत के तेज दवा न करें; पहले सही पहचान जरूरी है।',
      'स्थानीय कृषि सलाह/कृषि केंद्र से भी मदद लें।',
    ].join('\n');
  }

  const symptom = Array.isArray(d.symptoms) && d.symptoms.length ? d.symptoms[0] : 'पत्तों पर बदलाव/दाग';
  const treatment = Array.isArray(d.treatment) && d.treatment.length ? d.treatment[0] : 'प्रभावित हिस्सा हटाकर सलाह अनुसार स्प्रे करें';

  const prevention = Array.isArray(d.prevention) && d.prevention.length ? d.prevention[0] : 'खेत में सफाई और उचित दूरी रखें।';

  return [
    `${cropName} में संभावित रोग/समस्या: ${d.disease}।`,
    `मुख्य लक्षण: ${symptom}।`,
    `संभावित कारण: ${d.cause || 'नमी/संक्रमण/कीट दबाव'}।`,
    `उपचार (पहला कदम): ${treatment}।`,
    `दवा (लेबल अनुसार): ${d.pesticide}।`,
    `बचाव: ${prevention}`,
  ].join('\n');
};

const buildDetailedPestSigns = () => {
  return [
    'फसल में कीट लगने के कुछ सामान्य संकेत इस प्रकार हैं:',
    '• पत्तों में छेद या कटा हुआ हिस्सा',
    '• पत्तों का पीला या मुरझाया दिखना',
    '• तनों में सुराख या सूखी/काली लाइनें',
    '• चिपचिपा पदार्थ (हनीड्यू) या काले धब्बे',
    '• फूल/फल का गिरना या फल पर दाग',
    'ऐसी स्थिति में तुरंत निरीक्षण करें और जरूरत हो तो नीम तेल/अनुशंसित कीटनाशक का छिड़काव करें।',
  ].join('\n');
};

const buildDetailedSoilTesting = () => {
  return [
    'मिट्टी परीक्षण से सही पोषक तत्वों की जानकारी मिलती है और लागत कम होती है।',
    '• खेत के अलग-अलग हिस्सों से मिट्टी का नमूना लें',
    '• 6–8 इंच गहराई से मिट्टी निकालें',
    '• साफ बाल्टी में मिलाकर छाया में सुखाएँ और लैब में जांच कराएं',
    '• रिपोर्ट के आधार पर खाद/चूना/जिप्सम का चयन करें',
    '• हर 2–3 साल में मिट्टी परीक्षण करवाना चाहिए',
    'रिपोर्ट हो तो आप भेजें, मैं उसके अनुसार खाद की सरल सलाह दे दूँगा।',
  ].join('\n');
};

const wrapHindiTtsResponse = (text) => {
  const body = String(text || '').trim();
  const start = 'नमस्कार किसान मित्र,';
  const end = 'अधिक जानकारी के लिए फिर पूछें।';
  if (!body) return `${start}\n${end}`;

  const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const hasStart = lines[0] === start;
  const hasEnd = lines[lines.length - 1] === end;

  const out = [
    ...(hasStart ? [] : [start]),
    ...lines,
    ...(hasEnd ? [] : [end]),
  ];

  return out.join('\n');
};

const finalizeKrishiMitraResponse = (payload) => {
  return {
    ...payload,
    text: wrapHindiTtsResponse(payload?.text),
  };
};

const buildCottonAlternariaLeafSpotHindi = () => {
  return [
    'नमस्कार किसान मित्र,',
    'निदान:',
    'कपास की पत्तियों पर दिख रहे भूरे/काले धब्बे फफूंद जनित रोग "अल्टरनेरिया लीफ स्पॉट" के लक्षण हैं।',
    'क्यों (लक्षण):',
    '• गोल या अनियमित भूरे धब्बे',
    '• धब्बों का फैलना',
    '• पत्तियों का धीरे-धीरे सूखना',
    'कारण:',
    '• अधिक नमी',
    '• बारिश के बाद उमस',
    '• संक्रमित अवशेष',
    'उपचार:',
    '• मैनकोजेब 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें',
    '• या कॉपर ऑक्सीक्लोराइड का उपयोग करें',
    '• 7–10 दिन बाद दोबारा स्प्रे करें',
    'रोकथाम:',
    '• खेत में जलभराव न होने दें',
    '• रोगग्रस्त पत्तियाँ हटाएँ',
    '• फसल चक्र अपनाएँ',
    '• संतुलित खाद दें',
    'अधिक जानकारी के लिए फिर पूछें।',
  ].join('\n');
};

const buildImageDiseaseResponse = ({ msg, cropKey, cropLabel }) => {
  const t = normalizeText(msg);
  const cropName = (cropKey && cropCatalog[cropKey]?.name) || cropLabel || 'फसल';

  const hasSpotCues = hasAny(t, [
    'धब्बे',
    'दाग',
    'स्पॉट',
    'spot',
    'lesion',
    'नेक्रोटिक',
    'necrotic',
    'पैच',
    'patch',
    'गोल',
    'अनियमित',
    'halo',
    'पीला घेरा',
    'yellow halo',
    'brown',
    'black',
    'भूरा',
    'भूरी',
    'काला',
    'काली',
  ]);

  const hasCurlCues = hasAny(t, [
    'कर्ल',
    'curl',
    'मुड़',
    'मुढ़',
    'मुड़ना',
    'पत्ते मुड़',
    'leaf curl',
    'नसें मोटी',
    'vein',
    'vein thick',
    'बौनापन',
    'stunted',
    'stunting',
  ]);

  // CRITICAL RULE: Viral only when curl/vein thickening/stunting cues exist AND spot-lesions are not the primary cue.
  if (hasCurlCues && !hasSpotCues) {
    return [
      `पहचानी गई फसल: ${cropName}`,
      'संभावित समस्या: लीफ कर्ल (वायरल) का शक तभी होता है जब पत्तियाँ साफ़ मुड़ी हों, नसें मोटी हों, और पौधा बौना लगे।',
      'कृपया बताइए: पत्ते ऊपर/नीचे की ओर मुड़ रहे हैं क्या? नसें मोटी दिख रही हैं क्या?',
      'अगर हाँ, तो सफेद मक्खी/थ्रिप्स नियंत्रण (पीले स्टिकी ट्रैप, नीम आधारित स्प्रे) करें।',
      'अगर नहीं, और धब्बे/दाग हैं, तो यह फफूंद जनित लीफ स्पॉट ज्यादा संभव है।',
      'एक साफ फोटो + 2–3 लक्षण लिख देंगे तो निदान और सटीक हो जाएगा।',
    ].join('\n');
  }

  // Spot-based lesions -> fungal leaf spot (Alternaria/Cercospora). Avoid viral guessing.
  if (hasSpotCues) {
    return [
      `पहचानी गई फसल: ${cropName}`,
      'संभावित रोग: फफूंद जनित लीफ स्पॉट (अल्टरनेरिया या सर्कोस्पोरा)।',
      'क्यों: भूरे/काले धब्बे, अनियमित नेक्रोटिक पैच, या धब्बों के आसपास पीला घेरा दिखता है।',
      'कारण: अधिक नमी, बारिश के बाद उमस, और संक्रमित अवशेष।',
      'उपचार: मैनकोजेब 2.5 ग्राम प्रति लीटर या कॉपर ऑक्सीक्लोराइड लेबल अनुसार छिड़काव करें।',
      'रोकथाम: जलभराव न होने दें, रोगग्रस्त पत्तियाँ हटाएँ, और फसल चक्र अपनाएँ।',
    ].join('\n');
  }

  return [
    `पहचानी गई फसल: ${cropName}`,
    'फोटो में रोग/कीट का शक है, पर स्पष्ट संकेत नहीं मिल रहे।',
    'कृपया लिखें: धब्बे हैं या पत्ते मुड़ रहे हैं? और धब्बे किस रंग के हैं?',
    '2–3 लक्षण लिख दें: पीला पड़ना, झुलसना, छेद, सड़न, या मुरझाना।',
    'फोटो साफ और नज़दीक से हो तो पहचान ज्यादा सही होती है।',
    'तब तक: जलभराव रोकें और बहुत संक्रमित पत्ते अलग करें।',
  ].join('\n');
};

const buildShortScheme = ({ text }) => {
  const t = normalizeText(text);
  if (hasAny(t, ['pm kisan', 'पीएम किसान', 'pm-kisan', 'किसान सम्मान निधि'])) {
    return [
      'पीएम-किसान योजना में पात्र किसानों को सालाना आर्थिक सहायता मिलती है।',
      'आधार और बैंक खाते का लिंक सही रखें।',
      'स्टेटस/किस्त की जानकारी आप नजदीकी CSC या आधिकारिक पोर्टल से देख सकते हैं।',
    ].join('\n');
  }
  if (hasAny(t, ['फसल बीमा', 'pmfby', 'बीमा'])) {
    return [
      'प्रधानमंत्री फसल बीमा योजना से प्राकृतिक आपदा में नुकसान पर मुआवजा मिलता है।',
      'कट-ऑफ तारीख से पहले नामांकन जरूरी है।',
      'नुकसान हो तो तुरंत सूचना देकर क्लेम प्रक्रिया शुरू करें।',
    ].join('\n');
  }
  if (hasAny(t, ['kcc', 'किसान क्रेडिट कार्ड'])) {
    return [
      'किसान क्रेडिट कार्ड (KCC) खेती के खर्च के लिए आसान ऋण सुविधा है।',
      'नजदीकी बैंक/सहकारी बैंक में आवेदन करें।',
      'भूमि कागज़, पहचान और बैंक दस्तावेज साथ रखें।',
    ].join('\n');
  }
  if (hasAny(t, ['ट्रैक्टर', 'tractor', 'सब्सिडी'])) {
    return [
      'ट्रैक्टर सब्सिडी राज्य कृषि विभाग की योजनाओं से मिल सकती है।',
      'ऑनलाइन/ऑफलाइन आवेदन और दस्तावेज सत्यापन होता है।',
      'अपने जिले/राज्य का नाम बताएँ तो मैं सही दिशा बता दूँगा।',
    ].join('\n');
  }
  if (hasAny(t, ['ड्रिप', 'drip', 'सूक्ष्म सिंचाई', 'micro irrigation', 'स्प्रिंकलर'])) {
    return [
      'ड्रिप/स्प्रिंकलर पर सूक्ष्म सिंचाई योजना के तहत सब्सिडी मिल सकती है।',
      'अधिकृत वेंडर से इंस्टॉलेशन और बिल जरूरी होते हैं।',
      'अपने ब्लॉक/जिले का नाम बताइए, मैं आवेदन का रास्ता बता दूँगा।',
    ].join('\n');
  }
  if (hasAny(t, ['जैविक', 'organic'])) {
    return [
      'जैविक खेती के लिए प्रशिक्षण और कुछ योजनाओं में अनुदान मिलता है।',
      'नजदीकी कृषि कार्यालय/ATMA/कृषि विभाग से योजना सूची मिलती है।',
      'अपने जिले का नाम बताइए, मैं सही विकल्प बताऊँगा।',
    ].join('\n');
  }
  if (hasAny(t, ['कृषि लोन', 'loan', 'ऋण'])) {
    return [
      'कृषि ऋण बैंक/सहकारी संस्था से दस्तावेज देकर लिया जा सकता है।',
      'KCC के जरिए भी खेती के खर्च के लिए ऋण मिल जाता है।',
      'ब्याज/सब्सिडी नियम बैंक और योजना पर निर्भर करते हैं।',
    ].join('\n');
  }
  if (hasAny(t, ['पशुपालन', 'डेयरी', 'गाय', 'भैंस'])) {
    return [
      'पशुपालन के लिए केंद्र/राज्य की सब्सिडी योजनाएं उपलब्ध रहती हैं।',
      'डेयरी/बकरी/मुर्गी के लिए अलग-अलग योजना हो सकती है।',
      'अपने राज्य/जिला बताइए, मैं सही विभाग/योजना बताऊँगा।',
    ].join('\n');
  }
  if (hasAny(t, ['मृदा स्वास्थ्य कार्ड', 'soil health card'])) {
    return [
      'मृदा स्वास्थ्य कार्ड मिट्टी की गुणवत्ता और पोषक तत्वों की जानकारी देता है।',
      'इससे सही खाद की मात्रा तय करने में मदद मिलती है।',
      'आप नजदीकी कृषि कार्यालय/मिट्टी परीक्षण लैब से बनवा सकते हैं।',
    ].join('\n');
  }
  if (hasAny(t, ['सभी योजनाओं', 'योजनाओं की जानकारी', 'कहाँ मिलेगी', 'website', 'वेबसाइट'])) {
    return [
      'कृषि योजनाओं की जानकारी राज्य कृषि विभाग की वेबसाइट पर मिलती है।',
      'नजदीकी कृषि कार्यालय/CSC से भी सहायता मिलती है।',
      'अपने राज्य/जिला बताइए, मैं जरूरी योजनाओं के नाम बता दूँगा।',
    ].join('\n');
  }

  return [
    'सरकारी योजनाएं राज्य/जिले के अनुसार बदलती हैं।',
    'आप अपना राज्य/जिला बताइए—मैं उसी हिसाब से सही योजना बताऊँगा।',
    'यदि आप MSP/सब्सिडी/बीमा पूछ रहे हैं तो फसल का नाम भी लिख दें।',
  ].join('\n');
};

const matchFaqShortAnswer = (msg, context, farmerName, seedInt) => {
  const t = normalizeText(msg);
  const cropKey = detectCropKeyFromText(t, context?.crop);
  const cropName = cropKey ? cropCatalog[cropKey]?.name : (context?.crop || 'फसल');

  if (!t) return null;

  if (hasAny(t, ['नमस्ते', 'हेलो', 'हाय', 'hello', 'hi', 'राम राम', 'नमस्कार'])) {
    return buildDetailedGreeting({ name: farmerName });
  }

  if (hasAny(t, ['आप कौन', 'who are you', 'tum kaun', 'aap kaun'])) {
    return [
      'मैं KrishiMitra AI हूँ।',
      'मैं फसल, रोग, बाजार भाव और सरकारी योजनाओं की जानकारी देता हूँ।',
      'आप अपना सवाल लिखिए/बोलिए—मैं सरल, व्यावहारिक सलाह दूँगा।',
      'फसल का नाम और जिला/मंडी बताएँ तो जवाब और सटीक होगा।',
      'आप खाद, सिंचाई, कीट/रोग, बाजार भाव या योजना/सब्सिडी पूछ सकते हैं।',
    ].join('\n');
  }

  if (hasAny(t, ['cotton', 'कपास']) && hasAny(t, ['बारे में', 'बताओ', 'जानकारी'])) {
    return [
      'कपास एक नकदी फसल है और गर्म जलवायु में अच्छी होती है।',
      'अच्छी जल निकासी वाली मिट्टी और संतुलित खाद जरूरी है।',
      'समय पर सिंचाई और कीट नियंत्रण से उत्पादन बढ़ता है।',
    ].join('\n');
  }

  if (hasAny(t, ['tomato', 'tamatar', 'टमाटर']) && hasAny(t, ['बारे में', 'बताओ', 'जानकारी'])) {
    return [
      'टमाटर सब्जी की फसल है।',
      'यह आमतौर पर 60–90 दिन में तैयार हो जाती है।',
      'नियमित सिंचाई और कीट नियंत्रण जरूरी है।',
    ].join('\n');
  }

  if (hasAny(t, ['गेहूं', 'गेहूँ', 'wheat']) && hasAny(t, ['कैसे', 'खेती'])) {
    return [
      'गेहूं रबी फसल है और ठंडे मौसम में बोई जाती है।',
      'समय पर खाद और सिंचाई से अच्छी पैदावार मिलती है।',
      'बुवाई समय व किस्म आपके जिले पर निर्भर करती है।',
    ].join('\n');
  }

  if (hasAny(t, ['धान', 'rice', 'paddy']) && hasAny(t, ['कैसे', 'खेती'])) {
    return [
      'धान पानी वाली फसल है।',
      'नर्सरी में पौध तैयार करके रोपाई करें।',
      'खेत में पानी/निकास का सही प्रबंधन रखें।',
    ].join('\n');
  }

  if (hasAny(t, ['टमाटर', 'tamatar', 'tomato']) && hasAny(t, ['भाव', 'दाम', 'रेट', 'price'])) {
    const ck = cropKey || 'tomato';
    return buildDetailedMarket({ cropKey: ck, seedInt, context: context || {} });
  }

  if (hasAny(t, ['कपास', 'cotton']) && hasAny(t, ['भाव', 'दाम', 'रेट', 'price'])) {
    const ck = cropKey || 'cotton';
    return buildDetailedMarket({ cropKey: ck, seedInt, context: context || {} });
  }

  if (hasAny(t, ['कपास', 'cotton']) && hasAny(t, ['खाद', 'उर्वरक', 'fertilizer'])) {
    return buildDetailedFertilizer({ cropName: 'कपास', seedInt });
  }

  if (hasAny(t, ['टमाटर', 'tamatar', 'tomato']) && hasAny(t, ['पत्ते', 'पीले', 'yellow'])) {
    return [
      'टमाटर के पत्ते पीले होना पोषक तत्वों की कमी या रोग/कीट का संकेत हो सकता है।',
      'पहले देखें: पत्तों पर दाग/फफूंद है या नीचे की पत्तियाँ ज्यादा पीली हैं?',
      'हल्का जिंक स्प्रे करें और खेत में जलभराव रोकें।',
      'यदि दाग/फफूंद दिखे तो अनुशंसित फफूंदनाशी लेबल अनुसार करें।',
      '1 फोटो/2–3 लक्षण भेज दें तो मैं ज्यादा सही दिशा बता दूँगा।',
      'मिट्टी परीक्षण/पानी की गुणवत्ता भी असर करती है।',
    ].join('\n');
  }

  if (hasAny(t, ['योजना', 'pm kisan', 'पीएम किसान', 'pmfby', 'फसल बीमा', 'kcc', 'किसान क्रेडिट कार्ड', 'सब्सिडी', 'ड्रिप', 'स्प्रिंकलर', 'मृदा स्वास्थ्य कार्ड', 'soil health card', 'कृषि लोन', 'ऋण', 'पशुपालन', 'डेयरी'])) {
    return buildShortScheme({ text: msg });
  }

  // Generic short answer for crop info if crop detected
  if (cropKey && hasAny(t, ['बताओ', 'जानकारी', 'about', 'बारे में', 'कैसे करें', 'खेती'])) {
    return buildDetailedCropInfo({ cropName: cropName, seedInt });
  }

  return null;
};

const responseVariations = {
  greeting: [
    ({ name, crop }) => `नमस्ते ${name}! 🌾 मैं KrishiMitra AI हूँ। आप **${crop}** के बारे में क्या जानना चाहते हैं?`,
    ({ name, crop }) => `राम राम ${name}! ✅ बताइए **${crop}** में आपकी क्या मदद करूँ—भाव, रोग, खाद, सिंचाई या योजना?`,
    ({ name, crop }) => `नमस्कार ${name}! 🌱 आप सवाल लिखिए/बोलिए, मैं सरल हिन्दी में मार्गदर्शन करूँगा।`,
  ],

  agricultureOnly: [
    () => 'मैं KrishiMitra AI हूँ। मैं केवल कृषि और खेती से जुड़े सवालों में आपकी सहायता कर सकता हूँ।',
  ],
};

const formatPrice = (seedInt, cropKey, location) => {
  const baseByCrop = {
    turmeric: 8500,
    tomato: 1200,
    potato: 1800,
    wheat: 2200,
    rice: 2100,
    onion: 1600,
    cotton: 7000,
    sugarcane: 340,
    maize: 2100,
    chilli: 9000,
    soybean: 4800,
    mustard: 5500,
    groundnut: 6200,
    pulses: 6500,
  };

  const base = baseByCrop[cropKey] || 2500;
  const variation = ((seedInt % 17) - 8) * (base * 0.01);
  const value = Math.max(100, Math.round(base + variation));

  if (cropKey === 'sugarcane') {
    return { unit: '₹/quintal', value };
  }

  return { unit: '₹/quintal', value };
};

const buildMarketHindiResponse = ({ cropKey, seedInt, context }) => {
  const crop = cropCatalog[cropKey] || { name: context.crop || 'फसल', mandi: ['स्थानीय मंडी'] };
  const mandi = randFrom(crop.mandi, seedInt);
  const price = formatPrice(seedInt, cropKey, context.location);

  const demandLevels = ['कम', 'मध्यम', 'अच्छी', 'बहुत अच्छी'];
  const demand = randFrom(demandLevels, seedInt + 11);

  return [
    `💰 **वर्तमान बाजार स्थिति:** ${crop.name} का भाव (संदर्भ: ${mandi}) लगभग **${price.value} ${price.unit}**`,
    `📊 **मांग:** ${demand} (गुणवत्ता/ग्रेडिंग के अनुसार फर्क पड़ता है)`,
    `📦 **बेचने की सलाह:** साफ़, सूखा और ग्रेड किया हुआ माल रखें। सुबह जल्दी बोली में आमतौर पर बेहतर रेट मिल जाता है।`,
    `📈 **भविष्य अनुमान:** अगले 3–7 दिन में रेट में हल्का उतार-चढ़ाव संभव है। अगर स्टोरेज ठीक है तो 1–2 दिन देखकर बेच सकते हैं।`,
  ].join('\n');
};

const buildExportResponseHindi = ({ cropKey, seedInt }) => {
  const crop = cropCatalog[cropKey] || { name: 'फसल', exportMarkets: ['UAE'] };
  const markets = crop.exportMarkets;
  const m1 = randFrom(markets, seedInt);
  const m2 = randFrom(markets, seedInt + 7);

  const expMin = 1.05 + ((seedInt % 9) * 0.02);
  const expMax = expMin + 0.08;

  return [
    `🌱 फसल: **${crop.name}**`,
    `📋 समस्या / प्रश्न: **निर्यात मार्गदर्शन**`,
    `🔍 कारण: निर्यात में सबसे बड़ा फर्क **ग्रेड, पैकिंग और डॉक्यूमेंट** से आता है।`,
    `💊 समाधान:`,
    `- **मुख्य बाजार:** ${m1}, ${m2}`,
    `- **अनुमानित एक्सपोर्ट रेंज:** ₹${(expMin * 100).toFixed(0)}–₹${(expMax * 100).toFixed(0)} प्रति किलो (ग्रेड/पैकिंग पर निर्भर)`,
    `- **पैकिंग:** मजबूत बॉक्स, नमी नियंत्रण, सही लेबलिंग`,
    `📌 अतिरिक्त सलाह:`,
    `- सामान्य दस्तावेज: इनवॉइस, पैकिंग लिस्ट, (जरूरत अनुसार) फाइटो-सर्टिफिकेट, IEC/APEDA`,
  ].join('\n');
};

const buildFertilizerResponseHindi = ({ cropKey, seedInt, context, question }) => {
  const crop = cropCatalog[cropKey] || { name: context.crop || 'फसल' };
  const stage = context.stage || 'वर्तमान अवस्था';

  const extra = seedInt % 2 === 0
    ? 'अगर उपलब्ध हो तो 1–2 टन/एकड़ अच्छी तरह सड़ी गोबर खाद/कम्पोस्ट डालें।'
    : 'अगर पत्ते पीले हों/फूल झड़ रहे हों तो जिंक/बोरॉन की कमी भी हो सकती है—लक्षण देखकर स्प्रे करें।';

  return [
    `🌱 फसल: **${crop.name}**`,
    `📋 समस्या / प्रश्न: **${question || 'खाद/उर्वरक सलाह'}**`,
    `🔍 कारण: फसल की अवस्था (${stage}) और मिट्टी के अनुसार पोषण की जरूरत बदलती है।`,
    `💊 समाधान:`,
    `- **NPK संतुलन** रखें (खासकर नाइट्रोजन को किस्तों में दें)।`,
    `- **DAP/फॉस्फोरस** जड़ों के पास देने से ज्यादा फायदा होता है।`,
    `- **पोटाश** से गुणवत्ता और रोग-प्रतिरोध बढ़ता है।`,
    `📌 अतिरिक्त सलाह: ${extra}`,
  ].join('\n');
};

const buildIrrigationResponseHindi = ({ cropKey, seedInt, context, question }) => {
  const crop = cropCatalog[cropKey] || { name: context.crop || 'फसल' };
  const soil = context.soil || 'आपकी मिट्टी';
  const stage = context.stage || 'वर्तमान अवस्था';
  const method = seedInt % 2 === 0 ? 'ड्रिप' : 'नाली/फर्रो';

  return [
    `🌱 फसल: **${crop.name}**`,
    `📋 समस्या / प्रश्न: **${question || 'सिंचाई सलाह'}**`,
    `🔍 कारण: ${soil} मिट्टी और ${stage} अवस्था में पानी की जरूरत अलग होती है।`,
    `💊 समाधान:`,
    `- मिट्टी में नमी **बराबर** रखें; **जलभराव** से रोग बढ़ते हैं।`,
    `- संभव हो तो **${method} सिंचाई** अपनाएँ।`,
    `- सुबह जल्दी सिंचाई करें, पत्ते देर तक गीले न रहें।`,
    `📌 अतिरिक्त सलाह: सिंचाई तय तारीख से नहीं, **मिट्टी की नमी** देखकर करें।`,
  ].join('\n');
};

const buildMspSchemeResponseHindi = ({ seedInt }) => {
  const schemes = [
    {
      title: 'पीएम-किसान (PM-KISAN)',
      points: ['पात्र किसानों को किस्तों में सहायता (नियमों के अनुसार)', 'आधार + बैंक विवरण अपडेट रखें', 'किस्त स्टेटस समय-समय पर देखें'],
    },
    {
      title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      points: ['अधिसूचित फसलों के लिए बीमा', 'कट-ऑफ तारीख से पहले नामांकन', 'नुकसान होने पर जल्दी सूचना/दावा करें'],
    },
    {
      title: 'किसान क्रेडिट कार्ड (KCC)',
      points: ['बीज/खाद/दवा जैसे खर्चों के लिए ऋण सुविधा', 'कुछ मामलों में ब्याज लाभ', 'भूमि कागज़ + पहचान दस्तावेज तैयार रखें'],
    },
    {
      title: 'ड्रिप/स्प्रिंकलर सब्सिडी (माइक्रो-इरिगेशन)',
      points: ['ड्रिप/स्प्रिंकलर पर अनुदान (नियमों अनुसार)', 'अधिकृत वेंडर से इंस्टॉलेशन', 'पानी की कमी वाले क्षेत्रों में उपयोगी'],
    },
  ];

  const s = schemes[seedInt % schemes.length];
  return [
    `🌱 फसल: **${'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **MSP/सरकारी योजना**`,
    `🔍 कारण: योजना/एमएसपी का लाभ तभी मिलता है जब **पात्रता और दस्तावेज** सही हों।`,
    `💊 समाधान:`,
    `### ${s.title}`,
    ...s.points.map((p) => `- ${p}`),
    `📌 अतिरिक्त सलाह: अपना **राज्य/जिला** बताइए—मैं आपके क्षेत्र की सबसे काम की योजनाएँ चुनकर बता दूँगा।`,
  ].join('\n');
};

const buildWeatherResponseHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'मौसम आधारित सलाह'}**`,
    `🔍 कारण: बारिश/नमी बढ़ने पर रोग और कीट तेजी से फैल सकते हैं।`,
    `💊 समाधान:`,
    `- **स्थान:** ${context.location || 'आपका क्षेत्र'}`,
    `- बारिश की संभावना हो तो **स्प्रे** बारिश से पहले न करें, और खेत में **निकास** ठीक रखें।`,
    `📌 अतिरिक्त सलाह: मौसम देखकर खेत का काम तय करें—अचानक बारिश में नुकसान कम होगा।`,
  ].join('\n');
};

const buildOrganicResponseHindi = ({ seedInt, context, question }) => {
  const tips = [
    'अच्छी तरह सड़ी कम्पोस्ट/गोबर खाद और मल्चिंग से मिट्टी की नमी और जीवांश बढ़ता है।',
    'नीम आधारित उपाय और फेरोमोन ट्रैप से कीट का दबाव शुरुआती स्तर पर घटता है।',
    'मेड़ पर फूलदार पौधे/बॉर्डर क्रॉप रखें—मित्र कीट बढ़ते हैं।',
    'वर्मी कम्पोस्ट को जड़ों के पास किस्तों में दें।',
  ];

  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'जैविक खेती'}**`,
    `🔍 कारण: जैविक खेती में मिट्टी की सेहत और रोकथाम पर ज्यादा ध्यान देना पड़ता है।`,
    `💊 समाधान:`,
    `- ${randFrom(tips, seedInt)}`,
    `- ${randFrom(tips, seedInt + 3)}`,
    `📌 अतिरिक्त सलाह: अगर रोग/कीट बहुत बढ़ जाए तो **IPM** (एकीकृत प्रबंधन) अपनाएँ और स्थानीय कृषि सलाहकार से मिलें।`,
  ].join('\n');
};

const buildLivestockResponseHindi = ({ seedInt, question }) => {
  const extra = seedInt % 2 === 0
    ? 'बीमार पशु को अलग रखें और नज़दीकी पशु-चिकित्सक से जाँच करवाएँ।'
    : 'दूध बढ़ाने के लिए हरा चारा + मिनरल मिक्सचर नियमित दें और पानी हमेशा साफ रखें।';

  return [
    `🌱 फसल: **${'पशुपालन'}**`,
    `📋 समस्या / प्रश्न: **${question || 'पशुपालन सलाह'}**`,
    `🔍 कारण: दूध/वृद्धि पर सबसे ज्यादा असर **आहार, पानी, और समय पर इलाज** का होता है।`,
    `💊 समाधान:`,
    `- साफ पानी, संतुलित चारा और मिनरल मिक्सचर दें।`,
    `- कृमिनाशक (डिवार्मिंग) और टीकाकरण समय पर कराएँ।`,
    `- पशु-शेड सूखा रखें; मक्खी/किलनी नियंत्रण करें।`,
    `📌 अतिरिक्त सलाह: ${extra}`,
  ].join('\n');
};

const buildSeedSowingHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'बीज और बुवाई'}**`,
    `🔍 कारण: गलत समय/गहराई/बीज दर से अंकुरण और उपज पर असर पड़ता है।`,
    `💊 समाधान:`,
    `- बीज **शुद्ध और उपचारित** (ट्रीटेड) लें।`,
    `- बुवाई की **गहराई** और **बीज दर** फसल के अनुसार रखें।`,
    `- नर्सरी/रोपाई में पौध की उम्र सही रखें।`,
    `📌 अतिरिक्त सलाह: अपना **क्षेत्र** और किस्म बताइए—मैं सही समय और बीज दर बता दूँगा।`,
  ].join('\n');
};

const buildSoilHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'मिट्टी की जानकारी'}**`,
    `🔍 कारण: मिट्टी का pH और जैविक पदार्थ पोषण उपलब्धता तय करते हैं।`,
    `💊 समाधान:`,
    `- 2–3 साल में एक बार **मिट्टी जाँच** कराएँ।`,
    `- pH ज्यादा हो तो जिप्सम/सल्फर जैसी सलाह स्थानीय रिपोर्ट से लें।`,
    `- जैविक पदार्थ बढ़ाने के लिए कम्पोस्ट/हरी खाद/फसल अवशेष उपयोग करें।`,
    `📌 अतिरिक्त सलाह: अगर आपके पास रिपोर्ट है तो pH/N/P/K लिख दें—मैं उसी के अनुसार खाद योजना बना दूँगा।`,
  ].join('\n');
};

const buildInsuranceHindi = ({ question }) => {
  return [
    `🌱 फसल: **${'कृषि सेवा'}**`,
    `📋 समस्या / प्रश्न: **${question || 'फसल बीमा'}**`,
    `🔍 कारण: कट-ऑफ डेट और सही दस्तावेज न हों तो दावा अटक जाता है।`,
    `💊 समाधान:`,
    `- नामांकन **कट-ऑफ तारीख** से पहले करें।`,
    `- नुकसान होते ही फोटो/वीडियो और आवेदन नंबर सुरक्षित रखें।`,
    `- बैंक/सीएससी/ऐप के जरिए दावा समय पर करें।`,
    `📌 अतिरिक्त सलाह: अपना राज्य और फसल बताइए—मैं PMFBY में अगले कदम बता दूँगा।`,
  ].join('\n');
};

const buildLoanHindi = ({ question }) => {
  return [
    `🌱 फसल: **${'कृषि ऋण'}**`,
    `📋 समस्या / प्रश्न: **${question || 'कृषि ऋण / KCC'}**`,
    `🔍 कारण: KCC से समय पर सस्ता ऋण मिल सकता है, पर कागज़ात सही होने चाहिए।`,
    `💊 समाधान:`,
    `- नजदीकी बैंक/सहकारी बैंक में **KCC** के लिए आवेदन करें।`,
    `- भूमि कागज़, आधार, बैंक खाता, फसल जानकारी तैयार रखें।`,
    `- ऋण लेते समय EMI/ब्याज/बीमा शर्तें समझ लें।`,
    `📌 अतिरिक्त सलाह: अगर आप चाहें तो मैं आवश्यक दस्तावेज की चेकलिस्ट दे दूँ।`,
  ].join('\n');
};

const buildStorageHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'भंडारण'}**`,
    `🔍 कारण: नमी/गर्मी/कीट के कारण भंडारण में नुकसान होता है।`,
    `💊 समाधान:`,
    `- माल को **अच्छी तरह सुखाकर** साफ बोरी/क्रेट में रखें।`,
    `- गोदाम में **हवा और नमी नियंत्रण** रखें।`,
    `- कीट/चूहे से बचाव के लिए साफ-सफाई और सुरक्षित उपाय करें।`,
    `📌 अतिरिक्त सलाह: किस फसल का भंडारण है और कितने दिन रखना है—बताइए, मैं सही तरीका बता दूँ।`,
  ].join('\n');
};

const buildProfitHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'लाभ कैसे बढ़ाएं'}**`,
    `🔍 कारण: लागत ज्यादा, सही समय पर बिक्री न होना, और ग्रेडिंग न होना—लाभ घटाते हैं।`,
    `💊 समाधान:`,
    `- बीज/खाद/दवा का उपयोग **माप-तौल** के साथ करें (फालतू खर्च कम होगा)।`,
    `- **ग्रेडिंग + पैकिंग** करें ताकि बेहतर भाव मिले।`,
    `- स्थानीय मंडी के साथ-साथ पास के विकल्प (प्रोसेसिंग/थोक) भी देखें।`,
    `📌 अतिरिक्त सलाह: आपकी फसल, रकबा और लागत बताइए—मैं छोटा सा लाभ-योजना बना दूँगा।`,
  ].join('\n');
};

const buildModernHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'आधुनिक खेती तकनीक'}**`,
    `🔍 कारण: सही तकनीक से पानी, खाद और दवा की बचत होती है और उपज बढ़ती है।`,
    `💊 समाधान:`,
    `- मल्चिंग से नमी बचेगी और खरपतवार कम होंगे।`,
    `- ड्रिप + फर्टिगेशन से पानी/खाद की बचत और समान वितरण होता है।`,
    `- पॉलीहाउस/नेटहाउस में गुणवत्ता और ऑफ-सीजन उत्पादन बढ़ता है।`,
    `📌 अतिरिक्त सलाह: आपकी जगह और बजट बताइए—मैं सबसे उपयोगी तकनीक सुझाऊँगा।`,
  ].join('\n');
};

const buildSmartHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'स्मार्ट खेती'}**`,
    `🔍 कारण: डेटा (मौसम/नमी/कीट दबाव) के आधार पर फैसले लेने से नुकसान कम होता है।`,
    `💊 समाधान:`,
    `- मिट्टी नमी देखकर सिंचाई तय करें।`,
    `- कीट निगरानी के लिए ट्रैप/निरीक्षण रूटीन रखें।`,
    `- जरूरत हो तो ड्रोन/स्प्रे सेवा का उपयोग करें (स्थानीय उपलब्धता अनुसार)।`,
    `📌 अतिरिक्त सलाह: मैं आपके सवाल के अनुसार आसान और कम लागत वाला विकल्प पहले बताऊँगा।`,
  ].join('\n');
};

const buildCropInfoHindi = ({ context, question }) => {
  return [
    `🌱 फसल: **${context?.crop || 'आपकी फसल'}**`,
    `📋 समस्या / प्रश्न: **${question || 'फसल की जानकारी'}**`,
    `🔍 कारण: सही किस्म, समय और दूरी रखने से रोग कम होते हैं और उपज बढ़ती है।`,
    `💊 समाधान:`,
    `- अपने क्षेत्र के अनुसार **उपयुक्त किस्म** चुनें।`,
    `- बुवाई/रोपाई का **समय** मौसम के अनुसार रखें।`,
    `- खेत में **दूरी/स्पेसिंग** सही रखें ताकि हवा चलती रहे।`,
    `📌 अतिरिक्त सलाह: आपका जिला/मौसम बताइए—मैं फसल के हिसाब से छोटा प्लान दे दूँगा।`,
  ].join('\n');
};

const buildDiseaseHindiResponse = ({ cropLabel, messageSeed }) => {
  const cropKey = normalizeCropKey(cropLabel);
  if (!cropKey || cropKey === '' || !cropCatalog[cropKey]) {
    return [
      'फोटो में समस्या दिख रही है, पर फसल का नाम साफ नहीं है।',
      'कृपया फसल का नाम लिखें: कपास, टमाटर, धान, गेहूं, प्याज आदि।',
      'साथ में 2–3 लक्षण भी लिख दें: धब्बे, पीला पड़ना, झुलसना, छेद, सड़न।',
      'फोटो साफ हो तो पहचान ज्यादा सही होती है।',
    ].join('\n');
  }

  const d = pickDiseaseForCrop(cropKey, messageSeed);
  if (!d) {
    const cropName = cropCatalog[cropKey]?.name || cropLabel || 'फसल';
    return [
      `पहचानी गई फसल: ${cropName}`,
      'संभावित रोग: जानकारी अपर्याप्त',
      'कृपया पत्तों के दाग/रंग/किनारा जलना/सड़न जैसे 2–3 लक्षण लिखें।',
      'अभी के लिए: जलभराव रोकें और बहुत संक्रमित पत्ते अलग करें।',
      'दवा छिड़काव से पहले सही पहचान जरूरी है।',
    ].join('\n');
  }

  const cropName = cropCatalog[d.cropKey]?.name || cropLabel || 'फसल';

  return [
    `पहचानी गई फसल: ${cropName}`,
    `संभावित रोग: ${d.disease}`,
    'लक्षण:',
    ...d.symptoms.map((s) => `• ${s}`),
    'उपचार:',
    ...d.treatment.map((s) => `• ${s}`),
    `दवा/स्प्रे (लेबल अनुसार): ${d.pesticide}`,
    'रोकथाम:',
    ...d.prevention.map((s) => `• ${s}`),
  ].join('\n');
};

export const generateKrishiMitraResponse = ({
  message,
  context,
  farmerName,
  currentLanguage,
  hasImage,
}) => {
  const msg = normalizeText(message);
  const seedInt = hashToInt(`${msg}|${context?.crop || ''}|${context?.location || ''}`);

  // Image-first handling (symptom-based): avoid viral guessing unless clear curl cues.
  if (hasImage) {
    const imageCropKey = detectCropKeyFromText(msg, context?.crop) || normalizeCropKey(context?.crop);
    const isCottonAlternariaHint = (t) => {
      return hasAny(t, ['कपास', 'cotton'])
        && hasAny(t, ['धब्बे', 'दाग', 'स्पॉट', 'spot', 'गोल', 'अनियमित', 'काला', 'काली', 'भूरा', 'भूरी', 'brown', 'black']);
    };

    if (isCottonAlternariaHint(msg) || imageCropKey === 'cotton') {
      // If cotton + spot cues, return the exact structured Alternaria answer.
      if (isCottonAlternariaHint(msg)) {
        return finalizeKrishiMitraResponse({
          intent: 'disease_query',
          cropKey: 'cotton',
          text: buildCottonAlternariaLeafSpotHindi(),
        });
      }
    }

    return finalizeKrishiMitraResponse({
      intent: 'disease_query',
      cropKey: imageCropKey,
      text: buildImageDiseaseResponse({ msg: message, cropKey: imageCropKey, cropLabel: context?.crop }),
    });
  }

  if (isOffTopic(msg)) {
    return finalizeKrishiMitraResponse({
      intent: 'agriculture_only',
      cropKey: null,
      text: responseVariations.agricultureOnly[0](),
    });
  }

  const faq = matchFaqShortAnswer(message, context, farmerName, seedInt);
  if (faq) {
    return finalizeKrishiMitraResponse({
      intent: 'faq',
      cropKey: detectCropKeyFromText(msg, context?.crop),
      text: faq,
    });
  }

  const intent = detectIntent(msg, hasImage);
  const cropKey = detectCropKeyFromText(msg, context?.crop);

  if (!allowedIntents.has(intent)) {
    return finalizeKrishiMitraResponse({
      intent: 'refusal',
      cropKey,
      text: buildRefusalHindi(),
    });
  }

  if (intent === 'greeting') {
    return finalizeKrishiMitraResponse({
      intent,
      cropKey,
      text: buildDetailedGreeting({ name: farmerName || 'किसान भाई' }),
    });
  }

  if (intent === 'disease_query') {
    return finalizeKrishiMitraResponse({
      intent,
      cropKey,
      text: buildDetailedDisease({ cropLabel: cropKey || context?.crop, messageSeed: msg || String(seedInt) }),
    });
  }

  if (intent === 'crop_price') {
    const ck = cropKey || normalizeCropKey(context?.crop) || 'wheat';
    return finalizeKrishiMitraResponse({ intent, cropKey: ck, text: buildDetailedMarket({ cropKey: ck, seedInt, context }) });
  }

  if (intent === 'export_query') {
    const ck = cropKey || normalizeCropKey(context?.crop) || 'rice';
    return finalizeKrishiMitraResponse({ intent, cropKey: ck, text: buildExportResponseHindi({ cropKey: ck, seedInt }) });
  }

  if (intent === 'fertilizer_query') {
    const ck = cropKey || normalizeCropKey(context?.crop) || 'maize';
    return finalizeKrishiMitraResponse({ intent, cropKey: ck, text: buildDetailedFertilizer({ cropName: cropCatalog[ck]?.name || context?.crop, seedInt }) });
  }

  if (intent === 'irrigation_query') {
    const ck = cropKey || normalizeCropKey(context?.crop) || 'wheat';
    return finalizeKrishiMitraResponse({
      intent,
      cropKey: ck,
      text: buildDetailedIrrigation({ cropName: cropCatalog[ck]?.name || context?.crop, stage: context?.stage }),
    });
  }

  if (intent === 'msp_scheme') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildShortScheme({ text: message }) });
  }

  if (intent === 'weather_query') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildWeatherResponseHindi({ context, question: message }) });
  }

  if (intent === 'organic_farming') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildOrganicResponseHindi({ seedInt, context, question: message }) });
  }

  if (intent === 'livestock_query') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildLivestockResponseHindi({ seedInt, question: message }) });
  }

  if (intent === 'seed_sowing') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildSeedSowingHindi({ context, question: message }) });
  }

  if (intent === 'soil_info') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildSoilHindi({ context, question: message }) });
  }

  if (intent === 'insurance') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildInsuranceHindi({ question: message }) });
  }

  if (intent === 'loan') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildLoanHindi({ question: message }) });
  }

  if (intent === 'storage') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildStorageHindi({ context, question: message }) });
  }

  if (intent === 'profit') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildProfitHindi({ context, question: message }) });
  }

  if (intent === 'modern_farming') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildModernHindi({ context, question: message }) });
  }

  if (intent === 'smart_farming') {
    return finalizeKrishiMitraResponse({ intent, cropKey, text: buildSmartHindi({ context, question: message }) });
  }

  if (intent === 'crop_info') {
    return finalizeKrishiMitraResponse({
      intent,
      cropKey,
      text: buildDetailedCropInfo({ cropName: cropKey ? cropCatalog[cropKey]?.name : (context?.crop || 'फसल'), seedInt }),
    });
  }

  // Default agriculture fallback
  const fallbackCrop = context?.crop || 'आपकी फसल';
  return finalizeKrishiMitraResponse({
    intent: 'fallback',
    cropKey,
    text: [
      `आप किस विषय पर पूछना चाहते हैं? (फसल/भाव/रोग/खाद/सिंचाई/योजना)`,
      `उदाहरण: "${fallbackCrop} का भाव क्या है"`,
      'या: "पत्ते पीले हो रहे हैं, क्या करें"',
    ].join('\n'),
  });
};

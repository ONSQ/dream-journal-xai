import http from "http";

const API_BASE = process.env.API_URL || "http://localhost:80/api";

interface DreamTestCase {
  id: number;
  title: string;
  text: string;
  expectedSourceType: string[];
  negationTest?: { dimension: string; shouldNotScoreHigh: boolean };
}

const DREAM_CORPUS: DreamTestCase[] = [
  {
    id: 1,
    title: "Pure Spiritual - Angelic Vision",
    text: "I saw an angel standing in a field of golden light. The angel spoke with the voice of God and said I was anointed for a holy calling. I felt divine peace and knew it was a sacred prophecy from heaven. The glory of the Lord filled the temple and I fell to my knees in worship, praying and giving thanks for this blessing.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 2,
    title: "Pure Spiritual - Scripture Revelation",
    text: "In my dream I was reading the Bible in a church when suddenly the scripture came alive. Jesus appeared before me in radiant light and spoke words of salvation and grace. The Holy Spirit filled the room with anointing and I heard a prophetic revelation about forgiveness and redemption. I felt sanctified and blessed by this divine encounter.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 3,
    title: "Pure Spiritual - Prayer Vision",
    text: "I was kneeling in prayer when the heavens opened and I saw the throne of God surrounded by angels of pure light. A holy messenger brought a sacred vision of worship and glory. I felt the presence of the divine spirit, guiding me with wisdom and faith. The radiance was overwhelming and I cried tears of joy at this miraculous revelation.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 4,
    title: "God Dream - Direct Divine Command",
    text: "God spoke directly to me from a blinding pillar of light. His voice thundered with holy authority, commanding me to share a prophecy with the church. Angels surrounded his throne as he revealed sacred scripture about the rapture and salvation. I was anointed by the Holy Spirit and filled with divine wisdom and discernment. The glory was beyond anything I have ever experienced.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 5,
    title: "Pure Trauma - Being Chased",
    text: "I was being chased through a dark alley by a terrifying monster. I screamed in terror but nobody could hear me. I was trapped and helpless, paralyzed with fear and panic. The creature attacked with violent rage, and I felt overwhelming anxiety as I desperately tried to escape. Blood was everywhere and I thought I was dying. I woke up in a cold sweat, heart pounding.",
    expectedSourceType: ["trauma_dominant"],
  },
  {
    id: 6,
    title: "Pure Trauma - Drowning Nightmare",
    text: "I was drowning in dark water, suffocating as waves pulled me under. I felt helpless and terrified, screaming for help but no one came. The fear was paralyzing and I panicked as darkness closed in. I was trapped underwater, unable to escape, overwhelmed by grief and loss. The nightmare was filled with danger and I felt completely powerless and abandoned.",
    expectedSourceType: ["trauma_dominant"],
  },
  {
    id: 7,
    title: "Pure Trauma - Violence and Abuse",
    text: "In the dream I was cornered by an evil figure who tortured me relentlessly. There was violence and abuse everywhere, blood and wounds covering my body. I experienced trauma and shame, feeling humiliated and powerless. The nightmare was filled with rage and death. I was helpless against the attack, suffocating under the weight of fear and terror. PTSD memories flooded back.",
    expectedSourceType: ["trauma_dominant"],
  },
  {
    id: 8,
    title: "Pure Trauma - Falling and Death",
    text: "I was falling from a tall building, screaming in terror as the ground rushed toward me. The fear of death was overwhelming and I felt completely helpless. Dark shadows surrounded me and I knew I was going to be killed. The nightmare was filled with panic and anxiety as I desperately tried to grab something. I was alone, abandoned, and powerless to stop the fall.",
    expectedSourceType: ["trauma_dominant"],
  },
  {
    id: 9,
    title: "Pure Maintenance - Office Day",
    text: "I dreamed about going to work at the office for a regular meeting with my boss and coworkers. We had a conversation about a deadline and I was stressed about being late. Then I drove my car home on the usual road, stopped at a store for shopping, and had dinner with my family. A totally ordinary and mundane everyday routine dream with random fragments.",
    expectedSourceType: ["maintenance_dominant"],
  },
  {
    id: 10,
    title: "Pure Maintenance - School Exam",
    text: "I was back in school taking an exam I had forgotten to study for. The test was confusing and made no sense. My teeth felt weird and I realized I was naked in the classroom. Then I was walking through a store looking for food while talking on my phone. It was a fragmented, random, nonsensical dream about everyday mundane things like commuting and deadlines.",
    expectedSourceType: ["maintenance_dominant"],
  },
  {
    id: 11,
    title: "Pure Maintenance - Driving and Errands",
    text: "I was driving to the store to buy food for a family dinner. My friend called on the phone during the commute to talk about work and a meeting with the boss. I stopped at home to change, then went shopping for ordinary everyday items. The whole dream was a mundane routine of normal activities, fragmented and random, like driving on a familiar road and eating at a restaurant.",
    expectedSourceType: ["maintenance_dominant"],
  },
  {
    id: 12,
    title: "Pure Maintenance - House and Routine",
    text: "I was at home cleaning the house and organizing the bathroom. My coworker stopped by to discuss office stress and a deadline. Then I was eating food at the kitchen table while talking to a friend about money. I walked to the car, drove on a road past a store, went to school for a meeting, and flew over the neighborhood. A weird, fragmented, ordinary, normal, everyday, mundane dream.",
    expectedSourceType: ["maintenance_dominant"],
  },
  {
    id: 13,
    title: "Mixed Spiritual-Trauma - Spiritual Warfare",
    text: "I was in a dark battlefield where demons attacked me with terrifying violence. I screamed in fear but then an angel appeared with a sword of holy light. God spoke to me through the chaos, saying I was protected by divine grace. The nightmare shifted as prayer drove the evil shadows away. I felt both terror and sacred peace as the spiritual battle raged between heaven and the dark forces.",
    expectedSourceType: ["mixed_spiritual_trauma", "spiritual_dominant"],
  },
  {
    id: 14,
    title: "Mixed Spiritual-Trauma - Healing from Darkness",
    text: "The dream began as a nightmare where I was chased by a monster through a dark forest of fear and terror. I was helpless and panicking until a holy vision of Jesus appeared. He spoke words of salvation and divine protection, driving away the evil with sacred scripture. The trauma transformed into a spiritual encounter with God as angels surrounded me in prayer and worship, healing my wounds.",
    expectedSourceType: ["mixed_spiritual_trauma", "mixed_all"],
  },
  {
    id: 15,
    title: "Mixed Spiritual-Trauma - Demonic Oppression",
    text: "Demons and evil spirits attacked me in a terrifying nightmare of darkness and violence. I was paralyzed with fear, trapped and suffocating under their power. But then I heard the voice of God commanding them to flee in the name of Jesus. Holy angels brought divine light and sacred protection. I prayed desperately as the spiritual warfare intensified, feeling both trauma and faith simultaneously.",
    expectedSourceType: ["mixed_spiritual_trauma", "trauma_dominant"],
  },
  {
    id: 16,
    title: "Mixed All - Complex Multi-Dimensional",
    text: "I was driving to work when suddenly I saw an angel on the road. The office transformed into a church where God spoke a prophecy. Then a monster attacked and I was chased through a dark school hallway, screaming in terror. I escaped by praying and found myself shopping at a store, buying food with my family. A confusing mundane nightmare with holy visions and traumatic fear all mixed together.",
    expectedSourceType: ["mixed_spiritual_trauma", "mixed_all"],
  },
  {
    id: 17,
    title: "Mixed All - Dream Within a Dream",
    text: "I was at home eating dinner in an ordinary routine when Jesus appeared at my door in divine glory. He warned me about a terrifying danger and I felt fear and panic. Angels guided me through a dark nightmare landscape while I walked through a mundane office meeting. The dream was fragmented and random, mixing sacred prophecy with trauma and everyday stress about deadlines and work.",
    expectedSourceType: ["mixed_spiritual_trauma", "mixed_all"],
  },
  {
    id: 18,
    title: "Negation Test - Not a Nightmare",
    text: "This was not a nightmare at all. I did not feel any fear or terror. There was no violence and no danger. I wasn't being chased or attacked. It was actually a peaceful walk through a garden where I saw beautiful flowers and felt calm. Nothing scary happened, nobody was hurt, and I never felt trapped or helpless. It was just a pleasant, normal experience.",
    expectedSourceType: ["maintenance_dominant", "mixed_all", "trauma_dominant"],
    negationTest: { dimension: "Trauma", shouldNotScoreHigh: true },
  },
  {
    id: 19,
    title: "Negation Test - Not Spiritual",
    text: "I did not see God or any angels. There was no divine presence and no holy light. I wasn't praying or reading scripture. It was not a prophetic vision and there was no sacred revelation. I was simply walking through a normal city, shopping at stores and driving my car on ordinary roads. A completely mundane and routine dream without any spiritual significance.",
    expectedSourceType: ["maintenance_dominant"],
    negationTest: { dimension: "Spiritual", shouldNotScoreHigh: true },
  },
  {
    id: 20,
    title: "Short Dream - Low Confidence",
    text: "I saw a bright light and felt peaceful.",
    expectedSourceType: ["spiritual_dominant", "mixed_all", "maintenance_dominant"],
  },
  {
    id: 21,
    title: "Pure Spiritual - Prophetic Warning",
    text: "The Lord gave me a prophetic warning through a vivid vision. I stood in a holy temple surrounded by divine radiance and heard the voice of God speaking sacred truths from scripture. Angels sang worship songs of glory and praise. The Holy Spirit anointed me with wisdom and discernment to share this revelation with the church. I prayed and felt blessed by this miraculous intercession from heaven.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 22,
    title: "Pure Trauma - Childhood Fear",
    text: "I was a child again, hiding under the bed from a terrifying shadow monster. I was paralyzed with fear and could not scream or escape. The darkness was suffocating and I felt helpless and abandoned. The nightmare was filled with anxiety and panic as the creature chased me through an endless dark hallway. I was trapped, alone, and overwhelmed by terror and grief. The violence felt real.",
    expectedSourceType: ["trauma_dominant"],
  },
  {
    id: 23,
    title: "Maintenance - Flying Dream",
    text: "I was flying over my neighborhood, looking down at ordinary houses and streets. Then I was at school for a weird exam about random subjects. My teeth started falling out while I was naked in a meeting at the office. I talked to my boss about a deadline while eating food from a store. A confusing, fragmented, mundane dream of everyday normal routines and random nonsensical events.",
    expectedSourceType: ["maintenance_dominant", "mixed_all"],
  },
  {
    id: 24,
    title: "Spiritual - Throne Room Encounter",
    text: "I was transported to the throne room of God where I beheld his glory and majesty. Heavenly angels worshipped with songs of praise and holiness. The light was pure and divine, filling me with sacred awe. God spoke a word of prophecy and revelation about faith and righteousness. The Holy Spirit's presence was like a holy fire of anointing, and I received a blessing of grace, salvation and love.",
    expectedSourceType: ["spiritual_dominant"],
  },
  {
    id: 25,
    title: "Trauma - War Zone",
    text: "I was in a war zone, surrounded by explosions and violence. People were dying all around me and blood covered the ground. I was running in terror, trying to escape the danger but feeling trapped and helpless. A dark figure chased me through the chaos as I screamed in panic. The nightmare was overwhelming with fear, death, and trauma. I felt powerless and abandoned in the darkness.",
    expectedSourceType: ["trauma_dominant"],
  },
];

interface ClassifyResponse {
  success: boolean;
  probabilities: { Spiritual: number; Trauma: number; Maintenance: number };
  shap: { Spiritual: { word: string; weight: number }[]; Trauma: { word: string; weight: number }[]; Maintenance: { word: string; weight: number }[] };
  lime: { Spiritual: { word: string; weight: number }[]; Trauma: { word: string; weight: number }[]; Maintenance: { word: string; weight: number }[] };
  agreement: { Spiritual: number; Trauma: number; Maintenance: number };
  confidenceIntervals: { Spiritual: { lower: number; upper: number; adequate: boolean }; Trauma: { lower: number; upper: number; adequate: boolean }; Maintenance: { lower: number; upper: number; adequate: boolean } };
  counterfactuals: { Spiritual: { remove: string; newProbability: number; delta: number; explanation: string }[]; Trauma: { remove: string; newProbability: number; delta: number; explanation: string }[]; Maintenance: { remove: string; newProbability: number; delta: number; explanation: string }[] };
  sourceType: string;
  sourceInfo: { title: string; icon: string; color: string; guidance: string };
  interpretation: string;
  dimensionInterpretations: { Spiritual: string; Trauma: string; Maintenance: string };
  wordCount: number;
  negationsDetected: number;
  fieldWeighting: boolean;
}

async function postClassify(text: string): Promise<ClassifyResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}/classify`);
    const postData = JSON.stringify({ text });

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

interface TestResult {
  id: number;
  title: string;
  expectedTypes: string[];
  actualType: string;
  sourceTypePass: boolean;
  xaiFieldsPresent: boolean;
  xaiFieldErrors: string[];
  confidenceValid: boolean;
  confidenceErrors: string[];
  agreementValid: boolean;
  agreementErrors: string[];
  negationPass: boolean;
  negationErrors: string[];
  topShapFeatures: string[];
  topLimeFeatures: string[];
  agreementScore: { Spiritual: number; Trauma: number; Maintenance: number };
  wordCount: number;
  anomalies: string[];
  pass: boolean;
}

function validateXAIFields(resp: ClassifyResponse): { present: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredTopLevel: (keyof ClassifyResponse)[] = [
    "probabilities", "shap", "lime", "agreement", "confidenceIntervals",
    "counterfactuals", "sourceType", "sourceInfo", "interpretation",
    "dimensionInterpretations", "wordCount", "negationsDetected", "fieldWeighting",
  ];
  for (const field of requiredTopLevel) {
    if (resp[field] === undefined || resp[field] === null) {
      errors.push(`Missing top-level field: ${field}`);
    }
  }

  const dimensions = ["Spiritual", "Trauma", "Maintenance"] as const;
  for (const dim of dimensions) {
    const prob = resp.probabilities?.[dim];
    if (prob === undefined) errors.push(`probabilities.${dim} missing`);
    else if (typeof prob !== "number" || !Number.isFinite(prob)) errors.push(`probabilities.${dim} is not a finite number (got ${prob})`);

    if (!resp.shap?.[dim] || !Array.isArray(resp.shap[dim])) {
      errors.push(`shap.${dim} missing or not array`);
    }

    if (!resp.lime?.[dim] || !Array.isArray(resp.lime[dim])) {
      errors.push(`lime.${dim} missing or not array`);
    }

    if (resp.agreement?.[dim] === undefined) errors.push(`agreement.${dim} missing`);
    if (!resp.confidenceIntervals?.[dim]) errors.push(`confidenceIntervals.${dim} missing`);

    if (!resp.counterfactuals?.[dim] || !Array.isArray(resp.counterfactuals[dim])) {
      errors.push(`counterfactuals.${dim} missing or not array`);
    }
  }

  const dominantDim = (["Spiritual", "Trauma", "Maintenance"] as const)
    .reduce((max, d) => (resp.probabilities?.[d] ?? 0) > (resp.probabilities?.[max] ?? 0) ? d : max, "Spiritual" as typeof dimensions[number]);

  if (resp.shap?.[dominantDim] && Array.isArray(resp.shap[dominantDim]) && resp.shap[dominantDim].length === 0) {
    errors.push(`shap.${dominantDim} (dominant dimension) is empty — expected non-empty feature list`);
  }
  if (resp.lime?.[dominantDim] && Array.isArray(resp.lime[dominantDim]) && resp.lime[dominantDim].length === 0) {
    errors.push(`lime.${dominantDim} (dominant dimension) is empty — expected non-empty feature list`);
  }
  if (resp.counterfactuals?.[dominantDim] && Array.isArray(resp.counterfactuals[dominantDim]) && resp.counterfactuals[dominantDim].length === 0) {
    errors.push(`counterfactuals.${dominantDim} (dominant dimension) is empty — expected non-empty list`);
  }

  for (const dim of dimensions) {
    if (resp.counterfactuals?.[dim]) {
      for (const cf of resp.counterfactuals[dim]) {
        if (typeof cf.remove !== "string") errors.push(`counterfactual in ${dim} missing 'remove'`);
        if (typeof cf.newProbability !== "number") errors.push(`counterfactual in ${dim} missing 'newProbability'`);
        if (typeof cf.delta !== "number") errors.push(`counterfactual in ${dim} missing 'delta'`);
        if (typeof cf.explanation !== "string") errors.push(`counterfactual in ${dim} missing 'explanation'`);
      }
    }
  }

  return { present: errors.length === 0, errors };
}

function validateConfidenceIntervals(resp: ClassifyResponse): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const dimensions = ["Spiritual", "Trauma", "Maintenance"] as const;
  for (const dim of dimensions) {
    const ci = resp.confidenceIntervals?.[dim];
    if (!ci) { errors.push(`${dim} CI missing`); continue; }
    if (typeof ci.lower !== "number" || !Number.isFinite(ci.lower)) { errors.push(`${dim} CI lower is not a finite number`); continue; }
    if (typeof ci.upper !== "number" || !Number.isFinite(ci.upper)) { errors.push(`${dim} CI upper is not a finite number`); continue; }
    if (typeof ci.adequate !== "boolean") errors.push(`${dim} CI adequate is not a boolean`);
    if (ci.lower > ci.upper) errors.push(`${dim} CI lower (${ci.lower}) > upper (${ci.upper})`);
    if (ci.lower < 0) errors.push(`${dim} CI lower (${ci.lower}) < 0`);
    if (ci.upper > 1) errors.push(`${dim} CI upper (${ci.upper}) > 1`);
  }
  return { valid: errors.length === 0, errors };
}

function validateAgreement(resp: ClassifyResponse): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const dimensions = ["Spiritual", "Trauma", "Maintenance"] as const;
  for (const dim of dimensions) {
    const score = resp.agreement?.[dim];
    if (score === undefined) { errors.push(`${dim} agreement missing`); continue; }
    if (typeof score !== "number" || !Number.isFinite(score)) { errors.push(`${dim} agreement is not a finite number (got ${score})`); continue; }
    if (score < 0 || score > 1) errors.push(`${dim} agreement (${score}) out of 0-1 range`);
  }
  return { valid: errors.length === 0, errors };
}

function validateNegation(resp: ClassifyResponse, test: DreamTestCase): { pass: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!test.negationTest) return { pass: true, errors };

  const dim = test.negationTest.dimension as keyof typeof resp.probabilities;
  const prob = resp.probabilities[dim];

  if (test.negationTest.shouldNotScoreHigh && prob > 0.55) {
    errors.push(`Negation false positive: ${dim} probability is ${prob.toFixed(4)} (expected < 0.55 due to negation)`);
  }

  if (resp.negationsDetected === 0) {
    errors.push(`Expected negations to be detected but negationsDetected = 0`);
  }

  return { pass: errors.length === 0, errors };
}

function getTopFeatures(features: { word: string; weight: number }[], n: number = 3): string[] {
  return features.slice(0, n).map(f => `${f.word}(${f.weight})`);
}

async function runTests(): Promise<void> {
  console.log("=".repeat(120));
  console.log("  XAI DREAM CLASSIFICATION TEST SUITE");
  console.log("=".repeat(120));
  console.log(`\nTesting ${DREAM_CORPUS.length} dream entries against ${API_BASE}/classify\n`);

  const results: TestResult[] = [];

  for (const dream of DREAM_CORPUS) {
    try {
      const resp = await postClassify(dream.text);

      if (!resp.success) {
        results.push({
          id: dream.id, title: dream.title, expectedTypes: dream.expectedSourceType,
          actualType: "ERROR", sourceTypePass: false, xaiFieldsPresent: false,
          xaiFieldErrors: [`API error: ${JSON.stringify(resp)}`], confidenceValid: false,
          confidenceErrors: [], agreementValid: false, agreementErrors: [],
          negationPass: false, negationErrors: [], topShapFeatures: [], topLimeFeatures: [],
          agreementScore: { Spiritual: 0, Trauma: 0, Maintenance: 0 }, wordCount: 0,
          anomalies: ["API returned success=false"], pass: false,
        });
        continue;
      }

      const sourceTypePass = dream.expectedSourceType.includes(resp.sourceType);
      const xaiValidation = validateXAIFields(resp);
      const ciValidation = validateConfidenceIntervals(resp);
      const agValidation = validateAgreement(resp);
      const negValidation = validateNegation(resp, dream);

      const anomalies: string[] = [];
      if (resp.wordCount < 30) anomalies.push(`Low word count (${resp.wordCount})`);
      if (!resp.confidenceIntervals.Spiritual.adequate && resp.wordCount >= 30) anomalies.push("Spiritual CI not adequate despite sufficient words");
      if (dream.negationTest && resp.negationsDetected > 0) {
        const negDim = dream.negationTest.dimension as keyof typeof resp.probabilities;
        if (resp.probabilities[negDim] > 0.40) {
          anomalies.push(`Negation partially effective: ${negDim} prob=${resp.probabilities[negDim].toFixed(4)} still elevated despite ${resp.negationsDetected} negations detected`);
        }
      }
      if (resp.probabilities.Spiritual + resp.probabilities.Trauma + resp.probabilities.Maintenance < 0.95 ||
          resp.probabilities.Spiritual + resp.probabilities.Trauma + resp.probabilities.Maintenance > 1.05) {
        anomalies.push(`Probabilities don't sum to ~1.0 (sum=${(resp.probabilities.Spiritual + resp.probabilities.Trauma + resp.probabilities.Maintenance).toFixed(4)})`);
      }

      const dominantDim = Object.entries(resp.probabilities).sort(([,a],[,b]) => b - a)[0];
      const topShap = getTopFeatures(resp.shap[dominantDim[0] as keyof typeof resp.shap] || []);
      const topLime = getTopFeatures(resp.lime[dominantDim[0] as keyof typeof resp.lime] || []);

      const pass = sourceTypePass && xaiValidation.present && ciValidation.valid && agValidation.valid && negValidation.pass;

      results.push({
        id: dream.id, title: dream.title, expectedTypes: dream.expectedSourceType,
        actualType: resp.sourceType, sourceTypePass, xaiFieldsPresent: xaiValidation.present,
        xaiFieldErrors: xaiValidation.errors, confidenceValid: ciValidation.valid,
        confidenceErrors: ciValidation.errors, agreementValid: agValidation.valid,
        agreementErrors: agValidation.errors, negationPass: negValidation.pass,
        negationErrors: negValidation.errors, topShapFeatures: topShap, topLimeFeatures: topLime,
        agreementScore: resp.agreement, wordCount: resp.wordCount, anomalies, pass,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        id: dream.id, title: dream.title, expectedTypes: dream.expectedSourceType,
        actualType: "NETWORK_ERROR", sourceTypePass: false, xaiFieldsPresent: false,
        xaiFieldErrors: [errMsg], confidenceValid: false, confidenceErrors: [],
        agreementValid: false, agreementErrors: [], negationPass: false, negationErrors: [],
        topShapFeatures: [], topLimeFeatures: [], agreementScore: { Spiritual: 0, Trauma: 0, Maintenance: 0 },
        wordCount: 0, anomalies: [`Network error: ${errMsg}`], pass: false,
      });
    }
  }

  console.log("-".repeat(120));
  console.log(
    padRight("#", 4) +
    padRight("Title", 42) +
    padRight("Expected (any of)", 28) +
    padRight("Actual", 22) +
    padRight("Type", 6) +
    padRight("XAI", 5) +
    padRight("CI", 5) +
    padRight("Agr", 5) +
    padRight("Neg", 5) +
    padRight("Result", 8)
  );
  console.log("-".repeat(120));

  for (const r of results) {
    const line =
      padRight(String(r.id), 4) +
      padRight(r.title.substring(0, 40), 42) +
      padRight(r.expectedTypes.map(t => t.substring(0, 12)).join("|").substring(0, 26), 28) +
      padRight(r.actualType.substring(0, 20), 22) +
      padRight(r.sourceTypePass ? "PASS" : "FAIL", 6) +
      padRight(r.xaiFieldsPresent ? "OK" : "ERR", 5) +
      padRight(r.confidenceValid ? "OK" : "ERR", 5) +
      padRight(r.agreementValid ? "OK" : "ERR", 5) +
      padRight(r.negationPass ? "OK" : "ERR", 5) +
      padRight(r.pass ? "PASS" : "FAIL", 8);
    console.log(line);
  }

  console.log("-".repeat(120));

  console.log("\n" + "=".repeat(120));
  console.log("  DETAILED RESULTS");
  console.log("=".repeat(120));

  for (const r of results) {
    console.log(`\n--- Dream #${r.id}: ${r.title} ---`);
    console.log(`  Expected: ${r.expectedTypes.join(" | ")}  |  Actual: ${r.actualType}  |  Type Match: ${r.sourceTypePass ? "PASS" : "FAIL"}`);
    console.log(`  Word Count: ${r.wordCount}`);
    console.log(`  Agreement: Sp=${r.agreementScore.Spiritual} Tr=${r.agreementScore.Trauma} Mn=${r.agreementScore.Maintenance}`);
    console.log(`  Top SHAP: ${r.topShapFeatures.join(", ") || "(none)"}`);
    console.log(`  Top LIME: ${r.topLimeFeatures.join(", ") || "(none)"}`);

    if (r.xaiFieldErrors.length > 0) console.log(`  XAI Errors: ${r.xaiFieldErrors.join("; ")}`);
    if (r.confidenceErrors.length > 0) console.log(`  CI Errors: ${r.confidenceErrors.join("; ")}`);
    if (r.agreementErrors.length > 0) console.log(`  Agreement Errors: ${r.agreementErrors.join("; ")}`);
    if (r.negationErrors.length > 0) console.log(`  Negation Errors: ${r.negationErrors.join("; ")}`);
    if (r.anomalies.length > 0) console.log(`  Anomalies: ${r.anomalies.join("; ")}`);
    console.log(`  Overall: ${r.pass ? "PASS" : "FAIL"}`);
  }

  const totalPass = results.filter(r => r.pass).length;
  const totalFail = results.filter(r => !r.pass).length;
  const typePass = results.filter(r => r.sourceTypePass).length;
  const xaiPass = results.filter(r => r.xaiFieldsPresent).length;
  const ciPass = results.filter(r => r.confidenceValid).length;
  const agrPass = results.filter(r => r.agreementValid).length;
  const negTests = results.filter(r => r.negationErrors.length > 0 || (DREAM_CORPUS.find(d => d.id === r.id)?.negationTest));
  const negPass = negTests.filter(r => r.negationPass).length;

  console.log("\n" + "=".repeat(120));
  console.log("  SUMMARY");
  console.log("=".repeat(120));
  console.log(`  Total Dreams Tested: ${results.length}`);
  console.log(`  Overall Pass Rate:   ${totalPass}/${results.length} (${((totalPass / results.length) * 100).toFixed(1)}%)`);
  console.log(`  Source Type Match:   ${typePass}/${results.length}`);
  console.log(`  XAI Fields Valid:    ${xaiPass}/${results.length}`);
  console.log(`  Confidence Valid:    ${ciPass}/${results.length}`);
  console.log(`  Agreement Valid:     ${agrPass}/${results.length}`);
  console.log(`  Negation Tests:      ${negPass}/${negTests.length}`);
  console.log(`  Total Failures:      ${totalFail}`);

  if (totalFail > 0) {
    console.log("\n  FAILED DREAMS:");
    for (const r of results.filter(r => !r.pass)) {
      const reasons: string[] = [];
      if (!r.sourceTypePass) reasons.push(`type mismatch (expected ${r.expectedTypes.join("|")}, got ${r.actualType})`);
      if (!r.xaiFieldsPresent) reasons.push("XAI fields invalid");
      if (!r.confidenceValid) reasons.push("CI invalid");
      if (!r.agreementValid) reasons.push("agreement invalid");
      if (!r.negationPass) reasons.push("negation failure");
      if (r.anomalies.length > 0) reasons.push(`anomalies: ${r.anomalies.join(", ")}`);
      console.log(`    #${r.id} ${r.title}: ${reasons.join("; ")}`);
    }
  }

  console.log("=".repeat(120));

  if (totalFail > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str.substring(0, len) : str + " ".repeat(len - str.length);
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

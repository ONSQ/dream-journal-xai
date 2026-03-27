import https from 'https';
import { Buffer } from 'buffer';

const baseUrl = 'https://dream-vigilant-spirit.replit.app/api';

const generatedDreams = [
  // --- SPIRITUAL ---
  {
    title: "The Radiant Angel",
    narrative: "I was standing in a vast, empty field when a blinding light descended from the sky. An angel with wings of pure energy appeared before me. The presence of God was so overwhelming I fell to my knees in prayer. A quiet voice whispered peace into my soul.",
    mode: "vigilant"
  },
  {
    title: "Battle in the Heavens",
    narrative: "I saw a great spiritual warfare spanning across the horizon. Dark shadows resembling a demon were trying to breach a wall of holy fire. I started singing loud songs of worship and praising Jesus, and immediately the shadows dissolved into nothingness.",
    mode: "vigilant"
  },
  {
    title: "The Golden Crown",
    narrative: "I walked into a royal throne room that glowed with unimaginable glory. Someone handed me a heavy golden crown, but I felt too unworthy to wear it. The holy spirit filled the room, confirming my identity as a child of the king before I woke up.",
    mode: "vigilant"
  },
  {
    title: "The Prophet's Mantle",
    narrative: "I encountered an old prophet by a rushing river. He took his heavy woolen cloak and wrapped it around my shoulders. He told me to carry the light of Jesus to the brokenhearted, and as he spoke, I felt an immense surge of divine power.",
    mode: "vigilant"
  },
  {
    title: "Healing Waters",
    narrative: "I waded into a crystal clear pool of water inside an ancient temple. The water glowed with holy light. As I washed my face, I heard the voice of God declaring complete healing and peace over every anxious thought I was carrying.",
    mode: "vigilant"
  },
  {
    title: "Ascension of Light",
    narrative: "I felt my body lifting off the ground, drawn upward by a beam of pure light. The presence of a heavenly host surrounded me, and I felt nothing but perfect peace. I knew I was being shown the glory of the kingdom.",
    mode: "vigilant"
  },
  {
    title: "The Burning Bush",
    narrative: "While walking through an arid desert, I came across a small shrub completely engulfed in holy fire, yet the leaves were not turning to ash. I removed my shoes, knowing I was on sacred ground, and knelt in intense prayer.",
    mode: "vigilant"
  },
  {
    title: "Walking on Water",
    narrative: "A massive storm was raging on the lake, but I saw a figure made of pure light walking on the waves. I knew it was Jesus. He extended his hand to me, and as soon as I took it, the incredible storm ceased entirely and perfect peace remained.",
    mode: "vigilant"
  },
  {
    title: "The Anointing Oil",
    narrative: "An angel appeared in my kitchen carrying a small flask of fragrant anointing oil. They poured it over my head, and it felt warm and heavy. A deep voice spoke out, commissioning me to step into a new spiritual season of faith.",
    mode: "vigilant"
  },
  {
    title: "Sword of the Spirit",
    narrative: "I was handed a brilliant, glowing sword of the spirit during an intense moment of spiritual warfare. Every time I swung the blade, flashes of holy light erupted, pushing back a terrifying demon that was trying to access my home.",
    mode: "restored"
  },
  {
    title: "The Heavenly Choir",
    narrative: "I found myself sitting in an immense cathedral made of glass. Millions of voices were harmonizing in a song of immense glory and praise to God. The sound alone brought profound peace and healing to my physical body.",
    mode: "vigilant"
  },
  {
    title: "Defeating the Serpent",
    narrative: "A massive, terrifying serpent representing a dark demon tried to wrap around my chest to stop me from breathing. I shouted the name of Jesus with all my lungs, and a strike of holy lightning instantly defeated the creature.",
    mode: "restored"
  },
  
  // --- MAINTENANCE ---
  {
    title: "The Unending Exam",
    narrative: "I was sitting in my old college classroom, staring at a massive physics exam. I hadn't studied at all for this test, and the clock was ticking down rapidly. My pencil kept breaking every time I tried to write down an answer.",
    mode: "vigilant"
  },
  {
    title: "Driving in Reverse",
    narrative: "I was driving my car down a busy highway, but somehow the transmission was stuck in reverse. I was trying to steer backward while going sixty miles an hour. I felt stressed about being late for a very important office meeting.",
    mode: "vigilant"
  },
  {
    title: "Packing the Endless House",
    narrative: "I was supposed to be moving out of my house today, but every time I finished packing a cardboard box, three more empty boxes appeared. I was furiously cleaning the floors, worried that the landlord would keep my security deposit.",
    mode: "vigilant"
  },
  {
    title: "Lost at the Grocery Store",
    narrative: "I was wandering through a grocery store the size of a city. I was just trying to do my weekly shopping, but the aisles kept shifting and changing. I couldn't find the checkout counter and realized I forgot all my money.",
    mode: "vigilant"
  },
  {
    title: "The Forgotten Presentation",
    narrative: "I walked into the office conference room to find all the senior executives waiting for my big presentation. I realized I had left my laptop at home and hadn't done any of the work required for the quarterly review. Total embarrassment.",
    mode: "vigilant"
  },
  {
    title: "Late for the Flight",
    narrative: "I was running through a massive airport terminal carrying five heavy suitcases. My flight was boarding in two minutes and my gate was miles away. I was so incredibly late and sweating profusely from all the running and stress.",
    mode: "vigilant"
  },
  {
    title: "Endless Laundry",
    narrative: "I was standing in my basement surrounded by mountains of dirty laundry. Every time I finished cleaning one load in the washing machine, another massive pile of clothes dropped from a chute in the ceiling. It felt like an endless chore.",
    mode: "vigilant"
  },
  {
    title: "Missing the Bus",
    narrative: "I was sprinting down the sidewalk trying to catch the city bus to get to school on time. I was waving frantically, but the driver wouldn't stop. I ended up having to walk five miles in the pouring rain just to get to my first class.",
    mode: "vigilant"
  },
  {
    title: "Organizing the Garage",
    narrative: "I spent hours cleaning and sorting random junk in my old house garage. I kept finding weird gadgets and tools I didn't recognize. Just as I finished organizing everything, an earthquake hit and knocked all the heavy boxes back onto the floor.",
    mode: "vigilant"
  },
  {
    title: "Lost Car Keys",
    narrative: "I spent the entire dream frantically tearing apart my living room looking for my car keys. I checked under the couch, in the fridge, and in the trash. I was going to be terribly late for work if I didn't find them immediately.",
    mode: "vigilant"
  },
  {
    title: "The Broken Printer",
    narrative: "I was in the office trying to print a critical 50-page document for my boss, but the printer kept jamming. Then it started spitting out blank pages, and eventually caught on fire. I couldn't get my work done at all.",
    mode: "vigilant"
  },
  {
    title: "Grocery Shopping Confusion",
    narrative: "I was out shopping for dinner but everything in the store was labeled in a language I didn't understand. I tried to use my money to buy a loaf of bread, but the cashier insisted they only accepted gold coins as payment.",
    mode: "vigilant"
  },

  // --- TRAUMA ---
  {
    title: "The Dark Pursuer",
    narrative: "I was running blindly through a dark, dense forest, constantly tripping over roots. Something terrifying was relentlessly chasing me. I tried to scream for help, but I was completely paralyzed and no sound would come out of my mouth.",
    mode: "restored"
  },
  {
    title: "Teeth Falling Out",
    narrative: "I was looking in a bathroom mirror when my jaw started to ache. Suddenly, all of my teeth began cracking and falling out of my mouth into the sink. I was profusely crying and spitting out copious amounts of dark red blood.",
    mode: "restored"
  },
  {
    title: "The Endless Drop",
    narrative: "I slipped off the edge of a massive, sheer cliff. I was falling rapidly through the icy air, knowing that hitting the ground would mean certain death. I woke up gasping for breath just before I struck the rocks below.",
    mode: "restored"
  },
  {
    title: "Naked in Public",
    narrative: "I walked onto a brightly lit stage in front of thousands of expectant people. Suddenly, I looked down and realized I was completely naked. The crowd started pointing and laughing at me. I tried hiding behind a curtain but couldn't escape.",
    mode: "restored"
  },
  {
    title: "Trapped Underground",
    narrative: "I was crawling through a narrow dirt tunnel that kept getting tighter and tighter until I was completely stuck. I couldn't move my arms or legs. I was suffocating and crying in sheer panic as the dirt walls pressed against my chest.",
    mode: "restored"
  },
  {
    title: "The Silent Scream",
    narrative: "A shadowy intruder broke into my bedroom while I was sleeping. I tried to fight back and was screaming at the top of my lungs, but no audio was produced. The feeling of being entirely paralyzed and defenseless was unbelievably terrifying.",
    mode: "restored"
  },
  {
    title: "Running in Molasses",
    narrative: "A terrifying pack of wolves was chasing me down an empty street. I was trying to sprint away, but it felt like my legs were moving through thick mud or molasses. They kept getting closer while I was moving in horrible slow motion.",
    mode: "restored"
  },
  {
    title: "The Bloody Hands",
    narrative: "I looked down at my hands and they were inexplicably covered in fresh, warm blood. I desperately scrubbed them with soap and scalding water, but the dark red stains wouldn't wash away. I felt an overwhelming sense of guilt and impending death.",
    mode: "restored"
  },
  {
    title: "Hiding in the Closet",
    narrative: "I was hiding in a cramped, dark closet while incredibly loud, aggressive footsteps paced heavily back and forth right outside the door. I was holding my breath, paralyzed by the fear that someone was going to open the door and find me.",
    mode: "restored"
  },
  {
    title: "The Sinking Car",
    narrative: "I was driving over a large bridge when my car suddenly swerved and plummeted into the freezing river below. Water began rapidly filling the cabin. I was screaming and hitting the windows, realizing I was trapped and facing certain death.",
    mode: "restored"
  },
  {
    title: "Lost in the Maze",
    narrative: "I was stuck wandering inside an immense, dark maze made of concrete walls. Every turn led to another dead end. I heard horrible screeches echoing from the shadows, knowing something was hunting me and I had absolutely nowhere left to go.",
    mode: "restored"
  },
  {
    title: "Failing the Rescue",
    narrative: "I saw my best friend dangling precariously over a deep ravine. I ran over and grabbed their hand, but my grip kept slipping. I watched in absolute horror, crying hysterically, as they slipped from my grasp and plummeted out of sight.",
    mode: "restored"
  },

  // --- MIXED (Spiritual + Maintenance + Trauma) ---
  {
    title: "The Demon in the Office",
    narrative: "I was working late at the office trying to finish a massive report for work. Suddenly, the lights flickered and a terrifying demon appeared in the cubicle. I was completely paralyzed by fear, but I managed to whisper a tiny prayer to Jesus, and it vanished.",
    mode: "vigilant"
  },
  {
    title: "School Exam from Hell",
    narrative: "I was taking an impossible math test at school. If I failed, it meant certain death. My pencil turned into a snake and I started bleeding profusely from my nose. I cried out to God for help, and a brilliant, holy angel handed me the answer key.",
    mode: "restored"
  },
  {
    title: "Driving with Angels",
    narrative: "I was driving my car at dangerous speeds down a mountain, completely losing control of the brakes. I was screaming in absolute terror, convinced of my impending death. Suddenly, the passenger seat glowed with light, and an angel grabbed the wheel, bringing absolute peace.",
    mode: "vigilant"
  },
  {
    title: "Cleaning up the Blood",
    narrative: "I was obsessively cleaning the floors of my old house, but I kept finding fresh pools of thick, dark blood. I was crying and hiding in the bathroom out of sheer trauma. Suddenly, a holy voice declared that the house was pure, and the stains vanished into bright light.",
    mode: "restored"
  },
  {
    title: "Chased through the Grocery Store",
    narrative: "I was shopping for groceries when I realized a shadowy man with a knife was brutally chasing me down the aisles. I was running frantically, knocking over cans of soup. I shouted spiritual warfare declarations, and a wall of holy fire blocked his path.",
    mode: "restored"
  },
  {
    title: "Late for Church",
    narrative: "I was terribly late trying to get to church to sing in the choir. I couldn't find my keys and felt stressed as if I was missing an important exam. I tripped and shattered my teeth on the pavement, but a presence of pure glory healed me instantly.",
    mode: "vigilant"
  }
];

function fetchJson(url, options, bodyData) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(bodyData);
    const reqOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(url, reqOptions, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseBody));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function seedDatabase() {
  console.log(`Starting to seed ${generatedDreams.length} dreams into the Replit database...`);
  let successCount = 0;
  
  for (let i = 0; i < generatedDreams.length; i++) {
    const dream = generatedDreams[i];
    const clientId = Date.now() + i; // unique id
    
    const classifyPayload = {
      fields: {
        title: dream.title,
        narrative: dream.narrative
      }
    };

    try {
      console.log(`[${i+1}/${generatedDreams.length}] Classifying: "${dream.title}"...`);
      const resData = await fetchJson(`${baseUrl}/classify`, { method: 'POST' }, classifyPayload);
      
      const classification = resData.success === false ? null : resData;
      
      const entryPayload = {
        clientId: String(clientId),
        mode: dream.mode,
        phase: 'analysis',
        entryDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        data: {
          title: dream.title,
          narrative: dream.narrative,
          _classification: classification
        }
      };

      await fetchJson(`${baseUrl}/entries`, { method: 'POST' }, entryPayload);
      console.log(`  -> Successfully saved with classification.`);
      successCount++;
      
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`  -> Failed to process dream ${i+1}: ${err.message}`);
    }
  }
  
  console.log(`\nFinished! Successfully seeded ${successCount}/${generatedDreams.length} dreams.`);
}

seedDatabase();

export interface MissionDiscovery {
  id: string;
  name: string;
  missionName: string;
  year: string;
  status: 'Completed' | 'Decommissioned' | 'Active';
  location: string;
  tagline: string;
  badge: string;
  machine: {
    title: string;
    description: string;
    specs: { label: string; value: string }[];
    historicalContext: string;
  };
  science: {
    title: string;
    description: string;
    measurements: string[];
    instruments: string;
  };
  whyItMatters: {
    title: string;
    description: string;
    keyTakeaway: string;
  };
  officialSource: {
    title: string;
    url: string;
    agency: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    hint: string;
  };
}

export const MISSIONS_DATA: Record<string, MissionDiscovery> = {
  apollo_lrrr: {
    id: 'apollo_lrrr',
    name: 'Laser Ranging Retroreflector (LRRR)',
    missionName: 'Apollo 11 & Apollo 14/15 ALSEP',
    year: '1969 – Present',
    status: 'Active',
    location: 'Sea of Tranquility & Fra Mauro, Moon',
    tagline: 'Measuring the distance between Earth and Moon with light',
    badge: 'Lunar Reflector Pioneer',
    machine: {
      title: 'Corner-Cube Retroreflector Array',
      description: 'A passive array containing 100 quartz corner-cube prisms mounted in a lightweight aluminum casing. It requires zero electrical power and reflects laser pulses fired from Earth telescopes directly back to their source.',
      specs: [
        { label: 'Power Requirements', value: '0 Watts (100% Passive)' },
        { label: 'Array Size', value: '100 Corner-Cube Prisms' },
        { label: 'Operational Span', value: 'Over 55 Years' },
        { label: 'Target Precision', value: 'Sub-centimeter accuracy' }
      ],
      historicalContext: 'Deployed during the Apollo 11 lunar landing by Neil Armstrong and Buzz Aldrin as part of the Early Apollo Scientific Experiments Package (EASEP).'
    },
    science: {
      title: 'Laser Lunar Ranging Science',
      description: 'Observatories in Texas, Hawaii, and France fire short laser pulses at the reflector. By timing the round-trip travel time of light (approx. 2.5 seconds), scientists compute the exact Earth-Moon distance with millimeter precision.',
      measurements: [
        'Round-trip photon travel time (~2.56 seconds)',
        'Moon orbital recession rate (3.8 cm per year)',
        'Lunar physical librations and core fluid oscillations',
        'Tests of Einstein’s General Theory of Relativity'
      ],
      instruments: '100 fused silica retroreflector prisms with teflon thermal isolation'
    },
    whyItMatters: {
      title: 'Earth-Moon Tidal Dynamics',
      description: 'This experiment provided direct empirical proof that tidal friction causes the Moon to spiral away from Earth by 3.8 centimeters every year. It also showed that the Moon has a fluid outer core.',
      keyTakeaway: 'Even half a century after Apollo astronauts departed, this passive mirror array is still actively providing cutting-edge planetary physics data today!'
    },
    officialSource: {
      title: 'Apollo Lunar Surface Journal & NASA Planetary Science Division',
      url: 'https://www.nasa.gov/mission_pages/apollo/apollo-11.html',
      agency: 'NASA / Lunar and Planetary Institute'
    },
    quiz: {
      question: 'How does the Apollo Laser Ranging Retroreflector operate without batteries or solar panels?',
      options: [
        'It absorbs radio waves from Earth to charge capacitors',
        'It is completely passive: quartz prisms bounce Earth laser beams directly back',
        'It uses a small plutonium radioisotope thermoelectric generator',
        'It stores lunar daylight heat to emit light at night'
      ],
      correctIndex: 1,
      explanation: 'Corner-cube retroreflectors are optical mirrors engineered so any incoming light beam reflects exactly parallel to its entry angle, requiring zero electrical power.',
      hint: 'Think of how bicycle road reflectors shine back car headlights without any batteries!'
    }
  },
  sojourner: {
    id: 'sojourner',
    name: 'Sojourner Microrover',
    missionName: 'Mars Pathfinder',
    year: '1997',
    status: 'Completed',
    location: 'Ares Vallis, Mars (19.13°N, 33.22°W)',
    tagline: 'Humanity’s first wheeled vehicle on another planet',
    badge: 'First Martian Wheels',
    machine: {
      title: 'Rocker-Bogie Microrover',
      description: 'A 10.5 kg (23 lb) six-wheeled robotic explorer measuring just 65 cm long. It featured a revolutionary rocker-bogie suspension system allowing it to climb over obstacles larger than its wheels without tipping over.',
      specs: [
        { label: 'Mass', value: '10.5 kg (23 lbs)' },
        { label: 'Speed', value: '1 cm per second max' },
        { label: 'Mobility System', value: '6-wheel Rocker-Bogie drive' },
        { label: 'Primary Instrument', value: 'Alpha Particle X-Ray Spectrometer (APXS)' }
      ],
      historicalContext: 'Sojourner proved that small, low-cost autonomous rovers could survive the harsh Martian thermal cycle and navigate rocky alien terrain.'
    },
    science: {
      title: 'In-Situ Elemental Rock Analysis',
      description: 'Sojourner used its rear-mounted Alpha Particle X-Ray Spectrometer (APXS) pressed directly against rocks (like "Barnacle Bill" and "Yogi") to determine their chemical elements.',
      measurements: [
        'Silicon, aluminum, magnesium, and iron rock concentrations',
        'Dust magnetic properties via wheel-mounted magnets',
        'Martian soil cohesion and mechanical soil resistance',
        'Martian atmospheric optical opacity'
      ],
      instruments: 'APXS (Alpha Particle X-Ray Spectrometer) & Forward Stereo Hazard Cameras'
    },
    whyItMatters: {
      title: 'Birth of Mobile Planetary Exploration',
      description: 'Sojourner discovered that the rock "Barnacle Bill" was rich in silica, resembling terrestrial andesite volcanic rocks. This suggested that Mars experienced repeated volcanic remelting and crustal evolution.',
      keyTakeaway: 'Sojourner paved the way for larger explorers: Spirit, Opportunity, Curiosity, and Perseverance all use descendants of Sojourner’s rocker-bogie mobility system!'
    },
    officialSource: {
      title: 'NASA Jet Propulsion Laboratory (JPL) Mars Pathfinder Mission Archive',
      url: 'https://mars.nasa.gov/mars-exploration/missions/pathfinder/',
      agency: 'NASA JPL'
    },
    quiz: {
      question: 'What revolutionary mechanical suspension system did Sojourner introduce that is still used on modern Mars rovers?',
      options: [
        'Hydraulic pressurized piston legs',
        'Magnetic levitation runners',
        'The Rocker-Bogie 6-wheel suspension system',
        'Continuous tank-style rubber treads'
      ],
      correctIndex: 2,
      explanation: 'The rocker-bogie design distributes weight evenly and allows wheels to climb obstacles up to twice the wheel diameter while keeping the rover chassis stable.',
      hint: 'Notice how its wheels are linked through hinged joints that rock over obstacles!'
    }
  },
  opportunity: {
    id: 'opportunity',
    name: 'Opportunity Rover (MER-B)',
    missionName: 'Mars Exploration Rover',
    year: '2004 – 2018',
    status: 'Completed',
    location: 'Meridiani Planum, Mars',
    tagline: 'Finding incontrovertible proof of past liquid water on Mars',
    badge: 'Martian Ocean Geologist',
    machine: {
      title: 'Solar-Powered Robotic Field Geologist',
      description: 'A 185 kg robotic geologist designed for a 90-sol warranty mission that astonishingly survived nearly 15 years and drove over 45.16 kilometers (28.06 miles), setting the off-world driving record.',
      specs: [
        { label: 'Mass', value: '185 kg' },
        { label: 'Distance Traveled', value: '45.16 km (Record Holder)' },
        { label: 'Mission Duration', value: '14 years, 138 days (Planned: 90 days)' },
        { label: 'Power Source', value: 'Gallium Arsenide Solar Arrays' }
      ],
      historicalContext: 'Landed inside Eagle Crater after bouncing on airbags on January 25, 2004. Its mission finally concluded during a planet-encircling global dust storm in 2018.'
    },
    science: {
      title: 'Sedimentary Geology & Paleowater Chemistry',
      description: 'Opportunity discovered millions of tiny hematite-rich spherules nicknamed "blueberries" embedded in sedimentary rock sulfate layers, along with cross-bedding ripple patterns carved by flowing ancient surface water.',
      measurements: [
        'Iron oxide mineralogy with the Mössbauer Spectrometer',
        'Layered jarosite and magnesium sulfate evaporites',
        'Sub-millimeter crystal grain structures via Microscopic Imager',
        'Rock abrasion depth profiles using the Rock Abrasion Tool (RAT)'
      ],
      instruments: 'Pancam, Mini-TES, Mössbauer Spectrometer, APXS, Microscopic Imager, RAT'
    },
    whyItMatters: {
      title: 'Proof of Martian Habitability',
      description: 'Opportunity definitively proved that early Mars was not always a frozen, desiccated desert. Billions of years ago, neutral to acidic shallow groundwater and standing pools sustained an environment that could have supported microbial life.',
      keyTakeaway: 'The rocks preserved ancient sedimentary structures formed in saline, acidic groundwater—transforming our understanding of Mars from a dead world to a previously wet one.'
    },
    officialSource: {
      title: 'NASA Mars Exploration Rover Mission (Spirit & Opportunity)',
      url: 'https://mars.nasa.gov/mer/',
      agency: 'NASA JPL'
    },
    quiz: {
      question: 'What famous discovery made by Opportunity provided smoking-gun evidence for past liquid water on Mars?',
      options: [
        'Liquid geysers erupting from sand dunes',
        'Frozen pools of saltwater inside caves',
        'Tiny hematite-rich mineral spherules nicknamed "blueberries" formed in water',
        'Fossilized plants preserved in polar ice'
      ],
      correctIndex: 2,
      explanation: 'The hematite "blueberries" are concretions that grew inside water-saturated sedimentary rock layers as minerals precipitated out of ancient Martian groundwater.',
      hint: 'They are tiny spherical gray beads scattered across Eagle Crater that reminded scientists of fruit in a muffin!'
    }
  },
  insight: {
    id: 'insight',
    name: 'InSight Lander',
    missionName: 'Interior Exploration using Seismic Investigations',
    year: '2018 – 2022',
    status: 'Completed',
    location: 'Elysium Planitia, Mars (4.50°N, 135.62°E)',
    tagline: 'Taking the vital signs of Mars: pulse, temperature, and reflexes',
    badge: 'Seismic Heartbeat Listener',
    machine: {
      title: 'Planetary Geophysical Lander',
      description: 'A stationary scientific lander fitted with an ultra-sensitive French seismometer (SEIS) placed directly on Martian regolith and shielded under a protective thermal and wind aerodynamic dome (WTS).',
      specs: [
        { label: 'Mass', value: '358 kg' },
        { label: 'Primary Sensor', value: 'SEIS (Seismic Experiment for Interior Structure)' },
        { label: 'Wind Shield', value: 'Wind and Thermal Shield (WTS) dome' },
        { label: 'Marsquakes Recorded', value: 'Over 1,318 seismic events' }
      ],
      historicalContext: 'Operated on Elysium Planitia until December 2022 when thick layers of atmospheric dust blocked sunlight to its solar arrays.'
    },
    science: {
      title: 'Martian Seismology & Core-Mantle Layering',
      description: 'By recording seismic waves bouncing through the interior of Mars from over 1,300 marsquakes and meteorite impacts, InSight calculated the thickness of the Martian crust, the mantle composition, and the size of its liquid metallic core.',
      measurements: [
        'Crust thickness: 24 to 72 kilometers with distinct layering',
        'Liquid metallic iron-nickel-sulfur core radius: approx. 1,830 km',
        'Magnitude 5 marsquake recorded in May 2022 (largest ever detected)',
        'Atmospheric acoustic infrasound and thermal variations'
      ],
      instruments: 'SEIS (CNES/NASA), HP3 Heat Flow Probe, RISE (Radio Science Experiment), TWINS'
    },
    whyItMatters: {
      title: 'Cracking Mars’ Inner Anatomy',
      description: 'Before InSight, humanity only had seismic maps of Earth and the Moon. InSight revealed that Mars is seismically alive today, with magma still active beneath Cerberus Fossae and a lighter, more sulfur-rich core than previously hypothesized.',
      keyTakeaway: 'Seismology lets us "see" deep inside planets without digging: every seismic wave acts like a planetary ultrasound machine.'
    },
    officialSource: {
      title: 'NASA InSight Mars Lander Mission & CNES SEIS Science',
      url: 'https://mars.nasa.gov/insight/',
      agency: 'NASA / CNES'
    },
    quiz: {
      question: 'Why did InSight place a domed "Wind and Thermal Shield" (WTS) over its seismometer?',
      options: [
        'To shield the sensor from intense ultraviolet radiation from the sun',
        'To prevent Martian wind vibrations and extreme day/night thermal swings from drowning out faint seismic signals',
        'To trap Martian oxygen for the electronics',
        'To keep Martian dust off the antennas'
      ],
      correctIndex: 1,
      explanation: 'Martian winds and daily temperature swings of over 80°C create ground noise. The aerodynamic shield ensured SEIS could register vibrations smaller than a hydrogen atom!',
      hint: 'Martian wind howling over exposed equipment rattles the ground and mimics false earthquakes.'
    }
  },
  apollo_lrv: {
    id: 'apollo_lrv',
    name: 'Lunar Roving Vehicle (Apollo 17)',
    missionName: 'Apollo 17 Mission',
    year: '1972',
    status: 'Decommissioned',
    location: 'Taurus-Littrow Valley, Moon (20.19°N, 30.77°E)',
    tagline: 'Humanity’s first electric automobile driven on another world',
    badge: 'Lunar Driver Pioneer',
    machine: {
      title: 'Electric 4-Wheel Drive Lunar Rover',
      description: 'A lightweight 210 kg (460 lb) folding electric vehicle developed by Boeing and Delco. Powered by two 36-volt silver-zinc potassium-hydroxide non-rechargeable batteries, featuring individual 0.25-horsepower electric motors inside each of its 4 woven wire mesh wheels.',
      specs: [
        { label: 'Mass', value: '210 kg (Earth) / 35 kg (Moon)' },
        { label: 'Top Speed', value: '13 km/h (8 mph)' },
        { label: 'Total Distance', value: '35.7 km (22.2 miles)' },
        { label: 'Power System', value: 'Dual 36V Silver-Zinc Batteries' }
      ],
      historicalContext: 'Driven by Commander Eugene Cernan and Scientist-Astronaut Harrison Schmitt during Apollo 17, allowing them to explore orange volcanic soil at Shorty Crater and collect 110.5 kg of lunar samples.'
    },
    science: {
      title: 'Geological Sampling & Surface Gravity Surveying',
      description: 'The LRV transformed lunar surface geology from short localized walks into broad regional exploration. It carried the Traverse Gravimeter, Surface Electrical Properties (SEP) transmitter, and a high-gain TV camera antenna.',
      measurements: [
        'Lunar subsurface crustal density via Traverse Gravimeter',
        'Subsurface water/ice electrical permittivity via SEP radar',
        'Discovery of 3.8-billion-year-old orange volcanic glass beads at Shorty Crater',
        'Live color television broadcast of the Lunar Module ascent liftoff'
      ],
      instruments: 'Traverse Gravimeter Experiment (TGE), Surface Electrical Properties (SEP), High-Gain Dish Antenna'
    },
    whyItMatters: {
      title: 'Unlocking Regional Lunar Geology',
      description: 'Without the LRV, Apollo astronauts were restricted to a 1 km walking radius from their Lunar Module. The LRV expanded their exploration range to 7.6 km, enabling the discovery of pyroclastic volcanic glass and deep crustal rocks.',
      keyTakeaway: 'The LRV proved that wheeled electric mobility is essential for exploring vast extraterrestrial landscapes—a design concept inherited by all modern planetary rovers!'
    },
    officialSource: {
      title: 'NASA Apollo 17 Lunar Roving Vehicle Operations Handbook',
      url: 'https://www.nasa.gov/mission_pages/apollo/apollo-17.html',
      agency: 'NASA / National Air and Space Museum'
    },
    quiz: {
      question: 'Why were the Apollo Lunar Roving Vehicle (LRV) wheels made of woven steel wire mesh instead of conventional rubber tires?',
      options: [
        'Rubber tires would pop in space vacuum and degrade under extreme lunar temperatures (-130°C to +120°C)',
        'Steel mesh was much heavier and provided better traction in wet mud',
        'Rubber tires absorbed too much solar energy and melted on contact',
        'Woven wire mesh was required to generate static electricity for the rover battery'
      ],
      correctIndex: 0,
      explanation: 'Air-filled rubber tires would pop in the vacuum of space and degrade in extreme lunar temperature swings (-130°C to +120°C). Open steel wire mesh with titanium chevron treads provided flexible grip over sharp regolith without air pressure.',
      hint: 'Think about what happens to air pressure in a vacuum chamber and how extreme heat/cold affects rubber!'
    }
  },
  surveyor_3: {
    id: 'surveyor_3',
    name: 'Surveyor 3 Robotic Lander',
    missionName: 'Surveyor Program',
    year: '1967 – 1969',
    status: 'Completed',
    location: 'Oceanus Procellarum (Ocean of Storms), Moon',
    tagline: 'The first robotic lander visited on another world by human astronauts',
    badge: 'Pre-Apollo Lunar Scout',
    machine: {
      title: 'Remote Automated Lunar Soil Sampler Lander',
      description: 'A 300 kg tripod lander equipped with a slow-scan television camera and an electric motor-driven soil mechanics surface sampler arm. It achieved a soft landing on April 20, 1967 inside a lunar crater.',
      specs: [
        { label: 'Landing Mass', value: '300 kg (660 lbs)' },
        { label: 'Scoop Arm Reach', value: '1.5 meters (5 feet)' },
        { label: 'TV Images Returned', value: '6,315 photos' },
        { label: 'Apollo Visit Date', value: 'Apollo 12 (Nov 19, 1969)' }
      ],
      historicalContext: 'Two and a half years after Surveyor 3 landed, Apollo 12 astronauts Pete Conrad and Alan Bean landed Lunar Module Intrepid just 180 meters away—performing the first pinpoint human landing in history!'
    },
    science: {
      title: 'Soil Bearing Strength & Long-Term Space Exposure',
      description: 'Surveyor 3 proved the lunar surface regolith could support the weight of heavy Apollo Lunar Modules. In 1969, Apollo 12 astronauts retrieved Surveyor 3’s TV camera and scoop arm to analyze how space radiation affects materials.',
      measurements: [
        'Regolith mechanical bearing strength and cohesion via motorized scoop',
        'Solar thermal discoloration on painted aluminum coatings',
        'Micrometeorite impact cratering density on exposed optical lenses',
        'Microbiological survival test on returned camera components'
      ],
      instruments: 'Surveyor Television System, Soil Mechanics Surface Sampler'
    },
    whyItMatters: {
      title: 'Paving the Way for Human Moon Landings',
      description: 'Before Surveyor 3, scientists feared the Moon was covered in quicksand-like dust that would swallow spacecraft. Surveyor 3 proved the surface was firm regolith, and returning its parts to Earth revealed how solar radiation degrades space hardware.',
      keyTakeaway: 'Surveyor 3 is the ONLY robotic probe on another world ever visited, inspected, and partially retrieved by human beings!'
    },
    officialSource: {
      title: 'NASA Jet Propulsion Laboratory (JPL) Surveyor 3 Science Report',
      url: 'https://www.jpl.nasa.gov/missions/surveyor-3',
      agency: 'NASA JPL'
    },
    quiz: {
      question: 'What unique historic feat did Apollo 12 astronauts Pete Conrad and Alan Bean perform at the Surveyor 3 lander site in 1969?',
      options: [
        'They refueled its engines and launched it back to Earth orbit',
        'They landed 180m away, walked to the lander, and cut off its TV camera to bring back to Earth for analysis',
        'They installed a nuclear solar panel to restart its radio transmissions',
        'They buried the lander under lunar regolith to preserve it from radiation'
      ],
      correctIndex: 1,
      explanation: 'Apollo 12 executed a precision pinpoint landing right next to Surveyor 3. Astronauts walked over, examined the lander, cut off its TV camera and scoop arm with cutters, and brought them back to Earth to analyze long-term space exposure!',
      hint: 'Think about how human astronauts brought robotic parts back to Earth inside their command capsule!'
    }
  }
};


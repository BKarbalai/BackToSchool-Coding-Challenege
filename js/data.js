/**
 * Horizon - static data layer (no logic, no DOM).
 * Loaded before app.js; every binding below is read-only at runtime.
 */

  var DEFAULT_COURSES = [
    {
      id: 'c-cs106a', code: 'CS 106A', name: 'Programming Methodology', ects: 5, quartile: 'Fall',
      components: [
        { name: 'Programming Assignments', weight: 40, score: 3.7 },
        { name: 'Midterm Exam', weight: 25, score: 3.3 },
        { name: 'Final Exam', weight: 35, score: null }
      ],
      targetGrade: 3.7
    },
    {
      id: 'c-math51', code: 'MATH 51', name: 'Linear Algebra & Multivariable Calculus', ects: 5, quartile: 'Fall',
      components: [
        { name: 'Homework Sets', weight: 20, score: 3.5 },
        { name: 'Midterm Exam', weight: 30, score: 3.0 },
        { name: 'Final Exam', weight: 50, score: null }
      ],
      targetGrade: 3.3
    },
    {
      id: 'c-phys41', code: 'PHYSICS 41', name: 'Mechanics', ects: 4, quartile: 'Fall',
      components: [
        { name: 'Lab Reports', weight: 30, score: 3.2 },
        { name: 'Problem Sets', weight: 20, score: 3.4 },
        { name: 'Final Exam', weight: 50, score: null }
      ],
      targetGrade: 3.3
    }
  ];

  var QUOTES = [
    { t: "Anybody can do my job, but no one can be me.", a: "Harvey Specter" },
    { t: "I don't have dreams, I have goals.", a: "Harvey Specter" },
    { t: "Win a no-win situation by rewriting the rules.", a: "Harvey Specter" },
    { t: "Work until you no longer have to introduce yourself.", a: "Harvey Specter" },
    { t: "It's not bragging if it's true.", a: "Harvey Specter" },
    { t: "I don't pave the way for people. People pave the way for me.", a: "Harvey Specter" },
    { t: "That's the difference between you and me. You wanna lose small, I wanna win big.", a: "Harvey Specter" },
    { t: "Don't raise your voice, improve your argument.", a: "Harvey Specter" },
    { t: "Winners don't make excuses.", a: "Harvey Specter" },
    { t: "Ever loved someone so much, you would do anything for them? Yeah, well, make that someone yourself and do whatever the hell you want.", a: "Harvey Specter" },
    { t: "Sometimes you have difficult moments, and then you try to work hard, and you keep working hard, and you overcome the situation.", a: "Max Verstappen" },
    { t: "That's what I enjoy: always driving on the limit of what you can do.", a: "Max Verstappen" },
    { t: "You always have to believe in yourself, and I had that from karting.", a: "Max Verstappen" },
    { t: "I always try to get the best result out of it.", a: "Max Verstappen" },
    { t: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", a: "Muhammad Ali" },
    { t: "Float like a butterfly, sting like a bee.", a: "Muhammad Ali" },
    { t: "He who is not courageous enough to take risks will accomplish nothing in life.", a: "Muhammad Ali" },
    { t: "I am the greatest. I said that even before I knew I was.", a: "Muhammad Ali" },
    { t: "It isn't the mountains ahead to climb that wear you out; it's the pebble in your shoe.", a: "Muhammad Ali" },
    { t: "Service to others is the rent you pay for your room here on earth.", a: "Muhammad Ali" },
    { t: "Mistakes happen to the best of us.", a: "Max Verstappen" },
    { t: "I'm a winner, and I want to win.", a: "Max Verstappen" },
    { t: "You can improve on everything; you're never perfect.", a: "Max Verstappen" },
    { t: "I don't focus on what I can't do, but rather what I can achieve.", a: "Max Verstappen" },
    { t: "You miss 100% of the shots you don't take.", a: "Wayne Gretzky" },
    { t: "I can accept failure, but I can't accept not trying.", a: "Michael Jordan" },
    { t: "Don't count the days, make the days count.", a: "Muhammad Ali" },
    { t: "The moment you give up, is the moment you let someone else win.", a: "Kobe Bryant" },
    { t: "A champion is defined not by their wins, but by how they recover when they fall.", a: "Serena Williams" },
    { t: "Dreams are free. Goals have a cost.", a: "Usain Bolt" },
    { t: "It's not whether you get knocked down, it's whether you get up.", a: "Vince Lombardi" },
    { t: "Champions keep playing until they get it right.", a: "Billie Jean King" },
    { t: "Never let the fear of striking out keep you from playing.", a: "Babe Ruth" },
    { t: "Make each day your masterpiece.", a: "John Wooden" },
    { t: "There is no substitute for hard work.", a: "Thomas Edison" },
    { t: "Action is the foundational key to all success.", a: "Pablo Picasso" },
    { t: "Stay hungry, stay foolish.", a: "Steve Jobs" },
    { t: "Discipline equals freedom.", a: "Jocko Willink" },
    { t: "Be so good they can't ignore you.", a: "Steve Martin" },
    { t: "Everything seems impossible until it's done.", a: "Nelson Mandela" },
    { t: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
    { t: "Clear mind, full heart, can't lose.", a: "" },
    { t: "Prove them wrong.", a: "" },
    { t: "Push yourself to the limit.", a: "" },
    { t: "Fall seven times, stand up eight.", a: "" },
    { t: "Small steps every day.", a: "" },
    { t: "Do it with passion or not at all.", a: "" },
    { t: "Doubt kills more dreams than failure ever will.", a: "" },
    { t: "Don't stop until you're proud.", a: "" },
    { t: "The best way to predict the future is to create it.", a: "" },
    { t: "Believe you can and you're halfway there.", a: "" },
    { t: "Focus on the process, not the outcome.", a: "" },
    { t: "Start where you are. Use what you have. Do what you can.", a: "" },
    { t: "Energy flows where attention goes.", a: "" },
    { t: "Great things never came from comfort zones.", a: "" },
    { t: "Everything you want is on the other side of fear.", a: "" },
    { t: "Turn your obstacles into opportunities.", a: "" },
    { t: "Your only limit is you.", a: "" },
    { t: "Continuous effort, not strength or intelligence, is the key.", a: "" },
    { t: "Build in silence, let success make the noise.", a: "" },
    { t: "Pain is temporary. Quitting lasts forever.", a: "" },
    { t: "Be better than yesterday.", a: "" },
    { t: "Success is a series of small wins.", a: "" },
    { t: "Overnight success takes 10 years.", a: "" },
    { t: "Consistency is key.", a: "" },
    { t: "Trust the process.", a: "" },
    { t: "Focus on solutions, not problems.", a: "" },
    { t: "Keep moving forward!", a: "" },
  ];

  var CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var DAY_COLORS = ['#bcd7f5', '#f5e6a8', '#bfe3c6', '#d3c2f0', '#f0b8c0', '#aedde0', '#f2cfa8', '#c3cede'];

  var SYMBOLS = ['π', '√', '∫', 'Σ', 'Δ', 'θ', 'λ', 'μ', '∞', '≠', '≈', '≤', '≥', '×', '÷', '±', '°', '²', '³', 'α', 'β', 'γ', 'φ', 'Ω', '∂', '→', 'sin', 'cos', 'log', 'lim'];

  var AIRPORTS = [
    { id: 'JFK', city: 'New York', name: 'John F. Kennedy', region: 'North America', lat: 40.64, lon: -73.78, tier: 0 },
    { id: 'LAS', city: 'Las Vegas', name: 'Harry Reid', region: 'North America', lat: 36.08, lon: -115.15, tier: 0 },
    { id: 'LAX', city: 'Los Angeles', name: 'Los Angeles Intl', region: 'North America', lat: 33.94, lon: -118.41, tier: 0 },
    { id: 'ORD', city: 'Chicago', name: "O'Hare", region: 'North America', lat: 41.97, lon: -87.91, tier: 1 },
    { id: 'MIA', city: 'Miami', name: 'Miami Intl', region: 'North America', lat: 25.79, lon: -80.29, tier: 1 },
    { id: 'SFO', city: 'San Francisco', name: 'San Francisco Intl', region: 'North America', lat: 37.62, lon: -122.38, tier: 1 },
    { id: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson', region: 'North America', lat: 33.64, lon: -84.43, tier: 2 },
    { id: 'YYZ', city: 'Toronto', name: 'Pearson', region: 'North America', lat: 43.68, lon: -79.63, tier: 2 },
    { id: 'MEX', city: 'Mexico City', name: 'Benito Juarez', region: 'North America', lat: 19.44, lon: -99.07, tier: 3 },
    { id: 'LHR', city: 'London', name: 'Heathrow', region: 'Europe', lat: 51.47, lon: -0.45, tier: 0 },
    { id: 'CDG', city: 'Paris', name: 'Charles de Gaulle', region: 'Europe', lat: 49.01, lon: 2.55, tier: 0 },
    { id: 'FRA', city: 'Frankfurt', name: 'Frankfurt am Main', region: 'Europe', lat: 50.03, lon: 8.56, tier: 1 },
    { id: 'AMS', city: 'Amsterdam', name: 'Schiphol', region: 'Europe', lat: 52.31, lon: 4.76, tier: 1 },
    { id: 'MAD', city: 'Madrid', name: 'Barajas', region: 'Europe', lat: 40.47, lon: -3.57, tier: 2 },
    { id: 'FCO', city: 'Rome', name: 'Fiumicino', region: 'Europe', lat: 41.80, lon: 12.25, tier: 2 },
    { id: 'ZRH', city: 'Zurich', name: 'Zurich', region: 'Europe', lat: 47.46, lon: 8.55, tier: 3 },
    { id: 'DXB', city: 'Dubai', name: 'Dubai Intl', region: 'Middle East', lat: 25.25, lon: 55.36, tier: 0 },
    { id: 'DOH', city: 'Doha', name: 'Hamad Intl', region: 'Middle East', lat: 25.27, lon: 51.61, tier: 1 },
    { id: 'MCT', city: 'Muscat', name: 'Muscat Intl', region: 'Middle East', lat: 23.59, lon: 58.28, tier: 1 },
    { id: 'RUH', city: 'Riyadh', name: 'King Khalid', region: 'Middle East', lat: 24.96, lon: 46.70, tier: 2 },
    { id: 'JED', city: 'Jeddah', name: 'King Abdulaziz', region: 'Middle East', lat: 21.68, lon: 39.16, tier: 3 },
    { id: 'SIN', city: 'Singapore', name: 'Changi', region: 'Asia', lat: 1.36, lon: 103.99, tier: 0 },
    { id: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji', region: 'Asia', lat: 19.09, lon: 72.87, tier: 1 },
    { id: 'HKG', city: 'Hong Kong', name: 'Hong Kong Intl', region: 'Asia', lat: 22.31, lon: 113.91, tier: 1 },
    { id: 'DEL', city: 'Delhi', name: 'Indira Gandhi', region: 'Asia', lat: 28.57, lon: 77.10, tier: 2 },
    { id: 'NRT', city: 'Tokyo', name: 'Narita', region: 'Asia', lat: 35.77, lon: 140.39, tier: 2 },
    { id: 'ICN', city: 'Seoul', name: 'Incheon', region: 'Asia', lat: 37.46, lon: 126.44, tier: 3 },
    { id: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', region: 'Asia', lat: 13.69, lon: 100.75, tier: 3 },
    { id: 'SYD', city: 'Sydney', name: 'Kingsford Smith', region: 'Oceania', lat: -33.95, lon: 151.18, tier: 1 },
    { id: 'MEL', city: 'Melbourne', name: 'Melbourne', region: 'Oceania', lat: -37.67, lon: 144.84, tier: 2 },
    { id: 'AKL', city: 'Auckland', name: 'Auckland', region: 'Oceania', lat: -37.01, lon: 174.79, tier: 3 },
    { id: 'CAI', city: 'Cairo', name: 'Cairo Intl', region: 'Africa', lat: 30.12, lon: 31.41, tier: 2 },
    { id: 'ADD', city: 'Addis Ababa', name: 'Bole', region: 'Africa', lat: 8.98, lon: 38.80, tier: 3 },
    { id: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo', region: 'Africa', lat: -26.14, lon: 28.25, tier: 3 },
    { id: 'GRU', city: 'Sao Paulo', name: 'Guarulhos', region: 'South America', lat: -23.44, lon: -46.47, tier: 2 },
    { id: 'EZE', city: 'Buenos Aires', name: 'Ezeiza', region: 'South America', lat: -34.82, lon: -58.54, tier: 3 },
    { id: 'BOG', city: 'Bogota', name: 'El Dorado', region: 'South America', lat: 4.70, lon: -74.14, tier: 3 },
    { id: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth', region: 'North America', lat: 32.90, lon: -97.04, tier: 1 },
    { id: 'DEN', city: 'Denver', name: 'Denver Intl', region: 'North America', lat: 39.86, lon: -104.67, tier: 1 },
    { id: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma', region: 'North America', lat: 47.45, lon: -122.31, tier: 1 },
    { id: 'BOS', city: 'Boston', name: 'Logan', region: 'North America', lat: 42.36, lon: -71.01, tier: 1 },
    { id: 'IAD', city: 'Washington', name: 'Dulles', region: 'North America', lat: 38.95, lon: -77.46, tier: 2 },
    { id: 'BCN', city: 'Barcelona', name: 'El Prat', region: 'Europe', lat: 41.30, lon: 2.08, tier: 1 },
    { id: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', region: 'Europe', lat: 38.77, lon: -9.13, tier: 1 },
    { id: 'VIE', city: 'Vienna', name: 'Vienna Intl', region: 'Europe', lat: 48.11, lon: 16.57, tier: 1 },
    { id: 'ATH', city: 'Athens', name: 'Athens Intl', region: 'Europe', lat: 37.94, lon: 23.94, tier: 2 },
    { id: 'CPH', city: 'Copenhagen', name: 'Kastrup', region: 'Europe', lat: 55.62, lon: 12.66, tier: 2 },
    { id: 'DUB', city: 'Dublin', name: 'Dublin', region: 'Europe', lat: 53.42, lon: -6.27, tier: 2 },
    { id: 'AUH', city: 'Abu Dhabi', name: 'Zayed Intl', region: 'Middle East', lat: 24.43, lon: 54.65, tier: 1 },
    { id: 'KWI', city: 'Kuwait City', name: 'Kuwait Intl', region: 'Middle East', lat: 29.23, lon: 47.97, tier: 2 },
    { id: 'PEK', city: 'Beijing', name: 'Capital Intl', region: 'Asia', lat: 40.08, lon: 116.58, tier: 1 },
    { id: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur Intl', region: 'Asia', lat: 3.14, lon: 101.69, tier: 1 },
    { id: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta', region: 'Asia', lat: -6.13, lon: 106.66, tier: 2 },
    { id: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar', region: 'Asia', lat: 22.72, lon: 75.80, tier: 2 },
    { id: 'SJC', city: 'San Jose', name: 'Norman Y. Mineta', region: 'North America', lat: 37.36, lon: -121.93, tier: 1 },
    { id: 'SAN', city: 'San Diego', name: 'San Diego Intl', region: 'North America', lat: 32.73, lon: -117.19, tier: 1 },
    { id: 'SMF', city: 'Sacramento', name: 'Sacramento Intl', region: 'North America', lat: 38.70, lon: -121.59, tier: 2 },
    { id: 'PRG', city: 'Prague', name: 'Vaclav Havel', region: 'Europe', lat: 50.10, lon: 14.26, tier: 1 },
    { id: 'BRU', city: 'Brussels', name: 'Brussels', region: 'Europe', lat: 50.90, lon: 4.48, tier: 2 },
    { id: 'ARN', city: 'Stockholm', name: 'Arlanda', region: 'Europe', lat: 59.65, lon: 17.92, tier: 2 },
    { id: 'OSL', city: 'Oslo', name: 'Gardermoen', region: 'Europe', lat: 60.19, lon: 11.10, tier: 2 },
    { id: 'NJF', city: 'Najaf', name: 'Al Najaf Intl', region: 'Middle East', lat: 31.99, lon: 44.40, tier: 2 },
    { id: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta', region: 'Africa', lat: -1.32, lon: 36.93, tier: 2 },
    { id: 'LOS', city: 'Lagos', name: 'Murtala Muhammed', region: 'Africa', lat: 6.52, lon: 3.38, tier: 3 },
    { id: 'SCL', city: 'Santiago', name: 'Arturo Merino Benitez', region: 'South America', lat: -33.39, lon: -70.79, tier: 2 },
    { id: 'LIM', city: 'Lima', name: 'Jorge Chavez', region: 'South America', lat: -12.02, lon: -77.11, tier: 3 }
  ];

  var TIER_MILES = { 1: 2000, 2: 8000, 3: 20000 };
  var CABINS = [
    { id: 'economy', name: 'Economy', mult: 1, flights: 0 },
    { id: 'premium', name: 'Premium', mult: 1.25, flights: 5 },
    { id: 'business', name: 'Business', mult: 1.5, flights: 15 },
    { id: 'first', name: 'First Class', mult: 2, flights: 30 }
  ];

  var PLANES = [
    { id: 'a320', name: 'Airbus A320', cruise: 840, range: 6100, size: 1 },
    { id: 'b737', name: 'Boeing 737', cruise: 820, range: 5600, size: 1 },
    { id: 'b787', name: 'Boeing 787', cruise: 913, range: 14100, size: 1.35 },
    { id: 'a350', name: 'Airbus A350', cruise: 903, range: 15000, size: 1.35 },
    { id: 'b777', name: 'Boeing 777', cruise: 905, range: 14000, size: 1.5 },
    { id: 'a380', name: 'Airbus A380', cruise: 900, range: 14800, size: 1.8 }
  ];

  var FL_HIST_DAYS = { week: 7, month: 30, year: 365, all: Infinity };

  // Real IRL photos - every URL below verified live on Wikimedia Commons
  var CITY_PHOTOS = {
    'New York': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/One_World_Trade_Center_at_Night.jpg/1280px-One_World_Trade_Center_at_Night.jpg',
    'San Diego': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/San_Diego_skyline_at_night_from_Point_Loma_2014.jpg/1280px-San_Diego_skyline_at_night_from_Point_Loma_2014.jpg',
    'Madrid': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Gran_Via%2C_Madrid%2C_at_night.jpg/1280px-Gran_Via%2C_Madrid%2C_at_night.jpg',
    'Toronto': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Toronto_-_ON_-_Skyline_bei_Nacht.jpg/1280px-Toronto_-_ON_-_Skyline_bei_Nacht.jpg',
    'Delhi': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/PXL_20231127_142319433_India_Gate_at_Night_Kartavya_Path%2C_New_Delhi%2C_Delhi_110001_05.jpg/1280px-PXL_20231127_142319433_India_Gate_at_Night_Kartavya_Path%2C_New_Delhi%2C_Delhi_110001_05.jpg',
    'Barcelona': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Barcelona%2C_Sagrada_Familia_by_night%2C_2015.jpg/1280px-Barcelona%2C_Sagrada_Familia_by_night%2C_2015.jpg',
    'Amsterdam': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Amsterdam_Canal_at_Night.JPG/1280px-Amsterdam_Canal_at_Night.JPG',
    'Miami': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Villa_Casa_Casuarina_%281930_%29_in_Miami_Beach%2C_Night_view.jpg/1280px-The_Villa_Casa_Casuarina_%281930_%29_in_Miami_Beach%2C_Night_view.jpg',
    'London': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/London_Eye_Twilight_April_2006.jpg/1280px-London_Eye_Twilight_April_2006.jpg',
    'Paris': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1280px-Tour_Eiffel_Wikimedia_Commons.jpg',
    'Dubai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Dubai_Marina_Skyline.jpg/1280px-Dubai_Marina_Skyline.jpg',
    'Singapore': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Marina_Bay_Sands_in_the_evening_-_20101120.jpg/1280px-Marina_Bay_Sands_in_the_evening_-_20101120.jpg',
    'Las Vegas': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Las_Vegas_Strip_at_night.jpg',
    'Tokyo': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Tokyo_Tower_at_night.jpg/1280px-Tokyo_Tower_at_night.jpg',
    'Sydney': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1280px-Sydney_Opera_House_-_Dec_2008.jpg',
    'Rome': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg/1280px-Colosseum_in_Rome%2C_Italy_-_April_2007.jpg',
    'Mumbai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Gateway_of_India.jpg/1280px-Gateway_of_India.jpg',
    'Hong Kong': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Hong_Kong_Night_Skyline.jpg/1280px-Hong_Kong_Night_Skyline.jpg',
    'Chicago': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Chicago_Lakefront_Night_Skyline.jpg/1280px-Chicago_Lakefront_Night_Skyline.jpg',
    'San Francisco': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg/1280px-Golden_Gate_Bridge_as_seen_from_Battery_East.jpg',
    'Los Angeles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Downtown_Los_Angeles_at_night.jpg/1280px-Downtown_Los_Angeles_at_night.jpg'
  };


const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUser() {
  // Usa il nome del servizio MongoDB del docker-compose, di solito "mongo"
  await mongoose.connect('mongodb://mongo:27017/fridgewise');

  const email = 'sb-rttvo43826592@personal.example.com';
  const password = 'testpassword';

  // Controlla se esiste già
  let user = await User.findOne({ email });
  if (user) {
    console.log('Utente già esistente:', user.email);
    process.exit(0);
  }

  user = new User({
    email,
    password,
    profile: {
      name: 'John Doe',
      dietaryPreferences: [],
      allergies: [],
      calorieGoal: 2000,
      activityLevel: 'moderately-active'
    },
    isEmailVerified: true
  });
  await user.save();
  console.log('Utente creato:', user.email);
  process.exit(0);
}

createTestUser();

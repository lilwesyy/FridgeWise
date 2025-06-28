const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const users = [
      {
        email: 'sb-rttvo43826592@personal.example.com',
        password: 'testpassword',
        profile: {
          name: 'John Doe',
          dietaryPreferences: [],
          allergies: [],
          calorieGoal: 2000,
          activityLevel: 'moderately-active'
        },
        isEmailVerified: true,
        isSupporter: false
      },
      {
        email: 'supporter@example.com',
        password: 'supporterpass',
        profile: {
          name: 'Jane Supporter',
          dietaryPreferences: ['vegetarian'],
          allergies: ['nuts'],
          calorieGoal: 1800,
          activityLevel: 'moderately-active' // Corretto enum
        },
        isEmailVerified: true,
        isSupporter: true
      }
    ];

    for (const userData of users) {
      let user = await User.findOne({ email: userData.email });
      if (user) {
        console.log('Utente già esistente:', user.email);
      } else {
        user = new User(userData);
        await user.save();
        console.log('Utente creato:', user.email);
      }
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Errore durante il seeding degli utenti:', error);
    process.exit(1);
  }
}

seedUsers();

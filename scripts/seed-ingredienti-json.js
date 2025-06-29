const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function seedIngredienti() {
  try {
    // Carica ingredienti.json (ogni riga è un oggetto JSON)
    const filePath = path.join(__dirname, '../ingredienti.json');
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
    const ingredienti = lines.map(line => JSON.parse(line));

    // Rimuovi eventuali campi MongoDB che non servono
    const cleanIngredienti = ingredienti.map(ing => {
      const {
        _id, __v, createdAt, updatedAt, ...rest
      } = ing;
      return rest;
    });

    // Connetti a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connesso a MongoDB');

    // Definisci il modello Ingredient DOPO la connessione
    const ingredientSchema = new mongoose.Schema({
      name: String,
      category: String,
      nutritionPer100g: Object,
      commonNames: [String],
      shelfLife: Number,
      storageType: String,
      imageUrl: String,
      isVerified: Boolean
    }, { strict: false });
    const Ingredient = mongoose.model('Ingredient', ingredientSchema);

    // Svuota la collezione
    await Ingredient.deleteMany({});
    console.log('Collezione Ingredient svuotata');

    // Inserisci tutti gli ingredienti
    const result = await Ingredient.insertMany(cleanIngredienti);
    console.log(`Inseriti ${result.length} ingredienti!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Errore durante il seeding:', err);
    process.exit(1);
  }
}

seedIngredienti(); 
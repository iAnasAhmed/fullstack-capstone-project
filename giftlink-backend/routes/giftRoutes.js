const { MongoClient } = require('mongodb');

const URL = 'your_mongodb_connection_string'; // Replace with your MongoDB connection string
const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('your_database_name'); // Replace with your database name
        return db;
    } catch (e) {
        console.error('Error connecting to MongoDB:', e);
        throw e;
    }
}

router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection('gifts');

        const gifts = await collection.find({}).toArray();

        res.json(gifts);
    } catch (e) {
        console.error('Error fetching gifts:', e);
        res.status(500).send('Error fetching gifts');
    }
});
router.get('/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection('gifts');

        const id = req.params.id;

        const gift = await collection.findOne({ id: id });

        if (!gift) {
            return res.status(404).send('Gift not found');
        }

        res.json(gift);
    } catch (e) {
        console.error('Error fetching gift:', e);
        res.status(500).send('Error fetching gift');
    }
});



router.post('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const gift = await collection.insertOne(req.body);

        res.status(201).json(gift.ops[0]);
    } catch (e) {
        next(e);
    }
});

module.exports = router;

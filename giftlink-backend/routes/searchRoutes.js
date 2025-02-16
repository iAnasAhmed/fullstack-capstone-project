/*jshint esversion: 8 */

const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

router.get('/', async (req, res, next) => {
    try {
  const collection = db.collection("gifts");

        let query = {};

        // Add the name filter to the query if the name parameter is not empty
        // if (/* {{insert code here}} */) {
            query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
        // }

        // Task 3: Add other filters to the query
        if (req.query.category) {
            // {{insert code here}}
        }
        if (req.query.condition) {
            // {{insert code here}}
        }
        if (req.query.age_years) {
            // {{insert code here}}
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Task 4: Fetch filtered gifts using the find(query) method. Make sure to use await and store the result in the `gifts` constant
        // {{insert code here here}}

        res.json(gifts);
    } catch (e) {
        next(e);
    }
});

module.exports = router;

'use strict';
var express = require('express');
var router = express.Router();
require('dotenv').config();

var findResult = new Array;
var genreSet = new Set();
var genres = new Array();
var languageSet = new Set();
var languages = new Array();


const populateChoices = async () => {
    console.log("process.env.DB_NAME:", process.env.DB_NAME);
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://" +
        `${process.env.DB_USER}` +
        ":" +
        `${process.env.DB_PASS}` +
        "@" +
        `${process.env.DB_NAME}` +
        "/imdb?retryWrites=true&w=majority&authMechanism=SCRAM-SHA-1&directConnection=true";
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const collection = client.db("imdb").collection("movies");
    var genreList = await collection.aggregate([{ $group: { _id: '$genre' } }]).toArray();
    var languageList = await collection.aggregate([{ $match: { language: { $exists: true } } },{ $group: { _id: '$language' } }]).toArray();
    genreList.forEach(doc => doc["_id"].split(",").forEach(dic => genreSet.add(dic.trim())));
    languageList.forEach(doc => doc["_id"].split(",").forEach(dic => languageSet.add(dic.trim())));
    genres = Array.from(genreSet).sort();
    languages = Array.from(languageSet).sort();
    client.close();
    module.exports.genresExported = genres;
    module.exports.languagesExported = languages;
};

/* GET home page. */
router.get('/', async function (req, res) {
    await populateChoices();
    res.render('index', { pagetitle: 'iMovieDB', movies: findResult, genres: genres, genreSelected: req.body.genre, languages: languages, languageSelected: req.body.language, title: req.body.title, year: parseInt(req.body.year), duration: parseInt(req.body.duration), rating: Number(req.body.rating) });
});

module.exports = router;



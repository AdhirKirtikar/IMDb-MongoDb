//'use strict';
var express = require('express');
var router = express.Router();
require('dotenv').config();

var findResult = [
    {
        imdb_title_id: 'tt0133093',
        title: 'Dobby',
        year: 1999,
        genre: 'Action, Sci-Fi',
        duration: 136,
        country: 'USA',
        language: 'English',
        avg_vote: 8.7
    }
];

var genres = new Array();
var languages = new Array();

const { MongoClient } = require('mongodb');


const findItems = async (srcTitle, srcYear) => {
    genres = require('./index').genresExported;
    languages = require('./index').languagesExported;

    const uri = "mongodb+srv://" +
        `${process.env.DB_USER}` +
        ":" +
        `${process.env.DB_PASS}` +
        "@imongodb.v9ek1.mongodb.net/imdb?retryWrites=true&w=majority";
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const collection = client.db("imdb").collection("movies");
    // perform actions on the collection object
    const query = buildQuery(srcTitle, srcYear);

    // db.movies.find({ $and:[{ title: { "$regex": "Matrix", "$options": "iu" } }, { year: { $eq: 2003} } ]})
    findResult = await collection.find(query).toArray();
    client.close();
};

const buildQuery = (srcTitle, srcYear) => {
    const yearQuery = { year: srcYear };
    var finalQuery = {} // empty Object
    var key = '$and';
    finalQuery[key] = []; // empty Array, which you can push() values into

    if (srcTitle) {
        const titleQuery = { title: { $regex: srcTitle, $options: "iu" } };
        finalQuery[key].push(titleQuery);
    } else {
        const titleQuery = { title: { $regex: "Dobby", $options: "iu" } };
        finalQuery[key].push(titleQuery);
    }

    if (Number.isNaN(srcYear)) {
        console.log(parseInt(srcYear), " Year is NULL");
    } else {
        console.log(parseInt(srcYear), " Year is not NULL");
        finalQuery[key].push(yearQuery);
    }
    console.log(JSON.stringify(finalQuery));
    return finalQuery;
}

/* GET home page. */
router.post('/search', async function (req, res) {
    console.log("Params: ");
    console.log(req.body);
    await findItems(req.body.title, parseInt(req.body.year));
    res.render('index', { pagetitle: 'iMovieDB', movies: findResult, genres: genres, languages: languages, title: req.body.title, year: parseInt(req.body.year) });
});

module.exports = router;


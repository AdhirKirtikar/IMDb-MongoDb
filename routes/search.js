'use strict';
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


const findItems = async (srcTitle, srcYear, srcGenre, srcLanguage, srcDuration, srcRating) => {
    genres = require('./index').genresExported;
    languages = require('./index').languagesExported;

    const uri = "mongodb+srv://" +
        `${process.env.DB_USER}` +
        ":" +
        `${process.env.DB_PASS}` +
        "@" +
        `${process.env.DB_NAME}` +
        "/imdb?retryWrites=true&w=majority";
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const collection = client.db("imdb").collection("movies");
    // perform actions on the collection object
    const query = buildQuery(srcTitle, srcYear, srcGenre, srcLanguage, srcDuration, srcRating);

    // db.movies.find({ $and:[{ title: { "$regex": "Matrix", "$options": "iu" } }, { year: { $eq: 2003} } ]})
    findResult = await collection.find(query).toArray();
    client.close();
};

const buildQuery = (srcTitle, srcYear, srcGenre, srcLanguage, srcDuration, srcRating) => {
    var finalQuery = {} // empty Object
    var key = "$and";
    finalQuery[key] = []; // empty Array, which you can push() values into

    if (srcTitle) {
        const titleQuery = { title: { $regex: srcTitle, $options: "iu" } };
        finalQuery[key].push(titleQuery);
    } else {
        //const titleQuery = { title: { $regex: "Dobby", $options: "iu" } };
        //finalQuery[key].push(titleQuery);
    }

    if (Number.isNaN(srcYear)) {
        console.log(parseInt(srcYear), " Year is NULL");
    } else {
        console.log(parseInt(srcYear), " Year is not NULL");
        const yearQuery = { year: srcYear };
        finalQuery[key].push(yearQuery);
    }

    console.log("srcGenre & srcLanguage", srcGenre, srcLanguage);
    if (srcGenre) {
        var genreFinalQuery = {} // empty Object
        var genreKey = "$or";
        genreFinalQuery[genreKey] = []; // empty Array, which you can push() values into
        console.log("srcGenre is not NULL");
        srcGenre.forEach(doc => {
            console.log(doc);
            const genreQuery = { genre: { $regex: doc, $options: "iu" } };
            console.log(genreQuery);
            genreFinalQuery[genreKey].push(genreQuery);
        });
        finalQuery[key].push(genreFinalQuery);
    } else {
        console.log("srcGenre is NULL");
    }

    if (srcLanguage) {
        var languageFinalQuery = {} // empty Object
        var languageKey = "$or";
        languageFinalQuery[languageKey] = []; // empty Array, which you can push() values into
        console.log("srcLanguage is not NULL");
        srcLanguage.forEach(doc => {
            console.log(doc);
            const languageQuery = { language: { $regex: doc, $options: "iu" } };
            console.log(languageQuery);
            languageFinalQuery[languageKey].push(languageQuery);
        });
        finalQuery[key].push(languageFinalQuery);
    } else {
        console.log("srcLanguage is NULL");
    }

    if (Number.isNaN(srcDuration)) {
        console.log(parseInt(srcDuration), " Duration is NULL");
    } else {
        console.log(parseInt(srcDuration), " Duration is not NULL");
        const durationQuery = { duration: { $gte: srcDuration} };
        finalQuery[key].push(durationQuery);
    }

    if (Number.isNaN(srcRating) || srcRating == 0.0) {
        console.log(parseInt(srcRating), " Rating is NULL or 0");
    } else {
        console.log(parseInt(srcRating), " Rating is not NULL");
        const ratingQuery = { avg_vote: { $gte: srcRating } };
        finalQuery[key].push(ratingQuery);
    }

    console.log(JSON.stringify(finalQuery));
    return finalQuery;
}

/* GET home page. */
router.post('/search', async function (req, res) {
    console.log("Params: ");
    console.log(req.body);
    if (typeof (req.body.genre) == "string") {
        req.body.genre = [req.body.genre];
    }
    if (typeof (req.body.language) == "string") {
        req.body.language = [req.body.language];
    }
    await findItems(req.body.title, parseInt(req.body.year), req.body.genre, req.body.language, parseInt(req.body.duration), Number(req.body.rating));
    res.render('index', { pagetitle: 'iMovieDB', movies: findResult, genres: genres, genreSelected: req.body.genre, languages: languages, languageSelected: req.body.language, title: req.body.title, year: parseInt(req.body.year), duration: parseInt(req.body.duration), rating: Number(req.body.rating) });
});

module.exports = router;


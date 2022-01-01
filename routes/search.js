'use strict';
var express = require('express');
var router = express.Router();
require('dotenv').config();
var ObjectId = require('mongodb').ObjectID;

var findResult = [{ "_id": "61bcc6c3285ee7ddb94076ae", "imdb_title_id": "tt8569206", "title": "Little Baby", "original_title": "Little Baby", "year": 2019, "date_published": "", "genre": "", "duration": 105, "country": "", "language": "", "director": "", "writer": "", "production_company": "", "actors": "", "description": "", "avg_vote": 9.2, "votes": 2095, "reviews_from_users": 27, "reviews_from_critics": 16, "principals": [{ "_id": "61bccb3b285ee7ddb952e0d1", "imdb_title_id": "tt8569206", "ordering": 2, "imdb_name_id": "nm10381851", "category": "actress", "characters": "[\"Shasha\"]", "imdb_name_details": { "_id": "61bcc87e285ee7ddb942f26e", "imdb_name_id": "nm10381851", "name": "Gulnaz Siganporia", "birth_name": "Gulnaz Siganporia", "bio": "", "spouses": 0, "divorces": 0, "spouses_with_children": 0, "children": 0 }, "imdb_name": "Gulnaz Siganporia" }] }];

var findPrincipals = [
    {
        _id: new ObjectId("61bccb3b285ee7ddb952e0d0"),
        imdb_title_id: 'tt8569206',
        ordering: 1,
        imdb_name_id: 'nm1024101',
        category: 'actor',
        job: 'actor',
        characters: '["Dushyant"]'
    }
];

var genres = new Array();
var languages = new Array();

const { MongoClient } = require('mongodb');

const buildQuery = (srcTitle, srcYear, srcGenre, srcLanguage, srcDuration, srcRating) => {
    var finalQuery = {} // empty Object
    var key = "$and";
    finalQuery[key] = []; // empty Array, which you can push() values into

    if (srcTitle) {
        console.log(srcTitle, " Title is not NULL");
        const titleQuery = { title: { $regex: srcTitle, $options: "iu" } };
        finalQuery[key].push(titleQuery);
    } else {
        console.log(srcTitle, " Title is NULL");
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
        const durationQuery = { duration: { $gte: srcDuration } };
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

const findDetails = async (imdb_title_id) => {
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
    const collectionPrincipals = client.db("imdb").collection("principals");
    // perform actions on the collection object
    const queryPrincipals = { imdb_title_id: `${imdb_title_id}` };
    // db.principals.find({imdb_title_id: "tt0000574"})
    findPrincipals = await collectionPrincipals.find(queryPrincipals).toArray();

    for (let i = 0; i < findPrincipals.length; i++) {
        if (findPrincipals[i]["characters"])
        {
            findPrincipals[i]["characters"] = findPrincipals[i]["characters"].replace(/\[\"/g, "").replace(/\"\]/g, "").replace(/\\\"/g, "\"");
        }
    }
    //console.log(findPrincipals);

    const collectionNames = client.db("imdb").collection("names");
    for (let i = 0; i < findPrincipals.length; i++) {
        const queryNames = { imdb_name_id: `${findPrincipals[i].imdb_name_id}` };
        // db.names.find({imdb_name_id:"nm1024101"})
        const imdbNameDetails = await collectionNames.find(queryNames).toArray();
        findPrincipals[i]["imdb_name_details"] = imdbNameDetails[0];
        findPrincipals[i]["imdb_name"] = findPrincipals[i].imdb_name_details.name;
    }
    //console.log(findPrincipals);
    client.close();
    return findPrincipals;
};

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
    const limit = 10;        // max number of results
    const sort = { year: 1 } // sort by year - ascending

    // db.movies.find({ $and:[{ title: { "$regex": "Matrix", "$options": "iu" } }, { year: { $eq: 2003} } ]})
    findResult = await collection.find(query).sort(sort).limit(limit).toArray();

    for (let i = 0; i < findResult.length; i++) {
        findResult[i]["principals"] = await findDetails(findResult[i].imdb_title_id);
    }
    //console.log("Final Result:", JSON.stringify(findResult));
    client.close();
};

const renderPage = (reqParam, resParam) => {
    resParam.render('index', { pagetitle: 'iMovieDB', movies: findResult, genres: genres, genreSelected: reqParam.body.genre, languages: languages, languageSelected: reqParam.body.language, title: reqParam.body.title, year: parseInt(reqParam.body.year), duration: parseInt(reqParam.body.duration), rating: Number(reqParam.body.rating) });
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


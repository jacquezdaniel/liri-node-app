require("dotenv").config();
var request = require("request");
var Spotify = require('node-spotify-api');
var axios = require("axios");
var moment = require("moment");
const keys = require("./keys.js");
const fs = require('fs');

var spotify = new Spotify(keys.spotify);

var command = process.argv[2];
let input = "";
for (let i = 3; i < process.argv.length; i++) {
    input = input + " " + process.argv[i];
};

function spotifyThis(){
    spotify.search({ type: 'track', query: input, limit: 3 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var song = (data.tracks.items[0] || "No information available");
        var artists = song.artists;
        if (artists){
            artists.forEach(function (element) {
                console.log("Artist: " + element.name);
            }); 
        };
        console.log("Track Name: " + song.name || "No song information available"); 
        console.log("Preview Link: " + song.external_urls.spotify || "No preview link available");
        console.log("Album: " + song.album.name || "No album information available");
    });
};

function movieThis() {
    request("http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movie = JSON.parse(body);
            console.log("Title: " + (movie.Title || "No title available")); //Title of the movie.
            console.log("Year: " + (movie.Year || "No year available")); //Year the movie came out.
            console.log("IMDB Rating: " + (movie.imdbRating + "/10" || "No rating available"));//IMDB Rating of the movie.
            if (movie.Ratings[1]){
                console.log("Rotten Tomatoes Rating: " + movie.Ratings[1].Value); 
            }
            else {
                console.log("Rotten Tomatoes Rating: No Rotten Tomatoes Rating Available");
            } //Rotten Tomatoes Rating of the movie. This rating is not always included, hence the logic
            console.log("Country: " + (movie.Country || "No country information available")); //Country where the movie was produced.
            console.log("Language(s): " + (movie.Language || "No language available")); // Language of the movie. 
            console.log("Plot: " + (movie.Plot || "No plot information available"));// Plot of the movie. 
            console.log("Actors: " + (movie.Actors || "No actor information available")); // Actors in the movie. 
            console.log("__________________________\n"); //inserts line between each tweet for legibility
        }
    });
};

function doWhat() {

    fs.readFile('random.txt', 'utf8', function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        command = dataArr[0];
        input = dataArr[1];
        runCommand();
    });
};

var getMyBands = function(artist) {
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
  
    axios.get(queryURL).then(
      function(response) {
        var jsonData = response.data;
  
        if (!jsonData.length) {
          console.log("No results found for " + artist);
          return;
        }
  
        console.log("Upcoming concerts for " + artist + ":");
  
        for (var i = 0; i < jsonData.length; i++) {
          var show = jsonData[i];
  
          // Print data about each concert
          // If a concert doesn't have a region, display the country instead
          // Use moment to format the date
          console.log(
            show.venue.city +
              "," +
              (show.venue.region || show.venue.country) +
              " at " +
              show.venue.name +
              " " +
              moment(show.datetime).format("MM/DD/YYYY")
          );
        }
      }
    );
  };

// Function for determining which command is executed
var pick = function(caseData, functionData) {
    switch (caseData) {
    case "concert-this":
      getMyBands(functionData);
      break;
    case "spotify-this-song":
      spotifyThis(functionData);
      break;
    case "movie-this":
      movieThis(functionData);
      break;
    case "do-what-it-says":
      doWhat();
      break;
    default:
      console.log("LIRI doesn't know that");
    }
  };
  
  // Function which takes in command line arguments and executes correct function accordingly
  var runThis = function(argOne, argTwo) {
    pick(argOne, argTwo);
  };
  
  // MAIN PROCESS
  // =====================================
  runThis(process.argv[2], process.argv.slice(3).join(" "));

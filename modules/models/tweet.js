let mongoose = require('mongoose');

// Create a new schema for our tweet data
let schema = new mongoose.Schema({
    twid: String,
    active: Boolean,
    author: String,
    avatar: String,
    body: String,
    date: Date,
    screenname: String
});

schema.pre('save', function (next) {
    let self = this;
    Tweet.find({twid : self.twid}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            //console.log('twid exist: ',self.twid);
            //next(new Error("User exists!"));
        }
    });
}) 

function getId(url) {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}

// Create a static getTweets method to return tweet data from the db
schema.statics.getTweets = function (page, skip, callback) {

    let tweets = [],
        start = (page * 10) + (skip * 1);

    // Query the db, using skip and limit to achieve page chunks
    Tweet.find({}, 'twid active author avatar body date screenname', {
        skip: start,
        //limit: 10
    }).sort({
        date: 'desc'
    }).exec(function (err, docs) {

        // If everything is cool...
        if (!err) {
            tweets = docs; // We got tweets
            tweets.forEach(function (tweet) {
                
                //tweet.body +='https://www.youtube.com/watch?v=SBDYYGER5iM';

                let videoId = getId(tweet.body);

                //console.log(videoId);
                let iframeMarkup = '';
                if(videoId!=='error')
                    //iframeMarkup = 'iframe(width="560", height="315", src="//www.youtube.com/embed/' + videoId + '", frameborder="0", allowfullscreen="")';
                    iframeMarkup = '<iframe width="560" height="315" src="//www.youtube.com/embed/' 
                    + videoId + '" frameborder="0" allowfullscreen></iframe>';
                tweet.youtube = iframeMarkup;
                tweet.active = true; // Set them to active
            });
        }

        // Pass them back to the specified callback
        callback(tweets);

    });

};

// Return a Tweet model based upon the defined schema
module.exports = Tweet = mongoose.model('Tweet', schema);
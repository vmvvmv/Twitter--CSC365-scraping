let configAuth = require('./auth');

let streamConf = require('./streamConf');

let twitter = require('twit')

let streamHandler = require('./streamHandler');
let Tweet = require('./models/tweet');

module.exports = function (app, passport) {

    // route for home page
    app.get('/', function (req, res) {
        res.render('index.pug'); // load the index.ejs file
    });

    // route for login form
    // route for processing the login form
    // route for signup form
    // route for processing the signup form

    // route for showing the profile page
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.pug', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/CSC365', isLoggedIn, function (req, res) {

        Tweet.getTweets(0, 0, function (tweets, pages) {

            //console.log(tweets);

            res.render('CSC365.pug', {
                //markup: markup, // Pass rendered react markup
                state: tweets// Pass current state to client side
            });

        });

    });

    app.get('/jokes', isLoggedIn, function (req, res) {
        res.render('jokes.pug', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/holidays', isLoggedIn, function (req, res) {
        res.render('holidays.pug', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // route for logging out
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // facebook routes

    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    
    if (req.isAuthenticated()) {

        let T = new twitter({

            consumer_key:  configAuth.twitterAuth.consumerKey,
            consumer_secret: configAuth.twitterAuth.consumerSecret,
            access_token: req.user._doc.twitter.token,
            access_token_secret: req.user._doc.twitter.tokenSecret
        });

        T.get('search/tweets', {
            q: '#CSC365',
            count: 100
        }, function (err, data, response) {

            //console.log(data.statuses.length);
            for (status of data.statuses) {
                let tweet = {
                    twid: status['id'],
                    active: false,
                    author: status['user']['name'],
                    avatar: status['user']['profile_image_url'],
                    body: status['text'],
                    date: status['created_at'],
                    screenname: status['user']['screen_name']
                };
                //console.log(tweet);
                let tweetEntry = new Tweet(tweet);

                // Save 'er to the database
                tweetEntry.save(function (err) {
                    if (!err) {
                        // If everything is cool, socket.io emits the tweet.
                        //io.emit('tweet', tweet);
                    }
                });
            }

        })

        let stream = T.stream('statuses/filter', {
            track: '#CSC365'
        });

        streamHandler(stream, streamConf.io);

        return next();

    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}
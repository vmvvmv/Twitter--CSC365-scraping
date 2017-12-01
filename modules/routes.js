let configAuth = require('./auth');
let twitter = require('ntwitter');
let streamHandler = require('./streamHandler');
let Tweet = require('./models/Tweet');

module.exports = function (app, passport, io) {

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

        let T = {
            twitter: {
                consumer_key: configAuth.twitterAuth.consumerKey,
                consumer_secret: configAuth.twitterAuth.consumerSecret,
                access_token_key: req.user.twitter.token,
                access_token_secret:  req.user.twitter.tokenSecret
            }
        };

        console.log(T.twitter);

        let twit = new twitter(T.twitter);

        twit.stream('statuses/filter',{ track: 'javascript'}, function(stream) {
            streamHandler(stream,io);
        });

        res.render('CSC365.pug', {
            user: req.user // get the user out of session and pass to template
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
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
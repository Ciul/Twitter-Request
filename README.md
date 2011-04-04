Twitter Request
================

Request Twitter statuses/user_timeline and receive the json response.
You can get tweets, user picture and other stuff from it.

How to use
----------
	
	Basically you make a RequestTwitter instance with Twitter Api parameters in options,
	then, at success event, you catch the json response.
	
	Read more about how to get Twitter statuses/user_timeline at http://dev.twitter.com/doc/get/statuses/user_timeline
	there you will see other parameters you could use.
	
	var twitterRequest = new RequestTwitter({
        parameters: {
            screen_name: 'mootools',
            count: 5
        }
    }).addEvents({
        success: function(data) {          
            data.each(function(tweet, i) {
               
                new Element('div', {
                    html: '<img src="' + tweet.user.profile_image_url.replace("\\",'') + '" align="left" alt="' + tweet.user.name + '" /> <strong>' + tweet.user.name + '</strong><br />' + tweet.text + '<br /><span>' + tweet.created_at + ' via ' + tweet.source.replace("\\",'') + '</span>',
                    'class': 'tweet clear'
                }).inject(twitter);
            });
        }
    }).send();

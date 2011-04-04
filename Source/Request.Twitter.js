/*
---
description: 

license: MIT-style

thanks to:
- David Walsh (davidwalsh.name)
- Jeremy Parrish (rrish.org)
- Scott Kyle (appden.com)

authors:
- Ciul

requires:
- more/1.3 : JSONP
- core/1.3 : *

provides: Request.Twitter

...
*/
/*
Twitter Parameters
------------------
- user_id
	The ID of the user for whom to return results for. Helpful for disambiguating when a valid user ID is also a valid screen name.
	http://api.twitter.com/1/statuses/user_timeline.json?user_id=12345

- screen_name
	The screen name of the user for whom to return results for. Helpful for disambiguating when a valid screen name is also a user ID.
	http://api.twitter.com/1/statuses/user_timeline.json?screen_name=mootools

- since_id
	Returns results with an ID greater than (that is, more recent than) the specified ID. There are limits to the number of Tweets which can be accessed through the API. If the limit of Tweets has occured since the since_id, the since_id will be forced to the oldest ID available.
	http://api.twitter.com/1/statuses/user_timeline.json?since_id=12345

- max_id
	Returns results with an ID less than (that is, older than) or equal to the specified ID.
	http://api.twitter.com/1/statuses/user_timeline.json?max_id=54321

- count
	Specifies the number of records to retrieve. Must be less than or equal to 200.
	http://api.twitter.com/1/statuses/user_timeline.json?count=5

- page
	Specifies the page of results to retrieve.
	http://api.twitter.com/1/statuses/user_timeline.json?page=3

- trim_user
	When set to either true, t or 1, each tweet returned in a timeline will include a user object including only the status authors numerical ID. Omit this parameter to receive the complete user object.
	http://api.twitter.com/1/statuses/user_timeline.json?trim_user=true

- include_rts
	When set to either true, t or 1,the timeline will contain native retweets (if they exist) in addition to the standard stream of tweets. The output format of retweeted tweets is identical to the representation you see in home_timeline. Note: If you're using the trim_user parameter in conjunction with include_rts, the retweets will still contain a full user object.
	http://api.twitter.com/1/statuses/user_timeline.json?include_rts=true

- include_entities
	When set to either true, t or 1, each tweet will include a node called "entities,". This node offers a variety of metadata about the tweet in a discreet structure, including: user_mentions, urls, and hashtags. While entities are opt-in on timelines at present, they will be made a default component of output in the future. See Tweet Entities for more detail on entities.
	http://api.twitter.com/1/statuses/user_timeline.json?include_entities=true

*/

var RequestTwitter = new Class({

	// extends
	Extends: Request.JSONP,
	
	// implements 
	Implements: [Options,Events],

	options: {
		linkify: true,
		url: 'http://api.twitter.com/{version}/statuses/user_timeline.json?',
		data: {
			// Will be mixed later with parameters{...}
		},
		parameters: {
			user_id: null,
			screen_name: 'mootools', // Will look for MooTools tweets :P
			since_id: null,
			max_id: null,
			count: 2,
			page: null,
			trim_user: null,
			include_rts: null,
			include_entities: null
		},
		version: 1,
		noCache: true,
		link: 'chain' // For being able to make quicly subsequent requests without losing them in the way.
	/*	Events:
		success: $empty
	*/
	},
  
	/*--------------- Initialize Method ---------------*/
	initialize: function(options){
		this.parent(options);
	},
  
	/*--------------- Update Parameters Method ---------------*/
	updateParams: function(params, APIversion) {
		// Mixes params passed with parameters from options.
		this.setOptions({ parameters: Object.append(this.options.parameters, params)});
			
		var noNullParameters = Object.filter(this.options.parameters, function(value, key) {
			// Only parameter's value different from null.
			return value;
		}, this);
		
		// Mixes data with twitter parameters defined at parameters.
		this.setOptions({data: Object.append(this.options.data, noNullParameters)});	
	  
		// Updates version of twitter API to use.
		APIversion = [APIversion, this.options.version, 1].pick();
		this.setOptions({version: APIversion});
		
		// Sets version of twitter API to use into this.options.url
		this.setOptions({url: this.options.url.substitute({version: String.from(this.options.version)})});
	},
	
	/*--------------- Delete Parameters Method ---------------*/
	deleteParams: function(/*string names of parameters to delete*/) {
		if(arguments.length == 0) {return this;}
				
		// Sorry but didn't find an easier way to delete pair key/value since append doesn't seem to be asigning new null values.
		Array.each(arguments, function(arg, index) {
			this.options.data = Object.filter(this.options.data, function(value, key) {
					return key!=arg;
			}, this);
			this.options.parameters = Object.map(this.options.parameters, function(value, key) {
					if(key == arg) {
						return null;
					}
					else
					{
						return value;
					}
			}, this);
		}, this);
	},
  
	/*--------------- Changes Twitter User ---------------*/
	changeUser: function(username) {
		this.updateParams({screen_name: String.from(username)});
	},
  
	/*--------------- Changes Twitter API Version ---------------*/
	changeVersion: function(version) {
		this.updateParams(this.options.parameters, version);
	},
  
	/*--------------- Events ---------------*/
	success: function(data, script) {
		
		if(this.options.linkify) {
			data[0].each(function(tweet, index) {
				tweet.text = this.linkify(tweet.text);
			}, this);			
		}
		
		// keep subsequent calls newer
		if (data[0]) {this.options.data.since_id = data[0].id;}
		
		this.parent(data, script);
		
	},
  
	linkify: function(text){
		// modified from TwitterGitter by David Walsh (davidwalsh.name)
		// courtesy of Jeremy Parrish (rrish.org)
		return text.replace(/(https?:\/\/[\w\-:;?&=+.%#\/]+)/gi, '<a href="$1">$1</a>')
				   .replace(/(^|\W)@(\w+)/g, '$1<a href="http://twitter.com/$2">@$2</a>')
				   .replace(/(^|\W)#(\w+)/g, '$1#<a href="http://search.twitter.com/search?q=%23$2">$2</a>');
	}
  
});
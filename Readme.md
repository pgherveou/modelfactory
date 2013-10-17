# climongoose

  Data models with schema definition, and event propagation inspired from Mongoose & Backbone.js

# Example
  
  ```js
var climongoose = require('climongoose');

// create a User Model
var User = climongoose.model({
  email: {type: String, required: true, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/},
  age: {type: Number, min: 13},
  date: {Date, default: Date.now},
  name: {
    first: {type: String, required: true},
    last: {type: String, required: true}
  },
  trophies: [{name: String, date: Date}]
})

// define virtuals
User.schema.virtual('name.full', function () {
  return this.name.first + ' ' + this.name.last;
})

// define getters
User.schema.path('email').get(function(v) {
  var split = v.split('@')
  return split[0] + '[at]' + split[1];
});

// define setters
User.schema.path('name.last').set(function(v) {
  return v[0].toUpperCase() + v.slice(1);
});

// define static methods
User.schema.static('fetch', function() {
 // ...
});

// define instance methods
User.schema.method('greeting', function() {
 return 'hello ' + this.name.full;
});

// create an instance
var user = new User({
  email: "john@gmail.com",
  name: {first: 'john', last: 'mcenroe'},
  trophies: [
   {name: 'Roland Garros', date: 'june-1984'},
   {name: 'Wimbledon', date: 'aug-1984'}
});

// events are emitted on ppty change
user.on('change:email', function() {/* do something when email change */});
user.email = 'johny@gmail.com'
user.set('email',  'johny2@gmail.com', {silent: true}) // or silent it 

// work for nested properties as well
user.on('change:name.first', function() {/* do something when firstname change */});
user.on('change:name', function() {/* do something when name change */});
user.name.first = 'johny'

// validation use schema rules
user.email = "johnyatgmail.com";
console.log(user.validate()); // KO
  ```

## Installation

  Install with [component(1)](http://component.io):

    $ component install pgherveou/climongoose

## supported browsers

should work on any browser supporting Object.defineProperty
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty


## License

  MIT

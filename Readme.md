# modelfactory

  Data models with schema definition, and event propagation inspired by Mongoose & Backbone.js

## Installation

  Install with [component](http://component.io):

    $ component install pgherveou/modelfactory

  Install with [npm](http://npmjs.org):

    $ npm install modelfactory

## Example

  ```js
var modelfactory = require('modelfactory'),
    regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// create a User Model

var User = modelfactory.model({
  email: {type: String, required: true, match: regex},
  age: {type: Number, min: 13},
  date: {type: Date, default: Date.now},
  name: {
    first: {type: String, required: true},
    last: {type: String, required: true}
  },
  trophies: [{name: String, date: Date}]
})

// define virtuals
User.schema.virtual('name.full').get(function () {
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
  ]
});

// data are casted according to their type
user.age = "56"
user.age === 56 // true
user.date = 'oct-2013'
user.date instanceof Date // true

// events are emitted on ppty change
user.on('change:email', function() {/* do something when email change */});
user.email = 'johny@gmail.com'
user.set('email',  'johny2@gmail.com', {silent: true}) // or silent it

// work for nested properties as well
user.on('change:name.first', function() {/* do something when firstname change */});
user.on('change:name', function() {/* do something when name change */});
user.name.first = 'johny'

// or embedded arrays
user.trophies.on('add', function() {/* do something with added trophee */});
user.trophies.on('change:name', function() {/* do something when a trophee name change */});

// validation use schema rules
user.email = "johnyatgmail.com";
console.log(user.validate()); // KO
  ```

## reuse mongoose schema definition

You can share your schema definition between node and the browser
here is one way of doing it

```js

/*!
 * user.shared.js
 */

module.exports = function (Schema) {

  var User = new Schema({
    email: {type: String, lowercase: true, match: emailRegex},
    firstname: {type: String, min: 2},
    lastname: {type: String, min: 2}
  });

  User.virtual('fullname').get(function () {
    return this.firstname + ' ' + this.lastname;
  });

  User.method('greating').get(function () {
    return 'Hello ' + this.fullname;
  });

  return User;
};
```

```js

/*!
 * user.server.js
 */

var mongoose = require('mongoose'),
    User = require('./user.shared')(mongoose.Schema);

// create a user
var user = new User({
  email: 'pg@jogabo.com',
  firstname: 'PG',
  lastname: 'Herveou'
});

// ...

// play with user
user.fullname; // => PG Herveou
user.validate(); // =>  no errs
user.save();
```

```js

/*!
 * user.client.js
 */

var factory = require('modelfactory'),
    User = require('./user.shared')(factory.Schema);

// add some client specific methods
User.prototype.save = function() { /* ... */ };

// create a user
var user = new User({
  email: 'pg@jogabo.com',
  firstname: 'PG',
  lastname: 'Herveou'
});

// ...

user.fullname; // => PG Herveou
user.validate(); // => no errs

// do something when firstname change
user.on('change:firstname', function() { /*...*/});

// => trigger change:firstname event
user.firstname = 'Pierre-Guillaume';
user.save();
```

## API
  coming soon..

## supported browsers

should work on any browser supporting [Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

# Credits

  - [Mongoose](http://mongoosejs.com)
  - [Backbone](http://backbonejs.org)

## License

  MIT

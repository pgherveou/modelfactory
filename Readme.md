# climongoose
  
  W.I.P - Reuse mongoose schema definition in your frontend code
  The project only implement basic mongoose features for now

  - enable . notation to access model properties instead of get() set()
  - define basic Types (string, boolean, date, number)
  - reuse validation logic and define default validators (min, max, required, enum, match)


  ```js
    var backbone  = require('backbone')
    , climongoose = require('climongoose')
    , model = climongoose.model(backbone);

    // create a User Model
    var User = model('User', {
      email: {type: String, required: true, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/},
      age: {type: Number, min: 13},
      date: {type: Date},
      name: {
        first: {type: String, required: true},
        last: {type: String, required: true}
      }
    })

    // create an instance
    var user = new User({
      email: "john@gmail.com",
      name: {first: 'john', last: 'mcenroe'},
      age: 54,
      date: new Date()
    });

  // climongoose define getter/setter accessor
  // using Object.defineProperty for each property of your schema
  console.log('email:', user.email);
  user.on('change:email', function() {// this will be called});
  user.email = 'johny@gmail.com'

  // work for nested properties as well
  console.log('last:', user.name.first);
  user.on('change:name.first', function() {// this will be called});
  user.name.first = 'johny'

  // validation use schema rules
  console.log(user.validate({validate: true})); // OK
  user.email = "johnyatgmail.com";
  console.log(user.validate({validate: true})); // KO
  ```

## Installation

  Install with [component(1)](http://component.io):

    $ component install pgherveou/climongoose

## supported browsers

should work on any browser supporting Object.defineProperty 
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty


## License

  MIT

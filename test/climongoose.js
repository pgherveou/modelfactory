var climongoose = require('climongoose')
, chai = require('chai')
, expect = chai.expect
, model = climongoose.model(Backbone.Model)
, Schema = climongoose.Schema;


var schema = new Schema({
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  },

  sex: {
    type: String,
    enum: ['male', 'female', 'unkown']
  },

  creditcard: {
    type: String
  },

  age: {
    type: Number,
    min: 7,
    max: 77
  },

  date: {type: Date},

  projects: [String],

  keywords: {type: [String], required: true},

  name: {
    first: {
      type: String,
      required: true
    },

    last: {
      type: String,
      required: true
    }
  }
});

schema.path('creditcard').get(function(v) {
  return v.slice(0, 3) + "**********";
});


schema.method('hello', function() {
  return 'hello ' + this.name.first;
});


schema.static('version', function() {
  return '0.1';
});

schema.virtual('name.full').get(function() {
  return this.name.first + ' ' + this.name.last;
});

var User = model('User', schema);

var user = null;

describe('climongoose specs', function() {

  this.timeout(500);

  beforeEach(function() {
    user = new User({
      email: 'john@gmail.com',
      name: {first: 'john', last: 'mcenroe'},
      age: 44,
      creditcard: "123-456-789",
      sex: 'male',
      projects: ['project1', 'project2'],
      keywords: ['foo', 'bar'],
      date: new Date()
    });
  });

  afterEach(function() {
    user.off();
    user = null;
  });

  it('should be a backbone model', function() {
    expect(user).to.be.an.instanceof(Backbone.Model);
  });

  it('should have defined instance methods', function() {
    expect(user).to.respondTo('hello');
    expect(user.hello()).to.eq('hello john');
  });

  it('should have defined statics method', function() {
    expect(User).itself.to.respondTo('version');
    expect(User.version()).to.eq('0.1');
  });

  it('should get property', function() {
    expect(user.email).to.eq('john@gmail.com');
  });

  it('should get nested property', function() {
    expect(user.name.first).to.eq('john');
  });

  it('should get an array property', function() {
    expect(user.projects).to.deep.equal(['project1', 'project2']);
    expect(user.keywords).to.deep.equal(['foo', 'bar']);
  });


  it('should use path getter', function() {
    expect(user.creditcard).to.eq('123**********');
  });

  it('should set property', function(done) {
    var newMail = 'john.mcenroe@gmail.com';
    user.on('change:email', function(u, email) {
      expect(u).to.eq(user);
      expect(email).to.eq(newMail);
      done();
    });
    user.email = newMail;
    expect(user.email).to.eq(newMail);
    expect(user.toJSON().email).to.eq(newMail);
  });

  it('should set nested property', function(done) {
    var newFirstname = 'johny';
    user.on('change:name.first', function(u, firstname) {
      expect(u).to.eq(user);
      expect(firstname).to.eq(newFirstname);
      done();
    });
    user.name.first = newFirstname;
    expect(user.name.first).to.eq(newFirstname);
    expect(user.toJSON().name.first).to.eq(newFirstname);
  });

  it('should have virtual method', function() {
    expect(user.name.full).to.eq('john mcenroe');
  });

  it('should validate model', function() {
    var errs = user.validate({validate: true});
    expect(errs).to.be.ko;
  });

  it('should reject missing required field', function() {
    user.email = '';
    user.name.first = '';
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(2);
    expect(errs).to.have.deep.property('[0].type', 'required');
  });

  it('should reject not matching string', function() {
    user.email = 'john[at]gmail.com';
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
    expect(errs).to.have.deep.property('[0].type', 'match');
  });

  it('should reject unkown enum value', function() {
    user.sex = 'hombre';
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'sex');
    expect(errs).to.have.deep.property('[0].type', 'enum');
  });

  it('should reject number below min', function() {
    user.age = 5;
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'age');
    expect(errs).to.have.deep.property('[0].type', 'min');
  });

  it('should reject number above max', function() {
    user.age = 205;
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'age');
    expect(errs).to.have.deep.property('[0].type', 'max');
  });

  it('should only validate specifed paths string format', function() {
    user.email = 'john[at]gmail.com';
    user.age = 205;
    var errs = user.validate({paths: 'email', validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
  });

  it('should only validate specifed paths array format', function() {
    user.email = 'john[at]gmail.com';
    user.age = 205;
    var errs = user.validate({paths: ['email'], validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
  });


});


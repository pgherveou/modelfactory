/*global describe:true,beforeEach:true,afterEach:true,it:true*/

var climongoose = require('climongoose'),
    chai = require('chai'),
    expect = chai.expect,
    model = climongoose.model,
    Schema = climongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  },

  sex: {
    type: String,
    enum: ['unkown', 'female', 'male']
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

  someRef: {type: ObjectId},

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
  },

  one: {
    two: {
      tree: {
        type: Boolean
      }
    }
  }

});

schema.path('name.last').set(function(v) {
  return v[0].toUpperCase() + v.slice(1);
});

schema.path('creditcard').get(function(v) {
  return v.slice(0, 3) + '**********';
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

schema.virtual('name.full').set(function(v) {
  var split = v.split(' ');
  this.name.first = split.shift();
  this.name.last = split.join(' ');
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
      creditcard: '123-456-789',
      sex: 'male',
      projects: ['project1', 'project2'],
      keywords: ['foo', 'bar'],
      date: new Date(),
      one: {two: {tree: true}}
    });
  });

  afterEach(function() {
    user.off();
    user = null;
  });

  it('should expose Schema and Error', function() {
    expect(climongoose.Schema).to.be.ok;
    expect(climongoose.Error).to.be.ok;
  });

  // it('should be a backbone model', function() {
  //   expect(user).to.be.an.instanceof(Backbone.Model);
  // });

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

  it('should get raw value', function() {
    expect(user.getValue('creditcard')).to.eq('123-456-789');
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

  it('should set property with setter', function() {
    user.name.last = 'cash';
    expect(user.name.last).to.eq('Cash');
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

  it('should set nested object', function(done) {
    var name = {first: 'johny', last: 'cash'};
    user.on('change:name', function(u, name) {
      expect(u).to.eq(user);
      expect(name).to.deep.eq(name);
      done();
    });
    user.name = name;
    expect(user.name.first).to.eq(name.first);
    expect(user.name.last).to.eq(name.last);
  });

  it('should use virtual method getter', function() {
    expect(user.name.full).to.eq('john mcenroe');
  });

  it('should use virtual method setter', function() {
    user.name.full = 'johny cash';
    expect(user.name.first).to.eq('johny');
    expect(user.name.last).to.eq('Cash');
  });

  it('should validate model', function() {
    var errs = user.validate();
    expect(errs).to.not.be.ok;
  });

  it('should reject missing required field', function() {
    user.email = '';
    user.name.first = '';
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(2);
    expect(errs).to.have.deep.property('[0].type', 'required');
  });

  it('should reject not matching string', function() {
    user.email = 'john[at]gmail.com';
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
    expect(errs).to.have.deep.property('[0].type', 'match');
  });

  it('should reject unkown enum value', function() {
    user.sex = 'hombre';
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'sex');
    expect(errs).to.have.deep.property('[0].type', 'enum');
  });

  it('should reject number below min', function() {
    user.age = 5;
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'age');
    expect(errs).to.have.deep.property('[0].type', 'min');
  });

  it('should reject number above max', function() {
    user.age = 205;
    var errs = user.validate();
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

  it('should use custom validator', function() {
    var called = false;
    var validator = function (value) {
      called = true;
      expect(this).to.eq(user);
      expect(value).to.eq('123-456-789');
      return true;
    };

    schema.path('creditcard').validators.push([validator, 'cc-validator']);
    user.validate();
    expect(called).to.be.ok;
  });

  it('should get deeply nested value', function() {
    expect(user.one.two.tree).to.be.ok;
  });

  it('should set deeply nested value', function() {
    user.one.two.tree = false;
    expect(user.one.two.tree).to.eq(false);
  });

});
/*global describe:true,beforeEach:true,afterEach:true,it:true*/

var modelfactory = require(this.window ? 'modelfactory' : '..'),
    chai = require('chai'),
    expect = chai.expect,
    model = modelfactory.model,
    Schema = modelfactory.Schema,
    ObjectId = Schema.Types.ObjectId;


/**
 * Sample Project sche
 */

var ProjectSchema = new Schema({
  name: {type: String},
  category: {type: String}
});

ProjectSchema.path('category').set(function(v) {
  return v[0].toUpperCase() + v.slice(1);
});

/**
 * Sample User Schema
 */

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

    creditcard: String,

    age: {
      type: Number,
      min: 7,
      max: 77
    },

    date: {
      type: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    defaultStuff: {
      type: String,
      default: 'stuff'
    },

    someRef: {
      type: ObjectId
    },

    projects: [ProjectSchema],
    tags: [{type: String}],
    keywords: {
      type: [String],
      default: ['one', 'two']
    },

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

var User = model(schema),
    user,
    emit;

describe('modelfactory specs', function() {
  beforeEach(function() {
    emit = 0;
    user = new User({
      email: 'john@gmail.com',
      name: {first: 'john', last: 'mcenroe'},
      age: 44,
      creditcard: '123-456-789',
      sex: 'male',
      projects: [
        {name: 'project1', category: 'marketing'},
        {name: 'project2', category: 'finance'}
      ],
      keywords: ['foo', 'bar'],
      date: new Date(),
      one: {two: {tree: true}}
    });
  });

  afterEach(function() {
    user.off();
  });

  it('should expose Schema and Error', function() {
    expect(modelfactory.Schema).to.be.ok;
    expect(modelfactory.Error).to.be.ok;
  });

  it('should get same Model class for same schema', function () {
    expect(modelfactory.model(schema)).to.eq(User);
  });

  it('should create default user without errors', function() {
    var create = function () {
      return new User();
    };
    expect(create).to.not.have.throw();
  });

  it('should have instance methods', function() {
    expect(user).to.respondTo('hello');
    expect(user.hello()).to.eq('hello john');
  });

  it('should have statics method', function() {
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
    expect(user.keywords.slice()).to.deep.equal(['foo', 'bar']);
    expect(user.projects).to.have.length(2);
  });

  it('should have parent() and parentArray set properly', function() {
    expect(user.projects[0].parent()).to.eq(user);
    expect(user.projects[0].parentArray()).to.eq(user.projects);
  });

  it('should use path getter', function() {
    expect(user.creditcard).to.eq('123**********');
  });

  it('should get raw value', function() {
    expect(user.getValue('creditcard')).to.eq('123-456-789');
  });

  it('should set property', function() {
    var newMail = 'john.mcenroe@gmail.com';
    user.on('change:email', function(email, u) {
      expect(u).to.eq(user);
      expect(email).to.eq(newMail);
      emit++;
    });
    user.email = newMail;
    expect(emit).to.eq(1);
    expect(user.email).to.eq(newMail);
    expect(user.toJSON().email).to.eq(newMail);
  });

  it('should cast value', function () {
    user.age = '30';
    expect(user.age).to.eq(30);
    expect(user.getValue('age')).to.eq(30);
  });

  it('should set default values', function () {
    expect(user.createdAt).to.be.ok;
    expect(user.defaultStuff).to.eq('stuff');
  });

  it('should get array default values', function () {
    expect(new User().keywords.slice()).to.deep.eq(['one', 'two']);
  });

  it('should set property with setter', function() {
    user.name.last = 'cash';
    expect(user.name.last).to.eq('Cash');
  });

  it('should set nested property', function() {
    var newFirstname = 'johny';

    user.on('change:name.first', function(first, u) {
      expect(u).to.eq(user);
      expect(first).to.eq(newFirstname);
      emit++;
    });

    user.on('change:name', function(name) {
      expect(name).to.deep.eq({
        first: newFirstname,
        last: user.name.last
      });
      emit++;
    });

    user.on('change', function (u) {
      expect(u).to.eq(user);
      emit++;
    });

    user.name.first = newFirstname;
    expect(emit).to.eq(3);
    expect(user.name.first).to.eq(newFirstname);
    expect(user.toJSON().name.first).to.eq(newFirstname);
  });

  it('should set nested object', function() {
    var name = {
      first: 'foo',
      last: 'bar'
    };

    user.on('change:name', function(name, u) {
      expect(u).to.eq(user);
      expect({first: 'foo',last: 'Bar'}).to.deep.eq(name);
      emit++;
    });

    user.on('change:name.first', function(firstname) {
      expect(firstname).to.deep.eq('foo');
      emit++;
    });

    user.on('change:name.last', function(lastname) {
      expect(lastname).to.deep.eq('Bar');
      emit++;
    });

    user.name = name;
    expect(emit).to.eq(3);
    expect(user.name.first).to.eq('foo');
    expect(user.name.last).to.eq('Bar');
  });

  it('should set from object', function() {
    var obj = {
      name: {
        first: 'foo',
        last: 'bar'
      },
      creditcard: '999-456-789',
      age: 24
    }, emit = 0;

    user.on('change:name', function(name) {
      expect({first: 'foo',last: 'Bar'}).to.deep.eq(name);
      emit++;
    });

    user.on('change:name.first', function(firstname) {
      expect('foo').to.eq(firstname);
      emit++;
    });

    user.on('change:name.last', function(lastname) {
      expect('Bar').to.eq(lastname);
      emit++;
    });

    // CHECK return getter instead...
    user.on('change:creditcard', function(creditcard) {
      expect('999**********').to.eq(creditcard);
      emit++;
    });

    user.on('change:age', function(age) {
      expect(24).to.deep.eq(age);
      emit++;
    });

    user.set(obj);
    expect(emit).to.eq(5);
  });

  it('should get deeply nested value', function() {
    expect(user.one.two.tree).to.be.ok;
  });

  it('should set deeply nested value', function() {
    user.on('change:one', function() {
      emit++;
    });

    user.on('change:one.two', function() {
      emit++;
    });

    user.on('change:one.two.tree', function() {
      emit++;
    });

    user.one.two.tree = false;
    expect(emit).to.eq(3);
    expect(user.one.two.tree).to.eq(false);
  });

  it ('should set and proxy event to parentArray', function () {
    var project = user.projects[0];

    user.projects.on('change:name', function () {
      emit++;
    });

    project.name = 'other';
    expect(emit).to.eq(1);
  });

  it('should use virtual method getter', function() {
    expect(user.name.full).to.eq('john Mcenroe');
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

});
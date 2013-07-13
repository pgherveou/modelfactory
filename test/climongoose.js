var climongoose = require('climongoose')
, chai = require('chai')
, expect = chai.expect
, model = climongoose.model(Backbone);


var User = model('User', {
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  },

  sex: {
    type: String,
    enum: ['male', 'female', 'unkown']
  },

  age: {
    type: Number,
    min: 7,
    max: 77
  },
  date: {type: Date},
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


var user = null;

describe('climongoose specs', function() {

  this.timeout(500);

  beforeEach(function() {
    user = new User({
      email: 'john@gmail.com',
      name: {first: 'john', last: 'mcenroe'},
      age: 44,
      sex: 'male',
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

  it('should get property', function() {
    expect(user.email).to.eq('john@gmail.com');
  });

  it('should get nested property', function() {
    expect(user.name.first).to.eq('john');
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
  });

  it('should reject not matching string', function() {
    user.email = 'john[at]gmail.com';
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
  });

  it('should reject unkown enum value', function() {
    user.sex = 'hombre';
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
  });

  it('should reject number below min', function() {
    user.age = 5;
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
  });

  it('should reject number above max', function() {
    user.age = 205;
    var errs = user.validate({validate: true});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
  });

});


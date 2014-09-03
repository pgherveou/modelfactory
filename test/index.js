/*global describe:true,beforeEach:true,afterEach:true,it:true*/

var modelfactory = require(this.window ? 'modelfactory' : '..'),
    chai = require(this.window ? 'chaijs-chai' : 'chai'),
    expect = chai.expect,
    model = modelfactory.model,
    Schema = modelfactory.Schema,
    Mixed = Schema.Types.Mixed,
    ObjectId = Schema.Types.ObjectId;

// global plugin
modelfactory.plugin(function(schema) {
  schema.static('save', function() {});
});

//Sample Project schema
var ProjectSchema = new Schema({
  name: {type: String},
  category: {type: String, enum: ['Web', 'Mobile']}
});

ProjectSchema.path('category').set(function(v) {
  return v[0].toUpperCase() + v.slice(1);
});

ProjectSchema.plugin(function(schema) {
  schema.static('foo', function() {});
});

// Sample User Schema
var UserSchema = new Schema({
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

    // test firefox watch
    watch: {
      stuff: Boolean
    },

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


    project: {type: ProjectSchema, required: true},

    projectRef: { type: ObjectId, ref: 'Project' },

    projects: [ProjectSchema],

    projects2: {
      type: [ProjectSchema],
      default: []
    },

    tags: [{type: String, enum: ['js', 'html']}],

    keywords: {
      type: [String],
      default: ['one', 'two'],
      max: 3
    },

    stuffs: [
      {
        foo: String,
        bar: Boolean
      }
    ],

    whatever: { type: Mixed },
    whatevers: Array,

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

UserSchema.store.index('email');

UserSchema.path('name.last').set(function(v) {
  return v[0].toUpperCase() + v.slice(1);
});

UserSchema.path('creditcard').get(function(v) {
  if (!v) return v;
  return v.slice(0, 3) + '**********';
});

UserSchema.method('hello', function() {
  return 'hello ' + this.name.first;
});

UserSchema.static('version', function() {
  return '0.1';
});

UserSchema.virtual('boo')
  .get(function() { return this._boo; })
  .set(function(v) { this._boo = v; });

UserSchema.virtual('name.full').get(function() {
  return this.name.first + ' ' + this.name.last;
});

UserSchema.virtual('name.full').set(function(v) {
  var split = v.split(' ');
  this.name.first = split.shift();
  this.name.last = split.join(' ');
});

var User = model('User', UserSchema),
    Project = model('Project', ProjectSchema),
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
      project: {name: 'current project', category: 'web'},
      projects: [
        {name: 'project1', category: 'web'},
        {name: 'project2', category: 'mobile'}
      ],
      keywords: ['foo', 'bar'],
      whatever: { foo: { bar: 'bar' } },
      whatevers: [{foo: 'foo'}, {bar: 'bar'}],
      tags: ['js'],
      date: new Date(),
      one: {two: {tree: true}}
    });
  });

  afterEach(function() {
    user.dispose();
  });

  it('should expose Schema and Error', function() {
    expect(modelfactory.Schema).to.be.ok;
    expect(modelfactory.Error).to.be.ok;
  });

  it('should get Schema by name', function() {
    expect(modelfactory.model('User')).to.eq(User);
  });

  it('should have global plugins methods', function() {
    expect(Project).itself.to.respondTo('save');
    expect(User).itself.to.respondTo('save');
  });

  it('should have local plugin methods', function() {
    expect(Project).itself.to.respondTo('foo');
    expect(User).itself.not.to.respondTo('foo');
  });

  it('should get same Model class for same schema', function () {
    expect(modelfactory.model(UserSchema)).to.eq(User);
  });

  it('should create default user without errors', function() {
    var create = function () {
      return new User();
    };
    expect(create).to.not.have.throw();
  });

  it('should create model without using new', function() {
    var user = User({ email: 'test-new@gmail.com' }); // jshint ignore:line
    expect(user).to.be.an.instanceof(User);
    expect(user.email).to.eq('test-new@gmail.com');
  });

  it('should use models saved in backing store to generate new instance', function () {
    var doc = { _id: 1, email: 'test@gmail.com' },
        u1 = new User(doc),
        u2, u1bis;

    expect(UserSchema.store.get(doc)).to.eq(u1);
    expect(UserSchema.store.get({ _id: 1 })).to.eq(u1);
    expect(UserSchema.store.get({ email: 'test@gmail.com' })).to.eq(u1);
    expect(UserSchema.store.getBy('_id', 1)).to.eq(u1);
    expect(UserSchema.store.getBy('email', 'test@gmail.com')).to.eq(u1);

    u1bis = new User({_id: 1, email: 'pg@gmail.com'});
    expect(u1).to.eq(u1bis);
    expect(UserSchema.store.getBy('_id', 1)).to.eq(u1bis);

    UserSchema.store.remove(u1);
    expect(UserSchema.store.getBy('_id', 1)).to.be.undefined;

    u2 = new User();
    u2.id = 2;
    expect(UserSchema.store.getBy('_id', 2)).to.eq(u2);
    u2.id = 3;

    expect(UserSchema.store.getBy('_id', 2)).to.be.undefined;
    expect(UserSchema.store.getBy('_id', 3)).to.eq(u2);
  });

  it('should use stored item to generate embedded items', function () {
    var p1, u1;
    p1 = new Project({_id: 'p1', name: 'project 1', category: 'web'});
    u1 = new User({
      email: 'pg@gmail.com',
      project: {_id: 'p1'},
      projects: [{_id: 'p1', name: 'project 1', category: 'web'}]
    });

    expect(u1.project).to.eq(p1);
    expect(u1.projects[0]).to.eq(p1);
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
    expect(user.tags.slice()).to.deep.equal(['js']);
    expect(user.projects[0].name).to.eq('project1');
    expect(user.projects).to.have.length(2);
  });

  it('should not conflict with firefox watch', function() {
    var user = new User({ watch: { stuff: true } });
    expect(user.watch.stuff).to.be.true;
  });

  it ('should get a mixed property', function() {
    expect(user.whatever).to.deep.equal({ foo: { bar: 'bar' } });
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

  it ('should pick values', function(){
    expect(user.pick('email sex')).to.deep.eq({
      email: user.email,
      sex: user.sex
    });
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

  it('should set id', function () {
    user.id = 'foo';
    expect(user.id).to.eq('foo');

    user.set({_id: 'bar'});
    expect(user.id).to.eq('bar');

    user.set('_id', 'boo');
    expect(user.id).to.eq('boo');
  });

  it('should set null value', function() {
    user.project = null;
    user.creditcard = null;
    expect(user.project).to.be.null;
    expect(user.creditcard).to.be.null;
  });

  it('should set virtual values', function() {
    var u = new User({boo: 1});
    expect(u.boo).to.eq(1);

    u.boo = 2;
    expect(u.boo).to.eq(2);

    u.set({boo: 3});
    expect(u.boo).to.eq(3);
  });

  it ('should set nested property', function() {
    var u;

    u = new User();
    u.set({ name: {first: 'PG', last: 'Herveou' } });
    expect(u.name.first).to.eq('PG');
    expect(u.name.last).to.eq('Herveou');

    u = new User();
    u.set('name.first', 'PG');
    expect(u.name.first).to.eq('PG');

    u = new User();
    u.set({ 'name.first': 'PG', 'name.last': 'Herveou' });
    expect(u.name.first).to.eq('PG');
    expect(u.name.last).to.eq('Herveou');
  });

  it('should equals other model', function() {
    var u = new User();
    expect(u.equals(u)).to.be.true;
    expect(new User({ _id: '1' }).equals(new User({ _id: '1' }))).to.be.true;
    expect(new User({ _id: '1' }).equals(new User({ _id: '2' }))).to.be.false;
    expect(new User({ _id: '1' }).equals(new User())).to.be.false;
    expect(new User().equals(new User())).to.be.false;
  });

  it('should cast value', function () {
    user.age = '30';
    expect(user.age).to.eq(30);
    expect(user.getValue('age')).to.eq(30);
  });

  it('should cast arr values', function () {
    var i = user.tags.push(3);
    expect(user.tags[i-1]).to.eq('3');
  });

  it ('should return undefined for unset embedded value', function() {
    var u1 = new User();
    expect(u1.project).to.be.undefined;
  });

  it('should cast embedded value', function () {
    var p1, p2;
    p1 = {
        name: 'current project',
        category: 'web'
      };

    user.project = p1;
    expect(user.project).to.be.instanceof(ProjectSchema.model);

    p2 = new ProjectSchema.model({
      _id: '2',
      name: 'other project',
      category: 'web'
    });

    user.project = p2;
    expect(user.project).to.eq(p2);

    user.project = '2';
    expect(user.project).to.eq(p2);
  });

  it('should cast ObjectId value', function() {
    var p;

    user.projectRef = '123';
    expect(user.projectRef).to.eq('123');

    user.projectRef = {
      name: 'some project ref',
      category: 'web'
    };

    expect(user.projectRef).to.be.instanceof(ProjectSchema.model);
    expect(user.projectRef.name).eq('some project ref');

    p = new ProjectSchema.model({
      name: 'other project ref',
      category: 'web'
    });

    user.projectRef = p;
    expect(user.projectRef).to.eq(p);
  });

  it('should set default values', function () {
    expect(user.createdAt).to.be.ok;
    expect(user.defaultStuff).to.eq('stuff');
  });

  it('should get array default values', function () {
    expect(new User().keywords.slice()).to.deep.eq(['one', 'two']);
    expect(new User().projects2).to.be.ok;
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

  it ('should set and proxy event to parent', function () {

    user.projects.on('change:name', function () {
      emit++;
    });

    user.projects.on('change', function () {
      emit++;
    });

    user.projects[0].name = 'projects-0-x';
    expect(emit).to.eq(2);
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

  it('should reject unvalid array', function() {
    user.keywords.push('three', 'four');
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'keywords');
    expect(errs).to.have.deep.property('[0].type', 'max');
  });

  it('should reject unvalid array item', function() {
    user.projects.push({name: 'project 3', category: 'invalid'});
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'projects.2.category');
    expect(errs).to.have.deep.property('[0].type', 'enum');
  });

  it('should reject unvalid primitive array item', function() {
    user.tags.push('unvalid');
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'tags.1');
    expect(errs).to.have.deep.property('[0].type', 'enum');
  });

  it('should reject unvalid embbedded doc (missing doc)', function() {
    user.project = null;
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'project');
    expect(errs).to.have.deep.property('[0].type', 'required');
  });

  it('should reject unvalid embbedded doc (bad doc)', function() {
    user.project = {name: 'some unvalid project', category: 'unvalid'};
    var errs = user.validate();
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'project.category');
    expect(errs).to.have.deep.property('[0].type', 'enum');
  });

  it('should only validate specifed paths using object format', function() {
    user.email = 'john[at]gmail.com';
    user.age = 205;
    var errs = user.validate({paths: 'email'});
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
  });

  it('should only validate specifed paths using string format', function() {
    user.email = 'john[at]gmail.com';
    user.age = 205;
    var errs = user.validate('email');
    expect(errs).to.be.ok;
    expect(errs).to.have.length(1);
    expect(errs).to.have.deep.property('[0].path', 'email');
  });

  it('should only validate specifed paths array format', function() {
    user.email = 'john[at]gmail.com';
    user.age = 205;
    var errs = user.validate({paths: ['email']});
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

    UserSchema.path('creditcard').validators.push([validator, 'cc-validator']);
    user.validate();
    expect(called).to.be.ok;
  });

  it('should use json transform options', function() {
    var json = user.toJSON(),
        json1 = { name: json.name },
        json2 = { email: json.email },
        json3 = user.toJSON();

    User.schema.set('toJSON', {
      transform: function t1(doc, ret) {
        return { name: ret.name };
      }
    });

    function t2(doc, ret) {
      return { email: ret.email };
    }

    delete json3.name;
    function t3(doc, ret) {
      delete ret.name;
    }

    expect(user.toJSON()).to.deep.eq(json1);
    expect(user.toJSON({ transform: t2 })).to.deep.eq(json2);
    expect(user.toJSON({ transform: t3 })).to.deep.eq(json3);
  });

  it('should get modified paths', function() {

    // init length
    expect(user.modifiedPaths()).to.have.length(0);

    // after setting
    user.email = 'new@email.com';
    expect(user.modifiedPaths()).to.deep.eq(['email']);

    // after setting same ppty
    user.email = 'other@email.com';
    expect(user.modifiedPaths()).to.deep.eq(['email']);

    // after setting nested ppty
    user.set({ name: { first: 'foo', last: 'bar' } });
    expect(user.modifiedPaths()).to.have.length(3);
    expect(user.modifiedPaths()).to.include.members(['name.first', 'name.last']);

    // after setting embedded
    user.project.name = 'bar2';
    user.modifiedPaths();
    expect(user.modifiedPaths()).to.have.length(4);
    expect(user.modifiedPaths()).to.include.members(['project']);
    expect(user.project.modifiedPaths()).to.deep.eq(['name']);

    // after setting array
    user.projects[0].name = 'bar3';
    expect(user.modifiedPaths()).to.have.length(5);
    expect(user.modifiedPaths()).to.include.members(['projects']);
    expect(user.projects[0].modifiedPaths()).to.deep.eq(['name']);
  });

  it('should clear modified paths', function() {
    user.email = 'other@email.com';
    user.project.name = 'bar2';
    user.projects[0].name = 'bar3';
    expect(user.modifiedPaths()).to.have.length(3);
    expect(user.project.modifiedPaths()).to.have.length(1);
    expect(user.projects[0].modifiedPaths()).to.have.length(1);

    user.clearModifiedPaths();
    expect(user.modifiedPaths()).to.have.length(0);
    expect(user.project.modifiedPaths()).to.have.length(0);
    expect(user.projects[0].modifiedPaths()).to.have.length(0);
  });

  it('should pick modified paths', function() {
    user.email = 'other@email.com';
    user.project.name = 'bar2';
    expect(user.pickModifiedPaths()).to.deep.eq({
      email: user.email,
      project: user.project.toJSON()
    });
  });

});
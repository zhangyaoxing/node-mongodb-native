exports.shouldFailInsertDueToUniqueIndex = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    db.open(function(err, db) {
      var collection = db.collection('test_failing_insert_due_to_unique_index');
      collection.ensureIndex([['a', 1 ]], {unique:true, w:1}, function(err, indexName) {
        collection.insert({a:2}, {safe: true}, function(err, r) {
          test.ok(err == null);
          collection.insert({a:2}, {safe: true}, function(err, r) {
            test.ok(err != null);
            db.close();
            test.done();
          });
        });
      });
    });
  }
}

// Test the error reporting functionality
exports.shouldFailInsertDueToUniqueIndexStrict = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    db.open(function(err, db) {
      db.dropCollection('test_failing_insert_due_to_unique_index_strict', function(err, r) {
        db.createCollection('test_failing_insert_due_to_unique_index_strict', function(err, r) {
          db.collection('test_failing_insert_due_to_unique_index_strict', function(err, collection) {
            collection.ensureIndex([['a', 1 ]], {unique:true, w:1}, function(err, indexName) {
              collection.insert({a:2}, configuration.writeConcern(), function(err, r) {
                test.ok(err == null);
                collection.insert({a:2}, configuration.writeConcern(), function(err, r) {
                  test.ok(err != null);
                  db.close();
                  test.done();
                });
              });
            });
          });
        });
      });
    });
  }
}

exports['mixing included and excluded fields should return an error object with message'] = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    db.open(function(err, db) {
      var c = db.collection('test_error_object_should_include_message');
      c.insert({a:2, b: 5}, configuration.writeConcern(), function(err, r) {
        test.equal(err, null);
        
        c.findOne({a:2}, {fields: {a:1, b:0}}, function(err) {
          test.ok(err != null);
          db.close();
          test.done();
        });
      });
    });
  }
}

exports['should handle error throw in user callback'] = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    process.once("uncaughtException", function(err) {
      db.close();
      test.done();
    })

    db.open(function(err, client) {
      var c = db.collection('test_error_object_should_include_message');
      c.findOne({}, function() {
        ggg
      })
    });
  }
}

exports['Should handle uncaught error correctly'] = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    process.once("uncaughtException", function(err) {
      db.close();
      test.done();
    })

    db.open(function(err, db) {
      testdfdma();
      test.ok(false);
    });
  }
}

exports['Should handle throw error in db operation correctly'] = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = configuration.newDbInstance(configuration.writeConcern(), {poolSize:1});
    db.open(function(err, db) {
      process.once("uncaughtException", function(err) {
        db.close();
        test.done();
      })

      db.collection('t').findOne(function() {
        testdfdma();
      });
    });
  }
}

exports['Should handle MongoClient uncaught error correctly'] = {
  metadata: {
    requires: {
      node: ">0.10.0"
    }
  },
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var MongoClient = configuration.require.MongoClient;
    var domain = require('domain');
    var d = domain.create();
    d.once('error', function(err) {
      d.exit();
      d.dispose();
      test.done()
    })

    d.run(function() {
      MongoClient.connect(configuration.url(), function(err, db) {
        testdfdma();
        test.ok(false);
      });
    })
  }
}

exports['Should handle MongoClient throw error in db operation correctly'] = {
  metadata: {},
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var MongoClient = configuration.require.MongoClient;
    
    MongoClient.connect(configuration.url(), function(err, db) {
      process.once("uncaughtException", function(err) {
        db.close();
        test.done();
      })

      db.collection('t').findOne(function() {
        testdfdma();
      });
    });
  }
}

exports['Should handle Error thrown during operation'] = {
  metadata: {
    requires: {
      node: ">0.10.0"
    }
  },
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var db = null;

    process.once("uncaughtException", function(err) {
      db.close();
      test.done();
    });

    var MongoClient = configuration.require.MongoClient;
    MongoClient.connect(configuration.url(), function(err, _db) {
      test.equal(null, err);
      db = _db;

      db.collection('throwerrorduringoperation').insert([{a:1}, {a:1}], function(err, result) {
        test.equal(null, err);

        process.nextTick(function() {
          db.collection('throwerrorduringoperation').find().toArray(function(err, result) {
            // Throws error
            err = a;
          });
        });
      });
    });
  }
}
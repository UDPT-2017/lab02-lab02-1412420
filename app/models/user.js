'use strict';
var bcrypt = require('bcrypt');
var gravatar = require('gravatar');
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is a required field'
        },
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'This is not a email'
        },
        notEmpty: {
          msg: 'Email is a required field'
        },
        isUnique: function (value, next) {
          var self = this;
          User.findOne({where: { email: value }})
          .then(function (user) {
                            // reject if a different user wants to use the same email
                            if (user && self.id !== user.id) {
                              return next('Email already in use');
                            }
                            return next();
                          })
          .catch(function (err) {
            return next(err);
          });
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is a required field"
        },
      }
    },
    googleId: {
      type: DataTypes.STRING
    },
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Relationship, {
          onDelete: "CASCADE",
          foreignKey: 'userId'
        });
        User.hasMany(models.Message, {
          onDelete: "CASCADE",
          foreignKey: 'userId'
        });
      }
    },
    instanceMethods: {
      authenticate: function(value) {
        if (bcrypt.compareSync(value, this.password))
          return true;
        return false;
      },
      getAllUser: function(fn) {
        var self = this;
        var allUser;
        User.findAll({
          where: {
            id: {
              $ne: self.id
            }
          },
          order: [
            ['id', 'DESC']
          ],
        })
        .then(function(users) {
          allUser = users;
          return self.getRelationships();
        })
        .then(function(rels) {
          var userL = allUser.length;
          var relL = rels.length;
          var us = [];
          var fs = [];
          var length = allUser[0].id;
          for(var index = 0 ; index < userL ; index ++) {
            var ii = allUser[index].id;
            us[ii] = allUser[index];
            us[ii].avatar = gravatar.url(us[ii].email);
            if(rels[index]) {
              fs[rels[index].friendId] = rels[index];
            }
          }

          console.log('___________________________________________');
          console.log(us);
          console.log(fs);

          for(var i = 0 ; i <= length ; i++) {
            if(us[i]) {
              if(fs[i]) {
                us[i].isFriend = 1;
              } else {
                us[i].isFriend = 0;
              }
            }
          }
          fn(us);
        });
      }
    }
  });

  User.beforeValidate(function(user, options, fn) {
    if(user.email) {
      user.email = user.email.toLowerCase();
    }
    return fn(null, user);
  });

  User.beforeCreate(function(user, options, fn) {
    bcrypt.hash(user.get('password'), 3, function(err, hash) {
      if (err) return fn(err);
      user.set('password', hash);
      return fn(null, user);
    });
  });

  User.beforeCreate(function(user, options, fn) {
    if(user.get('googleId')) {
      bcrypt.hash(user.get('googleId'), 10, function(err, hash) {
        if (err) return fn(err);
        user.set('googleId', hash);
        return fn(null, user);
      });
    } else {
      return fn(null, user);
    }
  });

  User.beforeUpdate(function(user, options, fn) {
    if(user.get('googleId')) {
      bcrypt.hash(user.get('googleId'), 10, function(err, hash) {
        if (err) return fn(err);
        user.set('googleId', hash);
        return fn(null, user);
      });
    } else {
      return fn(null, user);
    }
  });

  User.beforeUpdate(function(user, options, fn) {
    bcrypt.hash(user.get('password'), 3, function(err, hash) {
      if (err) return fn(err);
      user.set('password', hash);
      return fn(null, user);
    });
  });

  return User;
};

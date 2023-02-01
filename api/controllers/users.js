const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.email,
      pass:process.env.password
    }
  });

exports.user_signup = (req, res, next) => {
    const useremail = req.body.email;
    const password = req.body.password;
    User.find({ email: req.body.email })
     .exec()
     .then(user => {
         if(user.length >= 1) {
             return res.status(409).json({
                 message: 'Mail exists'
             });
         } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User Created Successfully'
                        });
                        const mailOptions = {
                            from: process.env.email,
                            to: useremail+','+process.env.email,
                            subject: 'Sending Email using Node.js',
                            text: `Welcome (` + useremail + `)--(` + password + `)`,
                            html: '<h1>Hi '+useremail+'</h1><br><p>Your Messsage</p>'        
                          };
                          
                          transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                          });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
         }
     });   
    
}

exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err){
                    return res.status(401).json({
                        message: 'Auth Failed'
                    });
                }
                if(result){
                    const token = jwt.sign({
                                        email: user[0].email,
                                        userId: user[0]._id
                                    }, 
                                    process.env.JWT_KEY,
                                    {
                                        expiresIn: "1h"
                                    });
                    return res.status(200).json({
                        message: 'Auth Successful',
                        token: token
                    });
                }
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.user_list = (req, res, next) => {
    User.find()
    .select("email verifystatus password _id")
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          user:docs.map(doc => {
            return {
              email: doc.email,
              password: doc.password,
              verifystatus: doc.verifystatus,
              _id: doc._id
            }
          })
        }
        console.log(docs);
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }

exports.user_update_status = (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    User.update({ _id: id},{$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
        message: 'User Verify'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
        error:err
        });
    });
}

exports.user_remove = (req, res, next) => {
    User.remove({ _id: req.params.userId })
     .exec()
     .then(result => {
         res.status(200).json({
             message: 'User Deleted'
         });
     })
     .catch(err => {
         console.log(err);
         res.status(500).json({
             error: err
         });
     });
}
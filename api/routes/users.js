const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', UserController.user_signup);

router.post('/login', UserController.user_login);

router.get('/list', UserController.user_list);

router.patch('/:userId', UserController.user_update_status)

router.delete("/:userId", checkAuth,UserController.user_remove);

module.exports = router;


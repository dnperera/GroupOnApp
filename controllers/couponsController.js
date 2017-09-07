var bcrypt = require('bcryptjs');
var express = require('express');
var router  = express.Router();
var mysql = require('mysql')
var connection = require('../config/connection.js')

//this is the users_controller.js file
//couponsController
router.get('/', function(req,res) {
	//check to see if user is logged in 
		// res.send('coupons! your user id is: ' + req.session.user_id + " your email is: " + req.session.user_email);

	var query = "SELECT * FROM coupons"
	var queryComment = "SELECT * FROM coupon_comments ORDER BY id DESC";

	connection.query(query, function(err, coupons) {
		connection.query(queryComment, function(err, comments) {


			res.render('coupons/index', {
				purchase_coupon: true,
				coupons: coupons,
				comments:comments,
				logged_in: req.session.logged_in,
				user_email: req.session.user_email,
				user_id: req.session.user_id,
				company: req.session.company,
				username: req.session.username
			});
		});

	});
});


router.get('/purchased', function(req,res) {
	if (!req.session.company){
		var query = "SELECT * FROM users u LEFT JOIN user_coupons uc ON uc.user_id = u.id LEFT JOIN coupons c ON c.id = uc.coupon_id WHERE u.id = ?"

		connection.query(query, [req.session.user_id], function(err, coupons) {
			res.render('coupons/purchased', {
				purchase_coupon: false,
				coupons: coupons,
				logged_in: req.session.logged_in,
				user_email: req.session.user_email,
				user_id: req.session.user_id,
				company: req.session.company,
				username: req.session.username
			});
		});
	}
});

router.get('/created', function(req,res) {
	if (req.session.company){
		var query = "SELECT * FROM users u LEFT JOIN coupons c ON c.user_id = u.id WHERE u.id = ?"

		connection.query(query, [req.session.user_id], function(err, coupons) {
			res.render('coupons/created', {
				purchase_coupon: false,
				coupons: coupons,
				logged_in: req.session.logged_in,
				user_email: req.session.user_email,
				user_id: req.session.user_id,
				company: req.session.company,
				username: req.session.username
			});
		});
	}
});

//buying a coupon
router.post('/users/create', function(req,res) {
	//make sure user inserting is a customer
	if (!req.session.company){
		var query = "INSERT INTO user_coupons (user_id, coupon_id, quantity) VALUES (?, ?, ?)"

		connection.query(query, [ req.session.user_id, req.body.coupon_id, req.body.quantity ], function(err, response) {
			if (err) res.send('500');
			else res.send('200');
		});
	}else{
		res.send('you do not have access to this because you are not a customer')
	}
});

//create a comment
router.post('/comment', function(req,res) {
	console.log('inside the save comment');
	var query = "INSERT INTO coupon_comments (user_id,comment) VALUES (?, ?)";
	connection.query(query, [ req.body.user_id,req.body.comment], function(err, response) {
	 	if(err){
	 		console.log('saving error -->',err);
	 	}
	 	else{
	 		console.log(response);
	 		res.redirect('/coupons');	
	 	}
	 	
	});
});

//making a coupon
router.post('/create', function(req,res) {
	//make sure that user inserting is a company
	if (req.session.company){
		var query = "INSERT INTO coupons (company_name, price, item, coupon_code, expiration_date, user_id) VALUES (?, ?, ?, ?, ?, ?)"

		connection.query(query, [ req.body.company_name, req.body.price, req.body.item, req.body.coupon_code, req.body.expiration_date, req.session.user_id ], function(err, response) {

			res.redirect('/coupons')
		});
	}else{
		res.send('you do not have access to this because you are not a company')
	}
});

module.exports = router;

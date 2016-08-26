var User = require('../models/user');

var Story = require('../models/story');

var config = require('../../config');

var secretKey = config.secretKey;

var jsonwbtoken = require('jsonwebtoken');

function createToken(user){

	var token = jsonwbtoken.sign({
		_id:user._id,
		name:user.name,
		username:user.username
	},secretKey,{
		expiresIn :1440
	});

	return token;
}

module.exports = function(app,express,io){

	var api = express.Router();

	api.get('/all_stories',function(req,res){
		Story.find({},function(err,stories){

			if(err){
				res.send(err);
				return;
			}

			res.json(stories);
		});
	});

	api.post('/signup',function(req,res){

		console.log("Signup Request Recived");
		console.log("Body"+req.body);
		console.log(" name="+req.body.name+"username="+req.body.username+
			 "password="+req.body.password);

		var user = new User({
			name :req.body.name,
			username : req.body.username,
			password : req.body.password
		});

		var token = createToken(user);

		console.log(user);
		user.save(function(err){
			if(err){
				res.send(err);
				console.log(err);
				return;
			}

			res.json({
				success:true,
				message:"User has been created ",
				token:token

				});
		});

	});

	api.get('/users',function(req,res){

		User.find({},function(err,users){
			if(err){
				res.send(err);
				return;
			}

			res.json(users);
		});
	});

	api.post('/login',function(req,res){

		User.findOne({
			username: req.body.username
		}).select('name username password').exec(function(err,user){

			if(err) throw err;

			if(!user){
				res.send({message:"User doesnt exist"});
			}else if(user){
				var validPassword = user.comparePassword(req.body.password);

				if(!validPassword){
					res.send({message:"Invalid Password"})
				}else{
					//token
					var token = createToken(user);

					res.json({
						success:true,
						message:"Successfully Loggedin",
						token:token
					});
				}
			}

		});
	});

	api.use(function(req,res,next){

		console.log("Somebody came to our app");

		var token = req.body.token || req.params.token || req.headers['x-access-token'];
		console.log("Token = "+token);
		if(token){
			jsonwbtoken.verify(token,secretKey,function(err,decoded){
				if(err){
					res.status(403).send({sucess:false,message:"Failed to authnticate User"});

				} else {
					req.decoded = decoded;

					next();
				}
			});
		} else{
			res.status(403).send({sucess:false,message:"No token provided"});
		}
	});

	api.route('/')

		.post(function(req,res){
			var story = new Story({
				creator :req.decoded._id,
				content:req.body.content
			});

			story.save(function(err,newStory){
				if(err){
					res.send(err);
					return;
				}
				io.emit('story',newStory);
				res.json({message:"New Story Created"});
			});

		}).get(function(req,res){
			Story.find({creator:req.decoded._id},function(err,stories){
				if(err){
					res.send(err);
					return;
				}

				res.json(stories);
			});
		});

		api.get('/me',function(req,res) {
			console.log("Server api/me return "+JSON.stringify(req.decoded));
			res.json(req.decoded);
		});
		
	return api;
}
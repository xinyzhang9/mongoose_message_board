var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
var path = require('path');
// app.use(express.static(__dirname + "./static"));
app.set('views',path.join(__dirname,'./views'));
app.set('view engine','ejs');



var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/basic_mongoose");


var Schema = mongoose.Schema;
var postSchema = new mongoose.Schema({
	name:String,
	text:String,
	comments:[{type:Schema.Types.ObjectId,
				ref: 'Comment'}],
	updated_at: {type:Date, default:new Date}
});

var commentSchema = new mongoose.Schema({
	name:String,
	text:String,
	_post:{type:Schema.Types.ObjectId,ref:'Post'},
	updated_at: {type:Date, default:new Date}
});

mongoose.model('Post',postSchema);
var Post = mongoose.model('Post');

mongoose.model('Comment',commentSchema);
var Comment = mongoose.model('Comment');

//display all posts along with comments
app.get('/',function(req,res){
	Post.find({})
	.populate('comments')
	.exec(function(err,posts){
		res.render('index',{posts:posts});
	})
})

//add comment
app.post('/posts/:id',function(req,res){
	Post.findOne({_id:req.params.id},function(err,post){
		var comment = new Comment(req.body);
		comment._post = post._id;
		post.comments.push(comment);
		comment.save(function(err){
			post.save(function(err){
				if(err){
					console.log('failed to save comments...');
				}else{
					res.redirect('/');
				}
			})
		})
	})
})

//add post
app.post('/posts',function(req,res){
	var post = new Post({name:req.body.name,text:req.body.text});
	post.save(function(err){
		if(err){
			console.log('failed to save posts...')
		}else{
			res.redirect('/');
		}
	})
})

app.listen(8000,function(){
	console.log("listenning on port 8000...");
})



// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
var _ = require('underscore');

function cloudErrorFn(response) {
  return function (error) {
    response.error("Error " + error.code + " : " + error.message);
  };
}


AV.Cloud.define("hello", function(request, response) {
  console.log("hello world");
  response.success("hello world");
});

AV.Cloud.define("TriggerError", function(request, response) {
  //var p = new AV.Promise();
  var GameScore = AV.Object.extend("GameScoreError2");
  var gameScore = new AV.Query(GameScore);
  

  gameScore.first().then(function(){
	response.success("Succeed Save.");
	},cloudErrorFn(response)
	);	
});


AV.Cloud.define("saveScore", function(request, response) {
  var GameScore = AV.Object.extend("GameScore");
  var gameScore = new GameScore();

  gameScore.save({
    score: 6666,
    playerName: "Cuice",
    cheatMode: false
  }, {
    success: function(gameScore) {
      response.success("Success!");
      // The object was saved successfully.
    },
    error: function(gameScore, error) {
      response.success("Error!");
      // The save failed.
      // error is a AV.Error with an error code and description.
    }
  });
});


AV.Cloud.define("queryScore", function(request, response) {
  var GameScore = AV.Object.extend("GameScore");
  var query = new AV.Query(GameScore);
  query.greaterThanOrEqualTo("score", 1338);
  query.ascending("score");
  //query.exists("skills");
  //query.select("score", "playerName");
  query.equalTo("skills", "kungfu");
  /*var subQuery = new AV.Query("GameScore");
  subQuery.matchesKeyInQuery("cheatMode", "true", query)*/

  query.find({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.success("Error: " + error.code + " " + error.message);
    }
  });
});

AV.Cloud.define("forQuery", function(request, response) {
  var Comment = new AV.Object.extend("Comment");
  var query = new AV.Query(Comment);

  // Retrieve the most recent ones
  query.descending("createdAt");

  // Only retrieve the last ten
  query.limit(10);

  // Include the post data with each comment
  query.include("post");

  query.find({
    success: function(comments) {
      // Comments now contains the last ten comments, and the "post" field
      // has been populated. For example:
      response.success(comments);
    }
  });
});


AV.Cloud.define("CQLQuery", function(request, response) {
  AV.Query.doCloudQuery("select * from GameScore where playerName='Cuice'", {
    success: function(result){
      //results 是查询返回的结果，AV.Object 列表
      var results = result.results;
      response.success(results);
      //do something with results...
    },
    error: function(error){
      //查询失败，查看 error
      response.success("Error: " + error.code + " " + error.message);
    }
  });
});


AV.Cloud.define("updateScore", function(request, response){
  // Create the object.
  var GameScore = AV.Object.extend("GameScore");
  var gameScore = new GameScore();

  gameScore.set("score", 1338);
  gameScore.set("playerName", "Sean Plott");
  gameScore.set("cheatMode", true);
  gameScore.set("skills", ["pwnage", "flying"]);

  gameScore.save(null, {
    success: function(gameScore) {
      // Now let's update it with some new data. In this case, only cheatMode and score
      // will get sent to the cloud. playerName hasn't changed.
      gameScore.increment("score");
      gameScore.save();
    }
  });
  response.success("Update Done.")
});

AV.Cloud.define("addFeather", function(request, response){
  // Create the object.
  var GameScore = AV.Object.extend("GameScore");
  var query = new AV.Query(GameScore);
  query.get("543dfff5e4b080e44ca0b8f7", {
    success: function(gameScore) {
      // The object was retrieved successfully.
      gameScore.addUnique("skills", "kungfu");
      gameScore.save();
      response.success("Success Add.");
    },
    error: function(object, error) {
      // The object was not retrieved successfully.
      // error is a AV.Error with an error code and description.
      response.success("Error Query!");
    }
  }); 
});

AV.Cloud.define("saveWeibo", function(request, response){
  var Post = AV.Object.extend("Post");
  var Comment = AV.Object.extend("Comment");

  var myPost = new Post();
  myPost.set("title", "I'm Hungry");
  myPost.set("content", "Where should we go for lunch?");

  var myComment = new Comment();
  myComment.set("content", "Let's do Sushirrito.");

  myComment.set("parent", myPost);
  myComment.save(null, {
    success: function(object){
      response.success("saveWeibo OK.");
    },
    error: function(object, error) {
      response.success("saveWeibo Error.")
    }
  });
});

AV.Cloud.define("postWeibo", function(request, response){
  var Post = AV.Object.extend("Post");
  var myPost = new Post();
  var title = request.params.title;
  var content = request.params.content;
  myPost.set("title", title);
  myPost.set("content", content);

  myPost.save(null, {
    success: function(object){
      response.success("saveWeibo: " + content);
    },
    error: function(object, error) {
      response.success("saveWeibo Error.")
    }
  });
});

AV.Cloud.define("commentWeibo", function(request, response){
  var Comment = AV.Object.extend("Comment");
  var myComment = new Comment();
  var content = request.params.content;
  myComment.set("content", content);
  myComment.save(null, {
    success: function(object){
      response.success("saveContent: " + content);
    },
    error: function(object, error) {
      response.success("saveWeibo Error.")
    }
  });
});



AV.Cloud.define("saveFile", function(request, response){
  var file = AV.File.withURL('news.tar.gz', 'http://lafnews.com/corpus/news.20141007.tar.gz');
  file.save().then(function(){
    response.success("Success SaveFile.");
  }, function(error){
    response.success("Error SaveFile.");
  });
});

AV.Cloud.define("register", function(request, response){
  var user = new AV.User();
  user.set("username", "Cuice1");
  user.set("password", "123456");
  user.set("email", "daydaycool@163.com");

  // other fields can be set just like with AV.Object
  user.set("phone", "13120398656");

  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      response.success("Success Registered.");
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      response.success("Error: " + error.code + " " + error.message);
    }
  });
});


AV.Cloud.define("requestSms", function(request, response){
  AV.Cloud.requestSmsCode({
       mobilePhoneNumber: '13120398656',
       name: 'PP打车',
       op: '付费',
       ttl: 5
    }).then(function(){
        //发送成功
        response.success("Success Send.");
    }, function(err){
        //发送失败
        response.success("Error Send.");
    });
});


AV.Cloud.define("updateUserInfo", function(req, res){
  // Create the object.
  var query = new AV.Query(AV.User);
  query.equalTo("username", "cuice");  // find all the women
  query.first({
  success: function(user){
    // Do stuff
    user.set("username", "Cuice2")
    user.save().then(function(){
      res.success("Success Update.");
    }, function(err){
      res.success("Error Update.");
    });
  },
  error: function(err){
    res.success("Error Find.");
  }
});
});

AV.Cloud.define("handleRelation", function(request, response){
  var userId = request.params.userId;
  var commentId = request.params.commentId;
  var query = new AV.Query(AV.User); 
  /*query.get(id, {
    success: function(user){
      response.success(user.get("content"));
    },
    error: function(object, err){
      response.error("Doesn't exist this id...")
    }
  });*/
  query.get(userId).then(function(user){
    var Comments = AV.Object.extend("Comment");
    var query1 = new AV.Query(Comments);
    query1.get(commentId, {
      success: function(comment){
        var relation = user.relation("posts");
        relation.add(comment);
        user.save().then(function(){
          response.success("created relation");
        },
        function(err){
          response.error(err);
        });
        //response.success(user1.get("username") + " likes " + comment.get("content"));
      },
      error: function(object, err){
        response.error("Doesn't exist this content...");
      }
    });
  },
  function(err){
    response.error("Doesn't exist this user...");
  });
});


AV.Cloud.define("relationQuery", function(request, response){
  var userId = request.params.userId;
  var query = new AV.Query(AV.User); 
  query.get(userId).then(function(user){
    var relation = user.relation('posts');
    relation.query().find().then(function(postList){
      response.success(postList);
    },
    function(err){
      response.error(err);
    });
  },
  function(err){
    response.error("Doesn't exist this user...");
  });
});

AV.Cloud.define("relationReverseQuery", function(request, response){
  var commentId = request.params.commentId;
  var Comments = AV.Object.extend("Comment");
  var query = new AV.Query(Comments);
  query.get(commentId).then(function(comment){
    console.log(comment.get("content"));
    var query1 = AV.Relation.reverseQuery('_User', 'posts', comment);
    var userList = [];
    query1.find().then(function(users){
      _.each(users, function(user){
        userList.push(user.get("username"));
      });
      response.success(userList);
    },
    function(err){
      response.error(err);
    });
  },
  function(err){
    response.error("Doesn't exist this comment...");
  });
});



//REQUEST HANDLER
const Post = require("../models/post.model");

//RETURNS ALL POSTS FROM DATABASE
async function getPosts(req, res) {
    const posts = await Post.find();
    res.json(posts);
}
//CREATES POST FROM MODEL
async function createPost(req, res) {
    const { title, content, author } = req.body;
    const post = await Post.create({ title, content, author });
    res.json({ success: true, post });
}
//DELETES POST BY ID
async function deletePost(req, res) {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.json({ success: false, message: "Post not found" });
    res.json({ success: true, message: "Post deleted successfully" });
}
//EDIT POST
async function editPost(req,res){
    const post = await Post.findByIdAndUpdate(req.params.id,
        { title: req.body.title, content: req.body.content, author: req.body.author},
        {returnDocument: 'after'}
    );
    if (!post) return res.json({ success: false, message: "Post not found" });
    res.json({success:true, post});
}

module.exports = { getPosts, createPost, deletePost, editPost};
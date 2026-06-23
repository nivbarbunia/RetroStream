const Post = require("../models/postModel");

//RETURNS ALL POSTS FROM /MODELS
async function getPosts(req, res) {
    const posts = await Post.find();
    res.json(posts);
}
//CREATES POST FROM REQ BODY
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

module.exports = { getPosts, createPost, deletePost };
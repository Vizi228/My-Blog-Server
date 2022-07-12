import CommentModel from '../models/Comment.js';

export const getAll = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').exec();
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарии',
    });
  }
};


export const create = async (req,res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      postId: req.body.postId,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать комментарий',
    });
  }
}
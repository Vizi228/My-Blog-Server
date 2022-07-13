import CommentModel from '../models/Comment.js';

export const getAll = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').exec();
    const lastComments = comments.reverse().slice(0, 5)
    res.json(lastComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарии',
    });
  }
};

export const getPostsComments = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').exec();
    const postId = req.params.id;
    const currentComments = comments.filter(item => item.postId === postId);
    res.json(currentComments);
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

export const remove = async (req, res) => {
  try {
    const commentId = req.params.id;

    CommentModel.findOneAndDelete(
      {
        _id: commentId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось удалить статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const update = async (req, res) => {
  try {
    const commentId = req.params.id;

    await CommentModel.updateOne(
      {
        _id: commentId,
      },
      {
        text: req.body.text,
        postId: req.body.postId,
        user: req.userId,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

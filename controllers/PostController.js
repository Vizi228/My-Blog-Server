import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .reduce((current, next) => {
        if(current.includes(next)) return current
        return current.concat([next])
      } , [])
      .slice(0, 5);
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getPostsTags = async (req, res) => {
  try {
    let posts
    if(req.query.sort === 'popular') {
      posts = await PostModel.find().populate('user').sort([['viewsCount', -1]]).exec();
    } else {
      posts = await PostModel.find().populate('user').exec();
    }
    const tagsPosts = posts.filter(item => item.tags.includes(req.params.id));
    res.json(tagsPosts.slice(0,5))
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    let posts
    if(req.query.sort === 'popular') {
      posts = await PostModel.find().populate('user').sort([['viewsCount', -1]]).exec();
    } else {
      posts = await PostModel.find().populate('user').exec();
    }
    if(req.query.limit) {
      posts = posts.slice(0, req.query.limit);
    }
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не удалось вернуть статью',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await CommentModel.find().populate('user').exec();
    const filteredComments = comments.filter(item => item.postId === postId);

    filteredComments.forEach(item => {
      CommentModel.findOneAndDelete(
        {
          _id: item._id
        },
        (err, doc) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: 'Не удалось удалить комментарии',
            });
          }
  
          if (!doc) {
            return res.status(404).json({
              message: 'Комментарий не найдена',
            });
          }
        }
        )
    })

    PostModel.findOneAndDelete(
      {
        _id: postId,
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

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(',').map(item => item.trim()),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(',').map(item => item.trim()),
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

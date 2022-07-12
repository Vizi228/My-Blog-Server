import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import readimage from 'readimage';
dotenv.config({path: '.env'})
import { registerValidation, loginValidation, postCreateValidation, commentCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController, CommentController } from './controllers/index.js';
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  const file = fs.readFileSync(`${req.file.destination}/${req.file.filename}`);
  readimage(file, function (err, image) {
    if(err) {
      console.log(err)
    }
    if(image.width / image.height > 2) {
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    } else {
      res.status(500).json({
        message: 'Image size should be 2x1',
      });
    }
  })
});

app.post('/upload/profile', upload.single('image'), (req, res) => {
  const file = fs.readFileSync(`${req.file.destination}/${req.file.filename}`);
  readimage(file, function (err, image) {
    if(err) {
      console.log(err)
    }
    if(image.height / image.width >= 1 && image.height > 400 && image.width > 400) {
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    } else {
      res.status(500).json({
        message: 'Image size should be 2x1 and more than 400x400',
      });
    }
  })
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getPostsPopular);
app.get('/posts/tags/:id', PostController.getPostsTags);
app.get('/posts/popular/tags/:id', PostController.getPostsTagsPopular);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.get('/comments', CommentController.getAll);
app.post('/comments', checkAuth, commentCreateValidation, handleValidationErrors, CommentController.create);


app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
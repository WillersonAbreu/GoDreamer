"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _util = require('util');
var _path = require('path');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);

// Models
var _GroupPost = require('../models/GroupPost'); var _GroupPost2 = _interopRequireDefault(_GroupPost);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);

// Yup validator
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _ProfileImage = require('../models/ProfileImage'); var _ProfileImage2 = _interopRequireDefault(_ProfileImage);

class GroupPostController {
  async index(req, res) {
    const { groupId: group_id } = req.params;

    // const [, token] = req.headers.authorization.split(' ');
    // const decodedToken = await promisify(jwt.verify)(
    //   token,
    //   process.env.JWT_KEY
    // );
    // const user_id = decodedToken.id;

    try {
      const getPosts = await _GroupPost2.default.findAll({
        where: {
          group_id,
        },
        include: [
          {
            model: _User2.default,
            include: [
              {
                model: _ProfileImage2.default,
                attributes: {
                  exclude: [
                    'id',
                    'name',
                    'user_id',
                    'is_active',
                    'createdAt',
                    'updatedAt',
                  ],
                },
              },
            ],
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'is_active',
                'user_type',
                'birthdate',
                'password',
                'email',
              ],
            },
          },
        ],
        attributes: {
          exclude: ['UserId', 'GroupId', 'user_id', 'updatedAt'],
        },
        order: [['updated_at', 'DESC']],
      });

      return res.status(200).json({ posts: getPosts });
    } catch (error) {
      return res.status(400).json({ error: 'error to get the posts' });
    }
  }

  async store(req, res) {
    const { groupId: group_id } = req.params;

    if (!group_id)
      res.status(400).json({ error: 'É necessário fornecer o ID do grupo' });

    const PostSchema = Yup.object({
      user_id: Yup.number()
        .typeError('É necessário inserir um inteiro')
        .required('É necessário o ID do usuário'),
      str_post: Yup.string().typeError('Você deve inserir um texto'),
    });

    const [, token] = req.headers.authorization.split(' ');

    // Check if all data is correctly inserted
    try {
      const decodedToken = await _util.promisify.call(void 0, _jsonwebtoken2.default.verify)(
        token,
        process.env.JWT_KEY
      );

      const files = req.files;
      const user_id = decodedToken.id;
      const str_post = req.body.str_post;

      await PostSchema.validate({ user_id, str_post });

      var url_image = null;
      var url_video = null;

      files.map((file) => {
        if (file.fieldname === 'url_image') {
          url_image = file.filename;
        }

        if (file.fieldname === 'url_video') {
          url_video = file.filename;
        }
      });

      await _GroupPost2.default.create({
        group_id,
        user_id,
        str_post,
        url_image,
        url_video,
      });

      return res.status(200).json({ message: 'Post registered successfully' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.errors });
    }
  }

  async update(req, res) {
    const { postId: post_id } = req.params;

    const PostSchema = Yup.object({
      post_id: Yup.number()
        .typeError('É necessário inserir um inteiro')
        .required('É necessário o ID do post'),
      user_id: Yup.number()
        .typeError('É necessário inserir um inteiro')
        .required('É necessário o ID do usuário'),
      str_post: Yup.string().typeError('Você deve inserir um texto'),
    });

    const [, token] = req.headers.authorization.split(' ');
    const decodedToken = await _util.promisify.call(void 0, _jsonwebtoken2.default.verify)(
      token,
      process.env.JWT_KEY
    );

    const files = req.files;
    const user_id = decodedToken.id;
    const str_post = req.body.str_post;

    try {
      await PostSchema.validate({ post_id, user_id, str_post });
      const getPost = await _GroupPost2.default.findByPk(post_id);

      if (!getPost) return res.status(404).json({ error: 'Post not found' });

      if (files.length <= 0) {
        await getPost.update({ user_id, str_post });
      } else {
        var url_image = null;
        var url_video = null;

        files.map((file) => {
          if (file.fieldname === 'url_image') {
            url_image = file.filename;
          }

          if (file.fieldname === 'url_video') {
            url_video = file.filename;
          }
        });

        // Delete the current files
        if (url_image !== null && getPost.url_image) {
          const imageDestination = _path.resolve.call(void 0, 
            __dirname,
            '..',
            '..',
            '..',
            'temp',
            'post_images',
            getPost.url_image
          );

          _fs2.default.unlinkSync(imageDestination);
        }

        if (url_video !== null && getPost.url_video) {
          const videoDestination = _path.resolve.call(void 0, 
            __dirname,
            '..',
            '..',
            '..',
            'temp',
            'post_images',
            getPost.url_video
          );
          _fs2.default.unlinkSync(videoDestination);
        }

        const data = {
          user_id: user_id,
          str_post: str_post ? str_post : getPost.str_post,
          url_image: url_image !== null ? url_image : getPost.url_image,
          url_video: url_video !== null ? url_video : getPost.url_video,
        };

        await getPost.update(data);
      }

      return res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { postId: post_id } = req.params;
      const getPost = await _GroupPost2.default.findByPk(post_id);

      // Delete the current files
      if (getPost.url_video) {
        const videoDestination = _path.resolve.call(void 0, 
          __dirname,
          '..',
          '..',
          '..',
          'temp',
          'post_images',
          getPost.url_video
        );

        _fs2.default.unlinkSync(videoDestination);
      }

      if (getPost.url_image) {
        const imageDestination = _path.resolve.call(void 0, 
          __dirname,
          '..',
          '..',
          '..',
          'temp',
          'post_images',
          getPost.url_image
        );

        _fs2.default.unlinkSync(imageDestination);
      }

      getPost.destroy();

      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      return res.status(400).json({ error: 'Error to update the post' });
    }
  }
}

exports. default = new GroupPostController();
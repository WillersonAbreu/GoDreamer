"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _ProfileImage = require('../models/ProfileImage'); var _ProfileImage2 = _interopRequireDefault(_ProfileImage);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);

class UploadProfileImageController {
  async index(req, res) {
    try {
      const { userId } = req.params;

      const profileImage = await _ProfileImage2.default.findByPk(userId);

      return res.status(200).json(profileImage);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async store(req, res) {
    const { userId } = req.params;

    // try {
    //   return res.status(200).json({ profileImage });
    // } catch (error) {
    //   return res.status(400).json({ error: error.message });
    // }

    if (!req.file)
      return res.status(400).json({
        error: 'É necessário inserir de um arquivo para realizar o upload',
      });

    const { originalname: name, filename: image_source } = req.file;

    try {
      const profileImage = await _ProfileImage2.default.findByPk(userId);

      if (profileImage === null) {
        await _ProfileImage2.default.create({
          id: userId,
          name,
          image_source,
        });

        return res
          .status(200)
          .json({ message: 'Imagem de perfil registrada com sucesso' });
      } else {
        await profileImage.update({
          id: userId,
          name,
          image_source,
        });
        return res
          .status(200)
          .json({ message: 'Imagem de perfil atualizada com sucesso' });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }

  async delete(req, res) {
    const { userId } = req.body;
    try {
      const user = await _User2.default.findByPk(userId, {
        attributes: {
          exclude: [
            'password',
            'is_active',
            'createdAt',
            'updatedAt',
            'profile_image_id',
          ],
        },
        include: [
          {
            model: _ProfileImage2.default,
            attributes: {
              exclude: ['user_id', 'is_active', 'createdAt', 'updatedAt'],
            },
          },
        ],
      });

      if (!user)
        return res.status(401).json({
          error: `The user isn't registered in database`,
        });

      const profileImage = await _ProfileImage2.default.findByPk(user.ProfileImage.id);

      if (!profileImage)
        return res.status(400).json({
          error: `The image don't exists or has already deleted from our database`,
        });

      await profileImage.update({ is_active: false });

      return res
        .status(200)
        .json({ message: 'The profile image was deleted successfully' });
    } catch (error) {
      return res.status(400).error({ error: error.message });
    }
  }
}

exports. default = new UploadProfileImageController();

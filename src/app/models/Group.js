import Sequelize, { Model } from 'sequelize';

class Group extends Model {
  static init(sequelize) {
    super.init(
      {
        group_name: Sequelize.STRING,
        group_desc: Sequelize.STRING,
        group_image: Sequelize.STRING,
        user_id: Sequelize.INTEGER
      },
      {
        sequelize
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.hasMany(models.FollowGroup, { foreignKey: 'group_id' } );
  }
}

export default Group;

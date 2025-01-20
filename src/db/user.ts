// user.ts
import { Sequelize, DataTypes, Model } from 'sequelize'
import bcrypt from 'bcrypt'

export default (sequelize: Sequelize, dataTypes = DataTypes) => {
    class User extends Model {
    }

    User.init(
        {
            name: {
                type: dataTypes.STRING,
                allowNull: false,
            },
            surname: {
                type: dataTypes.STRING,
            },
            nickName: {
                type: dataTypes.STRING,
                unique: true,
            },
            email: {
                type: dataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            age: {
                type: dataTypes.INTEGER,
            },
            role: {
                type: dataTypes.ENUM('ADMIN', 'USER'),
                defaultValue: 'USER',
            },
            password: {
                type: dataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'users',
            modelName: 'User',
        }
    )

    // pred vytvorenim usera heslo zahashujeme
    User.beforeCreate(async (user: any) => {
        const hash = await bcrypt.hash(user.password, 10)
        user.password = hash
    })

    return User
}

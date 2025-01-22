import { Sequelize, DataTypes, Model } from 'sequelize';
import { ExerciseModel } from './exercise';
import UserInit from './user';

type User = ReturnType<typeof UserInit>;

interface CompletedExerciseAttributes {
    id: number;
    completedAt: Date;
    duration: number;
    userId: number;
    exerciseId: number;
}

export class CompletedExerciseModel extends Model<CompletedExerciseAttributes> {
    declare id: number;
    declare completedAt: Date;
    declare duration: number;
    declare userId: number;
    declare exerciseId: number;

    declare user?: User;
    declare exercise?: ExerciseModel;

    static associate(models: any) {
        CompletedExerciseModel.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false
            },
            as: 'user',
        });

        CompletedExerciseModel.belongsTo(models.Exercise, {
            foreignKey: {
                name: 'exerciseId',
                allowNull: false
            },
            as: 'exercise',
        });
    }
}

// export a inicializacia modelu
export default (sequelize: Sequelize) => {
    CompletedExerciseModel.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            exerciseId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'exercises',
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            tableName: 'completed_exercises',
            modelName: 'CompletedExercise',
            timestamps: false,
        }
    );

    return CompletedExerciseModel;
};

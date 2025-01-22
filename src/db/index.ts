import path from 'path'
import fs from 'fs'
import { Sequelize } from 'sequelize'
import defineExercise from './exercise'
import defineProgram from './program'
import defineUser from './user'
import defineCompletedExercise from './completedExercise'

const sequelize: Sequelize = new Sequelize('postgresql://postgres:heslo@localhost:5432/fitness_app', {
	logging: false
})

sequelize.authenticate().catch((e: any) => console.error(`Unable to connect to the database${e}.`))

// inicializacia modelov
const modelsBuilder = (instance: Sequelize) => {
	const Exercise = defineExercise(instance);
	const Program = defineProgram(instance);
	const User = defineUser(instance);
	const CompletedExercise = defineCompletedExercise(instance);

	return {
		Exercise,
		Program,
		User,
		CompletedExercise
	};
};

const models = modelsBuilder(sequelize);

const modelsFiles = fs.readdirSync(__dirname)
if (Object.keys(models).length !== (modelsFiles.length - 1)) {
	throw new Error('You probably forgot import database model!')
}

Object.values(models).forEach((model: any) => {
	if (model.associate) {
		model.associate(models)
	}
})

export { models, modelsBuilder, sequelize }
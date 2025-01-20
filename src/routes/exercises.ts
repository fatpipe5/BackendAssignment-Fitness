import { Router, Request, Response, NextFunction } from 'express'
import passport from '../config/passportConfig'  // import the configured passport
import { models } from '../db'
import { isAdmin } from '../middleware/roleCheck';

const router: Router = Router()

const {
	Exercise,
	Program
} = models

export default () => {
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const exercises = await Exercise.findAll({
			include: [{
				model: Program,
				as: 'program'
			}]
		})

		return res.json({
			data: exercises,
			message: 'List of exercises'
		})
	})

	// CREATE /exercises - ADMIN only
	router.post(
		'/',
		passport.authenticate('jwt', { session: false }),
		isAdmin, // <-- block unless role === 'ADMIN'
		async (req: Request, res: Response) => {
			try {
				const { name, difficulty, programID } = req.body;
				const newExercise = await Exercise.create({ name, difficulty, programID });
				return res.status(201).json({ data: newExercise, message: 'Exercise created' });
			} catch (error) {
				console.error('Error creating exercise:', error);
				return res.status(500).json({ message: 'Server error' });
			}
		}
	);

	// UPDATE /exercises/:id - ADMIN only
	router.put(
		'/:id',
		passport.authenticate('jwt', { session: false }),
		isAdmin,
		async (req: Request, res: Response) => {
			try {
				const { id } = req.params;
				const { name, difficulty, programID } = req.body;
				const exercise = await Exercise.findByPk(id);
				if (!exercise) {
					return res.status(404).json({ message: 'Exercise not found' });
				}
				await exercise.update({ name, difficulty, programID });
				return res.json({ data: exercise, message: 'Exercise updated' });
			} catch (error) {
				console.error('Error updating exercise:', error);
				return res.status(500).json({ message: 'Server error' });
			}
		}
	);

	// DELETE /exercises/:id - ADMIN only
	router.delete(
		'/:id',
		passport.authenticate('jwt', { session: false }),
		isAdmin,
		async (req: Request, res: Response) => {
			try {
				const { id } = req.params;
				const exercise = await Exercise.findByPk(id);
				if (!exercise) {
					return res.status(404).json({ message: 'Exercise not found' });
				}
				await exercise.destroy();
				return res.json({ message: 'Exercise deleted' });
			} catch (error) {
				console.error('Error deleting exercise:', error);
				return res.status(500).json({ message: 'Server error' });
			}
		}
	);

	return router
}

import {
	Router,
	Request,
	Response,
	NextFunction
} from 'express'
import passport from '../config/passportConfig'
import { isAdmin } from '../middleware/roleCheck'
import { models } from '../db'

const router: Router = Router()

const {
	Program,
	Exercise
} = models

export default () => {
	// 1) GET all programs (any user can see? or admin only? up to you)
	router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
		const programs = await Program.findAll()
		return res.json({
			data: programs,
			message: 'List of programs'
		})
	})

	// 2) ADD an exercise to a program (ADMIN only)
	// e.g. POST /programs/:programId/exercises/:exerciseId
	router.post(
		'/:programId/exercises/:exerciseId',
		passport.authenticate('jwt', { session: false }),
		isAdmin,
		async (req: Request, res: Response, _next: NextFunction) => {
			try {
				const { programId, exerciseId } = req.params

				// Check if program exists
				const program = await Program.findByPk(programId)
				if (!program) {
					return res.status(404).json({ message: 'Program not found' })
				}

				// Check if exercise exists
				const exercise = await Exercise.findByPk(exerciseId)
				if (!exercise) {
					return res.status(404).json({ message: 'Exercise not found' })
				}

				// Update the exercise's programID to this program's ID
				await exercise.update({ programID: program.id })
				return res.json({
					data: exercise,
					message: `Exercise ${exerciseId} added to Program ${programId}`
				})
			} catch (error) {
				console.error(error)
				return res.status(500).json({ message: 'Server error' })
			}
		}
	)

	// 3) REMOVE an exercise from a program (ADMIN only)
	// e.g. DELETE /programs/:programId/exercises/:exerciseId
	router.delete(
		'/:programId/exercises/:exerciseId',
		passport.authenticate('jwt', { session: false }),
		isAdmin,
		async (req: Request, res: Response, _next: NextFunction) => {
			try {
				const { programId, exerciseId } = req.params

				// Check if program exists
				const program = await Program.findByPk(programId)
				if (!program) {
					return res.status(404).json({ message: 'Program not found' })
				}

				// Check if exercise belongs to that program
				const exercise = await Exercise.findOne({
					where: {
						id: exerciseId,
						programID: programId,
					}
				})
				if (!exercise) {
					return res.status(404).json({ message: 'Exercise not found in this program' })
				}

				// We remove the exercise from the program by setting programID = null
				// or you might delete the exercise entirely, but typically you'd just "un-assign" it
				await exercise.update({ programID: null })

				return res.json({
					data: exercise,
					message: `Exercise ${exerciseId} removed from Program ${programId}`
				})
			} catch (error) {
				console.error(error)
				return res.status(500).json({ message: 'Server error' })
			}
		}
	)

	return router
}

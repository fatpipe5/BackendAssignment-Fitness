import { Router, Request, Response, NextFunction } from 'express'
import passport from '../config/passportConfig'  // import the configured passport
import { models } from '../db'

const router: Router = Router()

const {
	Exercise,
	Program
} = models

export default () => {
	router.get('/', passport.authenticate('jwt', { session: false }), async (_req: Request, res: Response, _next: NextFunction) => {
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

	return router
}

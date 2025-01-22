import { Router, Request, Response } from 'express';
import passport from '../config/passportConfig';
import { models } from '../db';
import { isAdmin } from '../middleware/roleCheck';
import { CompletedExerciseModel } from "../db/completedExercise";
import { ExerciseModel } from "../db/exercise";

const router: Router = Router();
const { User, Exercise, CompletedExercise } = models;

export default () => {
    // GET /users
    router.get(
        '/',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response) => {
            try {
                const role = (req.user as any).role;
                const users = await User.findAll();

                if (role === 'ADMIN') {
                    return res.json({ data: users });
                }

                const minimalData = users.map((u: any) => ({
                    id: u.id,
                    nickName: u.nickName
                }));

                return res.json({ data: minimalData });
            } catch (error) {
                console.error('Error getting users:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    // GET /users/:id - iba ADMIN
    router.get(
        '/:id',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const currentUserId = (req.user as any).id || (req.user as any).userId;
                const role = (req.user as any).role;

                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                if (role === 'ADMIN') {
                    return res.json({ data: user });
                }

                if (parseInt(id) !== parseInt(currentUserId)) {
                    return res.status(403).json({ message: 'Forbidden - you cannot view other user profiles' });
                }

                const userProfile = {
                    name: user.name,
                    surname: user.surname,
                    nickName: user.nickName,
                    age: user.age
                };
                return res.json({ data: userProfile });

            } catch (error) {
                console.error('Error getting user details:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    //PATCH /users/:id - iba ADMIN
    router.patch(
        '/:id',
        passport.authenticate('jwt', { session: false }),
        isAdmin,
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const { name, surname, nickName, age, role } = req.body;
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }

                await user.update({ name, surname, nickName, age, role });

                return res.json({ data: user, message: 'User updated successfully' });
            } catch (error) {
                console.error('Error updating user:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    router.post(
        '/profile/exercises',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response) => {
            try {
                const userId = (req.user as any).id;
                const { exerciseId, duration } = req.body;
                const completedAt = req.body.completedAt || new Date();

                if (!exerciseId || !duration) {
                    return res.status(400).json({ message: 'exerciseId and duration are required.' });
                }

                const exercise = await Exercise.findByPk(exerciseId);
                if (!exercise) {
                    return res.status(404).json({ message: 'Exercise not found' });
                }

                const record = await CompletedExercise.create({
                    userId,
                    exerciseId,
                    duration,
                    completedAt,
                });

                return res.status(201).json({ data: record, message: 'Tracked exercise successfully.' });
            } catch (error) {
                console.error('Error tracking exercise:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    router.get(
        '/profile/exercises',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response) => {
            try {
                const userId = (req.user as any).id;
                const records = await CompletedExercise.findAll({
                    where: { userId },
                    include: [{ model: Exercise, as: 'exercise' }],
                });

                return res.json({ data: records });
            } catch (error) {
                console.error('Error fetching completed exercises:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    router.delete(
        '/profile/exercises/:recordId',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response) => {
            try {
                const userId = (req.user as any).id;
                const { recordId } = req.params;

                const record = await CompletedExercise.findByPk(recordId);
                if (!record) {
                    return res.status(404).json({ message: 'Record not found' });
                }

                if (Number(record.userId) !== Number(userId)) {
                    return res.status(403).json({ message: "Cannot delete someone else's record" });
                    }

                    await record.destroy();
                    return res.json({ message: 'Tracked exercise removed', data: record });
                } catch (error) {
                    console.error('Error removing tracked exercise:', error);
                    return res.status(500).json({ message: 'Server error' });
                }
            }
        );

            return router;
        };
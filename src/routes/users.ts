// routes/users.ts
import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passportConfig';
import { models } from '../db';
import { isAdmin } from '../middleware/roleCheck';

const router: Router = Router();
const { User } = models;

export default () => {

    // GET /users - ADMIN only => list all users
    router.get(
        '/',
        passport.authenticate('jwt', { session: false }),
        isAdmin,
        async (_req: Request, res: Response) => {
            try {
                const users = await User.findAll();
                return res.json({ data: users });
            } catch (error) {
                console.error('Error getting users:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    // GET /users/:id - ADMIN only => get user detail
    router.get(
        '/:id',
        passport.authenticate('jwt', { session: false }),
        isAdmin,
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return res.json({ data: user });
            } catch (error) {
                console.error('Error getting user details:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    // PUT or PATCH /users/:id - ADMIN only => update any user fields
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

                // Update the user fields
                await user.update({ name, surname, nickName, age, role });

                // If you need to handle password changes, do that carefully (hashing again).
                // If there's a 'password' in req.body, you'd handle it similarly.

                return res.json({ data: user, message: 'User updated successfully' });
            } catch (error) {
                console.error('Error updating user:', error);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    return router;
};

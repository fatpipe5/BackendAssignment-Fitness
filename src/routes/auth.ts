import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { models } from '../db'
import { check, validationResult } from 'express-validator';

const router: Router = Router()
const { User } = models

// 2.1 REGISTER
router.post('/register', [
    // validacie
    check('email')
        .isEmail()
        .withMessage('Invalid email format'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 chars long'),
    check('role')
        .optional()
        .isIn(['ADMIN', 'USER'])
        .withMessage('Role must be either ADMIN or USER'),

    ], async (req: Request, res: Response, _next: NextFunction) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ak nie su ziadna validacne chyby, pokracujeme dalej s vytvorenim usera
    try {
        const { name, surname, nickName, email, password, role } = req.body


        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' })
        }

        // kontrola ci pouzivatel uz existuje
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: 'User with that email already exists.' })
        }

        // vytvorenie pouzivatela
        // heslo sa hashuje v beforeCreate hooku if v user.ts
        const newUser = await User.create({
            name,
            surname,
            nickName,
            email,
            password,
            role
        })

        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        console.error('Error in register route:', error)
        return res.status(500).json({ message: 'Server error' })
    }
})


router.post('/login', async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' })
        }

        // najdenie usera
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        // porovnanie hesiel, porovnavame vstup od usera s ulozenym hashom
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        // ak bolo prihlasenie uspesne, vytvorime JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            message: 'Login successful',
            token
        })
    } catch (error) {
        console.error('Error in login route:', error)
        return res.status(500).json({ message: 'Server error' })
    }
})

export default router

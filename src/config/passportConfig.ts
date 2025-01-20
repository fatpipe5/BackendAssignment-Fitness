import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { models } from '../db'
import dotenv from 'dotenv';
dotenv.config();
const { User } = models

// nacitanie JWT secret z .env suboru
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

const jwtStrategy = new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        const user = await User.findByPk(jwtPayload.userId)
        console.log('JWT payload:', jwtPayload)
        console.log('Finding user with ID:', jwtPayload.userId)
        if (user) {
            // user sa nasiel
            return done(null, user)
        } else {
            // user sa nenasiel
            return done(null, false)
        }

    } catch (error) {
        console.error('Error in JWT Strategy:', error)
        return done(error, false)
    }


})


passport.use(jwtStrategy)

export default passport

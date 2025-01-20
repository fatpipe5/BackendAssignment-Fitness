import { Request, Response, NextFunction } from 'express';

// If you have a custom type for req.user, you can use that.
// For now, we assume req.user.role is available after JWT auth.
export function isAdmin(req: Request, res: Response, next: NextFunction) {
    // We expect passport-jwt to have set req.user
    if (req.user && (req.user as any).role === 'ADMIN') {
        return next(); // proceed to the route handler
    }

    // If not admin, return 403
    return res.status(403).json({ message: 'Forbidden - Admins only' });
}

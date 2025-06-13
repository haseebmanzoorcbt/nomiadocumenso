import type { User } from '@prisma/client';

export const isAdmin = (user: Pick<User, 'email'>) => user.email === 'abuzarmohammad945@gmail.com';

import { z } from 'zod';

export const userLoginSchema = z.object({
	email: z.string().email('Please provide valid email address').trim(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
		.regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
		.regex(/\d/, 'Password must contain at least 1 number')
		.regex(/[@$!%*?&.]/, 'Password must contain at least 1 special character')
});

export type UserLoginSchema = typeof userLoginSchema;
export type UserLoginSchemaPayload = z.infer<typeof userLoginSchema>;

export const userRegisterSchema = z
	.object({
		email: z.string().email('Please provide valid email address').trim(),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
			.regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
			.regex(/\d/, 'Password must contain at least 1 number')
			.regex(/[@$!%*?&.]/, 'Password must contain at least 1 special character'),
		username: z.string().min(3, 'Username must be at least 3 characters').trim(),
		birthday: z.string().min(1, 'Please provide your birthday'),
		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export type UserRegisterSchema = typeof userRegisterSchema;
export type UserRegisterSchemaPayload = Omit<z.infer<typeof userRegisterSchema>, 'confirmPassword'>;

export const verificationCodeSchema = z.object({
	code: z.string().min(1, 'Please provide verification code'),
	email: z.string().email('Please provide valid email address').trim()
});

export const forgotPasswordSchema = z.object({
	email: z.string().email('Please provide valid email address').trim()
});

export const newPasswordSchema = z
	.object({
		email: z.string().email('Please provide valid email address').trim(),
		confirmationCode: z.string().min(1, 'Please provide confirmation code'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
			.regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
			.regex(/\d/, 'Password must contain at least 1 number')
			.regex(/[@$!%*?&.]/, 'Password must contain at least 1 special character'),

		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match"
	});

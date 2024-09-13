// it is only showen on 422 errors
// path z.b -> email
// error z.b -> invalid error
type ValidationError = {
	path: string;
	error: string;
};

export type ServerErrorResponse = {
	statusCode: number;
	message: string;
	errors: ValidationError[] | null;
};

export type VemeetError = {
	message: string;
	statusCode: number;
};

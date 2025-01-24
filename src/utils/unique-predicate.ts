export const uniquePredicate = <T>(item: T, index: number, array: T[]): boolean =>
	array.indexOf(item) === index;

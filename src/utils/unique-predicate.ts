export const uniquePredicate = <T>(item: T, index: number, array: T[]) =>
	array.indexOf(item) === index;

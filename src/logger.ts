import pino from "pino";
import { env } from "./env";

export const logger = pino({
	transport:
		env.NODE_ENV === "development"
			? { target: "pino-pretty", options: { colorize: true } }
			: undefined,
	customLevels: {
		debug: 20,
		info: 30,
		warn: 40,
		error: 50,
	},
	useOnlyCustomLevels: true,
	formatters: {
		level(label) {
			return { level: label };
		},
	},
});

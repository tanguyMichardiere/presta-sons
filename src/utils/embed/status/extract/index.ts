import type { APIEmbedField, Snowflake } from "@discordjs/core";
import type { Status } from "..";
import { snowflakeFromTag } from "../../tag";

/** @returns `Record<groupName, Record<userSnowflake, status>>` */
export const extractStatus = (fields: APIEmbedField[]): Record<string, Record<Snowflake, Status>> =>
	Object.fromEntries(
		fields
			.filter(({ value, inline }) => inline === true && value.length > 0)
			.map((field) => [
				field.name,
				Object.fromEntries(
					field.value.split("\n").map((line) => {
						const [status, tag] = line.split(" ") as [Status, string];
						return [snowflakeFromTag(tag), status];
					}),
				),
			]),
	);

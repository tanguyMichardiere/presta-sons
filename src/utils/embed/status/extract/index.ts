import type { APIEmbedField } from "@discordjs/core";
import type { Status } from "..";
import { idFromTag } from "../../tag";

/** @returns `Record<groupName, Record<memberId, Status>>` */
export const extractStatus = (fields: APIEmbedField[]): Record<string, Record<string, Status>> =>
	Object.fromEntries(
		fields
			.filter(({ value, inline }) => inline === true && value.length > 0)
			.map((field) => [
				field.name,
				Object.fromEntries(
					field.value.split("\n").map((line) => {
						const [status, tag] = line.split(" ") as [Status, string];
						return [idFromTag(tag), status];
					}),
				),
			]),
	);

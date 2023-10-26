import type { APIEmbedField } from "@discordjs/core";
import type { Status } from "..";
import { idFromTag } from "../../tag";

/** @returns `Record<groupName, Record<memberId, Status>>` */
export const extractStatus = (
  fields: Array<APIEmbedField>,
): Record<string, Record<string, Status>> =>
  Object.fromEntries(
    fields
      .filter(({ value, inline }) => inline === true && value.length > 0)
      .map((field) => [
        field.name,
        Object.fromEntries(
          field.value.split("\n").map(function (line) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const [status, tag] = line.split(" ") as [Status, string];
            const id = idFromTag(tag);
            return [id, status];
          }),
        ),
      ]),
  );

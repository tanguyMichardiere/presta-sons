import type { APIActionRowComponent, APIMessageActionRowComponent } from "@discordjs/core";
import { ButtonStyle, ComponentType, GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import env from "../../env";
import { embedFromMembers } from "../../utils/embed";
import { getMembersFromRoles } from "../../utils/embed/members";
import { Status } from "../../utils/embed/status";
import { exponentialBackoff } from "../../utils/exponentialBackoff";

const components = [
  {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.Ok },
        custom_id: Status.Ok,
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.Perhaps },
        custom_id: Status.Perhaps,
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.No },
        custom_id: Status.No,
      },
    ],
  },
] satisfies Array<APIActionRowComponent<APIMessageActionRowComponent>>;

export const handleThreadCreate = createEventHandler(
  GatewayDispatchEvents.ThreadCreate,
  async function ({ data, api }) {
    if (data.parent_id === env.FORUM_ID && data.newly_created === true) {
      const body = { embeds: [embedFromMembers(await getMembersFromRoles(api))], components };
      await exponentialBackoff(() => api.channels.createMessage(data.id, body));
    }
  },
);

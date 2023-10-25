import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import {
  Data as MentionPendingCommandData,
  handleMentionPendingCommand,
} from "../../interactions/commands/mentionPending";
import {
  Data as StatusButtonComponentInteractionData,
  handleStatusButtonComponentInteraction,
} from "../../interactions/components/statusButton";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }) {
    const statusButtonInteractionData = StatusButtonComponentInteractionData.safeParse(data);
    if (statusButtonInteractionData.success) {
      return handleStatusButtonComponentInteraction(api, statusButtonInteractionData.data);
    }

    const mentionPendingCommandData = MentionPendingCommandData.safeParse(data);
    if (mentionPendingCommandData.success) {
      return handleMentionPendingCommand(api, mentionPendingCommandData.data);
    }
  },
);

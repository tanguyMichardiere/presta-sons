import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import {
  Data as CreateSurveyCommandData,
  handleCreateSurveyCommand,
} from "../../interactions/commands/createSurvey";
import {
  Data as SurveyComponentInteractionData,
  handleSurveyComponentInteraction,
} from "../../interactions/components/survey";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }) {
    const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
    if (createSurveyCommandData.success) {
      return handleCreateSurveyCommand(api, createSurveyCommandData.data);
    }

    const statusButtonInteractionData = SurveyComponentInteractionData.safeParse(data);
    if (statusButtonInteractionData.success) {
      return handleSurveyComponentInteraction(api, statusButtonInteractionData.data);
    }
  },
);

import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import {
  Data as CreateSurveyCommandData,
  handleCreateSurveyCommand,
} from "../../interactions/commands/createSurvey";
import {
  Data as SurveyButtonComponentInteractionData,
  handleSurveyButtonComponentInteraction,
} from "../../interactions/components/surveyButton";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }) {
    const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
    if (createSurveyCommandData.success) {
      return handleCreateSurveyCommand(api, createSurveyCommandData.data);
    }

    const statusButtonInteractionData = SurveyButtonComponentInteractionData.safeParse(data);
    if (statusButtonInteractionData.success) {
      return handleSurveyButtonComponentInteraction(api, statusButtonInteractionData.data);
    }
  },
);

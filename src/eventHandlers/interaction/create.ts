import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { handleCreateSurveyCommand } from "../../interactions/commands/createSurvey";
import { CreateSurveyCommandData } from "../../interactions/commands/createSurvey/data";
import { handleTagPendingCommand } from "../../interactions/commands/tagPending";
import { TagPendingCommandData } from "../../interactions/commands/tagPending/data";
import { handleSurveyComponentInteraction } from "../../interactions/components/surveyButton";
import { SurveyButtonComponentInteractionData } from "../../interactions/components/surveyButton/data";
import { handleTagPendingComponentInteraction } from "../../interactions/components/tagPending";
import { TagPendingComponentInteractionData } from "../../interactions/components/tagPending/data";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }) {
    const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
    if (createSurveyCommandData.success) {
      return handleCreateSurveyCommand(api, createSurveyCommandData.data);
    }

    const surveyButtonComponentInteractionData =
      SurveyButtonComponentInteractionData.safeParse(data);
    if (surveyButtonComponentInteractionData.success) {
      return handleSurveyComponentInteraction(api, surveyButtonComponentInteractionData.data);
    }

    const tagPendingCommandData = TagPendingCommandData.safeParse(data);
    if (tagPendingCommandData.success) {
      return handleTagPendingCommand(api, tagPendingCommandData.data);
    }

    const tagPendingComponentInteractionData = TagPendingComponentInteractionData.safeParse(data);
    if (tagPendingComponentInteractionData.success) {
      return handleTagPendingComponentInteraction(api, tagPendingComponentInteractionData.data);
    }
  },
);

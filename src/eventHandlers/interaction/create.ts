import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import {
  Data as CreateSurveyCommandData,
  handleCreateSurveyCommand,
} from "../../interactions/commands/createSurvey";
import {
  Data as TagPendingCommandData,
  handleTagPendingCommand,
} from "../../interactions/commands/tagPending";
import {
  Data as SurveyComponentInteractionData,
  handleSurveyComponentInteraction,
} from "../../interactions/components/surveyButton";
import {
  Data as TagPendingComponentInteractionData,
  handleTagPendingComponentInteraction,
} from "../../interactions/components/tagPending";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }) {
    const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
    if (createSurveyCommandData.success) {
      return handleCreateSurveyCommand(api, createSurveyCommandData.data);
    }

    const surveyComponentInteractionData = SurveyComponentInteractionData.safeParse(data);
    if (surveyComponentInteractionData.success) {
      return handleSurveyComponentInteraction(api, surveyComponentInteractionData.data);
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

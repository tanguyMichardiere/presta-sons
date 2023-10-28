import { GatewayDispatchEvents, MessageFlags } from "@discordjs/core";
import { createEventHandler } from "..";
import { handleCreateSurveyCommand } from "../../interactions/commands/createSurvey";
import { CreateSurveyCommandData } from "../../interactions/commands/createSurvey/data";
import { handleEditSurveyCommand } from "../../interactions/commands/editSurvey.ts";
import { EditSurveyCommandData } from "../../interactions/commands/editSurvey.ts/data";
import { handleTagPendingCommand } from "../../interactions/commands/tagPending";
import { TagPendingCommandData } from "../../interactions/commands/tagPending/data";
import { handleEditSurveyComponentInteraction } from "../../interactions/components/editSurvey";
import { EditSurveyComponentInteractionData } from "../../interactions/components/editSurvey/data";
import { handleSurveyComponentInteraction } from "../../interactions/components/surveyButton";
import { SurveyButtonComponentInteractionData } from "../../interactions/components/surveyButton/data";
import { handleTagPendingComponentInteraction } from "../../interactions/components/tagPending";
import { TagPendingComponentInteractionData } from "../../interactions/components/tagPending/data";
import { InteractionError } from "../../interactions/error";

export const handleInteractionCreate = createEventHandler(
  GatewayDispatchEvents.InteractionCreate,
  async function ({ data, api }, logger) {
    try {
      const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
      if (createSurveyCommandData.success) {
        await handleCreateSurveyCommand(api, createSurveyCommandData.data);
        return;
      }

      const editSurveyCommandData = EditSurveyCommandData.safeParse(data);
      if (editSurveyCommandData.success) {
        await handleEditSurveyCommand(api, editSurveyCommandData.data);
        return;
      }

      const editInformationsComponentInteractionData =
        EditSurveyComponentInteractionData.safeParse(data);
      if (editInformationsComponentInteractionData.success) {
        await handleEditSurveyComponentInteraction(
          api,
          editInformationsComponentInteractionData.data,
        );
        return;
      }

      const surveyButtonComponentInteractionData =
        SurveyButtonComponentInteractionData.safeParse(data);
      if (surveyButtonComponentInteractionData.success) {
        await handleSurveyComponentInteraction(api, surveyButtonComponentInteractionData.data);
        return;
      }

      const tagPendingCommandData = TagPendingCommandData.safeParse(data);
      if (tagPendingCommandData.success) {
        await handleTagPendingCommand(api, tagPendingCommandData.data);
        return;
      }

      const tagPendingComponentInteractionData = TagPendingComponentInteractionData.safeParse(data);
      if (tagPendingComponentInteractionData.success) {
        await handleTagPendingComponentInteraction(api, tagPendingComponentInteractionData.data);
        return;
      }

      logger.warn("unknown interaction");
    } catch (error) {
      if (error instanceof InteractionError) {
        logger.info(error, "interaction error");
        await api.interactions.reply(data.id, data.token, {
          content: error.message,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        throw error;
      }
    }
  },
);

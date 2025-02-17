import { GatewayDispatchEvents, MessageFlags } from "@discordjs/core";
import { CreateSurveyCommandData } from "../../interactions/commands/create-survey/data.ts";
import { handleCreateSurveyCommand } from "../../interactions/commands/create-survey/index.ts";
import { EditSurveyCommandData } from "../../interactions/commands/edit-survey/data.ts";
import { handleEditSurveyCommand } from "../../interactions/commands/edit-survey/index.ts";
import { TagPendingCommandData } from "../../interactions/commands/tag-pending/data.ts";
import { handleTagPendingCommand } from "../../interactions/commands/tag-pending/index.ts";
import { EditSurveyComponentInteractionData } from "../../interactions/components/edit-survey/data.ts";
import { handleEditSurveyComponentInteraction } from "../../interactions/components/edit-survey/index.ts";
import { SurveyButtonComponentInteractionData } from "../../interactions/components/survey-button/data.ts";
import { handleSurveyComponentInteraction } from "../../interactions/components/survey-button/index.ts";
import { TagPendingComponentInteractionData } from "../../interactions/components/tag-pending/data.ts";
import { handleTagPendingComponentInteraction } from "../../interactions/components/tag-pending/index.ts";
import { InteractionError } from "../../interactions/error.ts";
import { createEventHandler } from "../index.ts";

export const handleInteractionCreate = createEventHandler(
	GatewayDispatchEvents.InteractionCreate,
	async ({ api, data }, { db, logger }) => {
		try {
			const createSurveyCommandData = CreateSurveyCommandData.safeParse(data);
			if (createSurveyCommandData.success) {
				await handleCreateSurveyCommand(createSurveyCommandData.data, { api, db, logger });
				return;
			}

			const editSurveyCommandData = EditSurveyCommandData.safeParse(data);
			if (editSurveyCommandData.success) {
				await handleEditSurveyCommand(editSurveyCommandData.data, { api, db, logger });
				return;
			}

			const editInformationsComponentInteractionData =
				EditSurveyComponentInteractionData.safeParse(data);
			if (editInformationsComponentInteractionData.success) {
				await handleEditSurveyComponentInteraction(editInformationsComponentInteractionData.data, {
					api,
					db,
					logger,
				});
				return;
			}

			const surveyButtonComponentInteractionData =
				SurveyButtonComponentInteractionData.safeParse(data);
			if (surveyButtonComponentInteractionData.success) {
				await handleSurveyComponentInteraction(surveyButtonComponentInteractionData.data, {
					api,
					db,
					logger,
				});
				return;
			}

			const tagPendingCommandData = TagPendingCommandData.safeParse(data);
			if (tagPendingCommandData.success) {
				await handleTagPendingCommand(tagPendingCommandData.data, { api, db, logger });
				return;
			}

			const tagPendingComponentInteractionData = TagPendingComponentInteractionData.safeParse(data);
			if (tagPendingComponentInteractionData.success) {
				await handleTagPendingComponentInteraction(tagPendingComponentInteractionData.data, {
					api,
					db,
					logger,
				});
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

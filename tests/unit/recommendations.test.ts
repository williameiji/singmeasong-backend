import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { recommendationFactory } from "../factories/recommendationFactory";
import { Console } from "console";
import * as errorUtils from "../../src/utils/errorUtils";
import { Recommendation } from "@prisma/client";
import { deleteAllData } from "../factories/scenarioFactory";

beforeEach(async () => {
	await deleteAllData();
	jest.clearAllMocks();
});

describe("Recommendation service unit test", () => {
	it("test insert", async () => {
		const find = jest
			.spyOn(recommendationRepository, "findByName")
			.mockImplementationOnce(() => {
				return null;
			});

		const created = jest
			.spyOn(recommendationRepository, "create")
			.mockImplementationOnce(async () => {});

		const recommendation = await recommendationFactory();

		await recommendationService.insert(recommendation);

		expect(Console).not.toBe("Recommendations names must be unique");
		expect(find).toHaveBeenCalled();
		expect(created).toHaveBeenCalled();
	});

	it("test insert conflict", async () => {
		const recommendation = await recommendationFactory();

		jest
			.spyOn(recommendationRepository, "findByName")
			.mockResolvedValueOnce({ id: 10, ...recommendation, score: 10 });

		jest
			.spyOn(recommendationRepository, "create")
			.mockImplementationOnce(async () => {});

		jest.spyOn(errorUtils, "conflictError").mockReturnValue({
			type: "conflict",
			message: "Recommendations names must be unique",
		});

		try {
			await recommendationService.insert(recommendation);
		} catch (error) {
			expect(error.message).toBe("Recommendations names must be unique");
		}
	});

	it("test upvote", async () => {
		jest
			.spyOn(recommendationService, "getById")
			.mockImplementationOnce(async (params) => {
				if (params === 1) {
					return {
						id: 1,
						name: "teste",
						youtubeLink: "teste",
						score: 10,
					};
				}
			});

		const find = jest
			.spyOn(recommendationRepository, "find")
			.mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: 11,
			});

		const update = jest
			.spyOn(recommendationRepository, "updateScore")
			.mockImplementationOnce(() => {
				return null;
			});

		const ID = 1;

		await recommendationService.upvote(ID);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
	});

	it("test upvote invalid ID", async () => {
		jest
			.spyOn(recommendationService, "getById")
			.mockImplementationOnce(async (params) => {
				if (params === 1) {
					return null;
				}
			});

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		jest
			.spyOn(errorUtils, "notFoundError")
			.mockReturnValue({ type: "not_found", message: "" });

		const ID = 1;

		try {
			await recommendationService.upvote(ID);
		} catch (error) {
			expect(error.type).toBe("not_found");
		}
	});

	it("test downvote", async () => {
		jest.spyOn(recommendationService, "getById").mockResolvedValueOnce({
			id: 1,
			name: "teste",
			youtubeLink: "teste",
			score: 10,
		});

		const find = jest
			.spyOn(recommendationRepository, "find")
			.mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: 10,
			});

		const update = jest
			.spyOn(recommendationRepository, "updateScore")
			.mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: 4,
			});

		const ID = 1;

		await recommendationService.downvote(ID);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
	});

	it("test downvote invalid ID", async () => {
		jest.spyOn(recommendationService, "getById").mockResolvedValueOnce(null);

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		jest
			.spyOn(errorUtils, "notFoundError")
			.mockReturnValue({ type: "not_found", message: "" });

		const ID = 1;

		try {
			await recommendationService.downvote(ID);
		} catch (error) {
			expect(error.type).toBe("not_found");
		}
	});

	it("test if deletes downvoted -5", async () => {
		jest.spyOn(recommendationService, "getById").mockResolvedValueOnce({
			id: 1,
			name: "teste",
			youtubeLink: "teste",
			score: -5,
		});

		const find = jest
			.spyOn(recommendationRepository, "find")
			.mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: -5,
			});

		const update = jest
			.spyOn(recommendationRepository, "updateScore")
			.mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: -6,
			});

		const deleteRecommendation = jest
			.spyOn(recommendationRepository, "remove")
			.mockImplementationOnce(async () => {});

		const ID = 1;

		await recommendationService.downvote(ID);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
		expect(deleteRecommendation).toHaveBeenCalled();
	});

	it("test get all recommendations", async () => {
		const getAll = jest
			.spyOn(recommendationRepository, "findAll")
			.mockResolvedValueOnce([]);

		const allRecommendations = await recommendationService.get();

		expect(getAll).toHaveBeenCalled();
		expect(allRecommendations).toBeInstanceOf(Array);
	});

	it("test get top recommendations by amount", async () => {
		const recommendation = await recommendationFactory();

		const getByAmount = jest
			.spyOn(recommendationRepository, "getAmountByScore")
			.mockResolvedValueOnce([
				{ id: 1, ...recommendation, score: 10 },
				{ id: 2, ...recommendation, score: 9 },
				{ id: 3, ...recommendation, score: 8 },
			]);

		const AMOUNT = 3;

		const topRecommendations = await recommendationService.getTop(AMOUNT);

		expect(getByAmount).toHaveBeenCalled();
		expect(topRecommendations.length).toBe(AMOUNT);
		expect(topRecommendations).toBeInstanceOf(Array);
		expect(topRecommendations[0].score).toBeGreaterThan(
			topRecommendations[1].score
		);
	});

	it("test get random recommendation", async () => {
		jest
			.spyOn(recommendationService, "getScoreFilter")
			.mockImplementationOnce((params) => {
				if (params < 0.7) {
					return "gt";
				}

				return "lte";
			});
		jest
			.spyOn(recommendationService, "getByScore")
			.mockImplementationOnce(async (params) => {
				return [{ id: 1, name: "teste", youtubeLink: "teste", score: 10 }];
			});

		jest
			.spyOn(recommendationRepository, "findAll")
			.mockResolvedValueOnce([
				{ id: 1, name: "teste", youtubeLink: "teste", score: 10 },
			]);

		const getRandom = await recommendationService.getRandom();

		expect(getRandom).toBeInstanceOf(Object);
	});

	it("test get random recommendation error", async () => {
		jest
			.spyOn(recommendationService, "getScoreFilter")
			.mockImplementationOnce((params) => {
				if (params < 0.7) {
					return "gt";
				}

				return "lte";
			});
		jest
			.spyOn(recommendationService, "getByScore")
			.mockImplementationOnce(async (params) => {
				return [];
			});

		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

		jest
			.spyOn(errorUtils, "notFoundError")
			.mockReturnValue({ type: "not_found", message: "" });

		try {
			await recommendationService.getRandom();
		} catch (error) {
			expect(error.type).toBe("not_found");
		}
	});

	it("test getByScore with params 'gt'", async () => {
		jest
			.spyOn(recommendationRepository, "findAll")
			.mockResolvedValueOnce([
				{ id: 1, name: "teste", youtubeLink: "teste", score: 11 },
			]);

		const FILTER = "gt";

		const recommendation = await recommendationService.getByScore(FILTER);

		expect(recommendation).toBeInstanceOf(Array);
		expect(recommendation.length).toBeGreaterThan(0);
	});

	it("test getScoreFilter expect 'gt'", () => {
		const RANDOM = 0.5;

		const filter = recommendationService.getScoreFilter(RANDOM);

		expect(filter).toBe("gt");
	});

	it("test getScoreFilter expect 'lte'", () => {
		const RANDOM = 0.8;

		const filter = recommendationService.getScoreFilter(RANDOM);

		expect(filter).toBe("lte");
	});
});

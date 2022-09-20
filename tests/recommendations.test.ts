import app from "../src/app";
import supertest from "supertest";
import { prisma } from "../src/database";
import { deleteAllData } from "./factories/scenarioFactory";
import { recommendationFactory } from "./factories/recommendationFactory";
import {
	createScenarioToReturnRecommendations,
	createScenarioToReturnOneRecommendation,
	createScenarioToDeleteWithDownvote,
	createScenarioToRandomRecommendation,
} from "./factories/scenarioFactory";

beforeEach(async () => {
	await deleteAllData();
});

const server = supertest(app);

describe("Test /POST recommendation", () => {
	it("test if it returns 201 and if it was created", async () => {
		const newRecommendation = await recommendationFactory();

		const result = await server
			.post("/recommendations/")
			.send(newRecommendation);

		const isCreated = await prisma.recommendation.findUnique({
			where: { name: newRecommendation.name },
		});

		expect(result.status).toBe(201);
		expect(isCreated).not.toBeNull();
	});

	it("test if it returns 409 if an item with the same name has already been added", async () => {
		const newRecommendation = await recommendationFactory();

		await server.post("/recommendations/").send(newRecommendation);

		const result = await server
			.post("/recommendations")
			.send(newRecommendation);

		expect(result.status).toBe(409);
		expect(result.text).toBe("Recommendations names must be unique");
	});

	it("test returns 422 if it doesn't send a name", async () => {
		const newRecommendation = await recommendationFactory();

		const result = await server
			.post("/recommendations/")
			.send({ ...newRecommendation, name: "" });

		expect(result.status).toBe(422);
	});

	it("test returns 422 if you send an invalid link", async () => {
		const newRecommendation = await recommendationFactory();

		const result = await server
			.post("/recommendations/")
			.send({ ...newRecommendation, youtubeLink: "https://stackoverflow.com" });

		expect(result.status).toBe(422);
	});

	it("test return 422 with empty body", async () => {
		const result = await server.post("/recommendations/").send({});

		expect(result.status).toBe(422);
	});
});

describe("Test /Get recommendations", () => {
	it("test returns 200 and array", async () => {
		await createScenarioToReturnRecommendations();

		const result = await server.get("/recommendations/").send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Array);
		expect(result.body.length).toBeLessThan(11);
	});
});

describe("Test /Get by recommendation id", () => {
	it("returns 200 and array with 1 item with valid id", async () => {
		const recommendation = await createScenarioToReturnOneRecommendation();

		const result = await server
			.get(`/recommendations/${recommendation.id}`)
			.send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Object);
		expect(result.body).toEqual(recommendation);
	});

	it("returns 404 with invalid id", async () => {
		const result = await server.get("/recommendations/99999999999").send();

		expect(result.status).toBe(404);
		expect(result.text).toBe("");
	});
});

describe("Test /Post on recommendations upvote", () => {
	it("returns 200 with valid id and score greater than 0", async () => {
		const recommendation = await createScenarioToReturnOneRecommendation();

		const result = await server
			.post(`/recommendations/${recommendation.id}/upvote`)
			.send();

		const recommendationUpvoted = await prisma.recommendation.findUnique({
			where: { id: recommendation.id },
		});

		expect(result.status).toBe(200);
		expect(recommendationUpvoted.score).toBeGreaterThan(0);
	});

	it("returns 404 with invalid id", async () => {
		const result = await server
			.post("/recommendations/9999999999999999/upvote")
			.send();

		expect(result.status).toBe(404);
		expect(result.text).toBe("");
	});
});

describe("Test /Post on recommendations downvote", () => {
	it("return 200 with valid id and score lower than 0", async () => {
		const recommendation = await createScenarioToReturnOneRecommendation();

		const result = await server
			.post(`/recommendations/${recommendation.id}/downvote`)
			.send();

		const recommendationDownvoted = await prisma.recommendation.findUnique({
			where: { id: recommendation.id },
		});

		expect(result.status).toBe(200);
		expect(recommendationDownvoted.score).toBeLessThan(0);
	});

	it("return 200 with valid id and delete recommendation with less than -5 score", async () => {
		const recommendation = await createScenarioToDeleteWithDownvote();

		const result = await server
			.post(`/recommendations/${recommendation.id}/downvote`)
			.send();

		const isRecommendationDeleted = await prisma.recommendation.findUnique({
			where: { id: recommendation.id },
		});

		expect(result.status).toBe(200);
		expect(isRecommendationDeleted).toBeNull();
	});

	it("returns 404 with invalid id", async () => {
		const result = await server
			.post("/recommendations/99999999999999/downvote")
			.send();

		expect(result.status).toBe(404);
		expect(result.text).toBe("");
	});
});

describe("Test /Get recommendations random", () => {
	it("returns 404 if there is no song", async () => {
		const result = await server.get("/recommendations/random").send();

		expect(result.status).toBe(404);
		expect(result.body).toBeInstanceOf(Object);
	});

	it("returns 200 and a object", async () => {
		await createScenarioToRandomRecommendation();

		const result = await server.get("/recommendations/random").send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Object);
	});
});

describe("Test /Get top recommendations by amount", () => {
	it("returns 200 and array of songs with valid params", async () => {
		await createScenarioToReturnRecommendations();

		const AMOUNT = 5;

		const result = await server.get(`/recommendations/top/${AMOUNT}`).send();

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Array);
	});

	it("returns 500 with invalid params", async () => {
		await createScenarioToReturnRecommendations();

		const AMOUNT = "teste";

		const result = await server.get(`/recommendations/top/${AMOUNT}`).send();

		expect(result.status).toBe(500);
	});

	it("returns 200 and array in the correct order", async () => {
		await createScenarioToReturnRecommendations();

		const AMOUNT = 4;

		const result = await server.get(`/recommendations/top/${AMOUNT}`).send();

		let isFirstItemHighScore = false;

		if (result.body[0].score > result.body[1].score) {
			isFirstItemHighScore = true;
		}

		expect(result.status).toBe(200);
		expect(result.body).toBeInstanceOf(Array);
		expect(isFirstItemHighScore).toBe(true);
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});

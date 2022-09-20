import app from "../src/app";
import supertest from "supertest";
import { prisma } from "../src/database";
import { deleteAllData } from "./factories/scenarioFactory";
import { recommendationFactory } from "./factories/recommendationFactory";
import {
	createScenarioToReturnRecommendations,
	createScenarioToReturnOneRecommendation,
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
		expect(result.body.length).not.toBeGreaterThan(10);
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
});

afterAll(async () => {
	await prisma.$disconnect();
});

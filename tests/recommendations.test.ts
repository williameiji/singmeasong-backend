import app from "../src/app";
import supertest from "supertest";
import { prisma } from "../src/database";
import { deleteAllData } from "./factories/scenarioFactory";
import { recommendationFactory } from "./factories/recommendationFactory";

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

	it("test if it returns 422 if it doesn't send a name", async () => {
		const newRecommendation = await recommendationFactory();

		const result = await server
			.post("/recommendations/")
			.send({ ...newRecommendation, name: "" });

		expect(result.status).toBe(422);
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});
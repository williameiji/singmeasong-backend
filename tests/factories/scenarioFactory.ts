import { prisma } from "../../src/database";
import { recommendationFactory } from "./recommendationFactory";
import { faker } from "@faker-js/faker";

export async function deleteAllData() {
	await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

export async function createScenarioToReturnRecommendations() {
	const numberOfRecommendations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

	for await (const recommendation of numberOfRecommendations) {
		const newRecommendation = await recommendationFactory();

		await prisma.recommendation.create({
			data: { ...newRecommendation, score: Number(faker.random.numeric(3)) },
		});
	}
}

export async function createScenarioToReturnOneRecommendation() {
	const newRecommendation = await recommendationFactory();

	const result = await prisma.recommendation.create({
		data: newRecommendation,
	});

	return result;
}

export async function createScenarioToDeleteWithDownvote() {
	const recommendation = await recommendationFactory();

	const result = await prisma.recommendation.create({
		data: { ...recommendation, score: -5 },
	});

	return result;
}

export async function createScenarioToRandomRecommendation() {
	const recommendationHighScore = await recommendationFactory();
	const recommendationLowScore = await recommendationFactory();

	await prisma.recommendation.create({
		data: { ...recommendationHighScore, score: 200 },
	});

	await prisma.recommendation.create({
		data: { ...recommendationLowScore, score: 5 },
	});
}

import { prisma } from "../database.js";
import { faker } from "@faker-js/faker";

export async function truncate() {
	await prisma.$queryRaw`TRUNCATE TABLE recommendations;`;
}

export async function createTopRecommendations() {
	const numberOfRecommendations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

	for await (const recommendation of numberOfRecommendations) {
		const newRecommendation = {
			name: faker.lorem.words(),
			youtubeLink: "https://www.youtube.com/watch?v=EiVWPgroGso",
		};

		await prisma.recommendation.create({
			data: { ...newRecommendation, score: Number(faker.random.numeric(3)) },
		});
	}
}

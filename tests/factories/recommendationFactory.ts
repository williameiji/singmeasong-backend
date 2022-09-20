import { faker } from "@faker-js/faker";

export async function recommendationFactory() {
	return {
		name: faker.lorem.words(),
		youtubeLink: "https://www.youtube.com/watch?v=EiVWPgroGso",
	};
}

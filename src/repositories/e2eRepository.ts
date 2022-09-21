import { prisma } from "../database.js";

export async function truncate() {
	await prisma.$queryRaw`TRUNCATE TABLE recommendations;`;
}

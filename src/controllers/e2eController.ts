import { Request, Response } from "express";
import * as e2eService from "../services/e2eService.js";

export async function truncate(req: Request, res: Response) {
	await e2eService.truncate();

	res.sendStatus(202);
}

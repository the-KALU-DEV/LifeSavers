import { Request, Response } from "express";
import { sendWhatsappMessage, startBot } from "../services/server/bot.service";
import { verifyMedia } from "../utils/helpers/media.validator";

export async function handleIncomingMessage(req: Request, res: Response) {
    try {
        // console.log('Webhook received:', {
        //     headers: req.headers,
        //     body: req.body,
        //     query: req.query
        // });

        res.sendStatus(200);

        const from = req.body.From;
        const finalBody = verifyMedia(req);

        console.log("Received message:", {
            from,
            body: finalBody,
        });

        if (!from || !finalBody) {
            console.warn("Missing from or body in request");
            return;
        }

        await startBot(from, finalBody); 

    } catch (err) {
        console.error("Error handling message:", err);
        if (!res.headersSent) {
            res.sendStatus(500);
        }
    }
}

export async function sendMessage(req: Request, res: Response) {
    try {
        const from = req.body.from;
        const message = req.body.message?.trim();

        await sendWhatsappMessage(from, message);

        res.sendStatus(200);
    } catch (err) {
        console.error("Error handling message:", err);
        res.sendStatus(500);
    }
}
import { Request, Response } from "express";
import { sendWhatsappMessage } from "../services/server/registration.service";
import { startBot } from "../services/server/bot.service";

export async function handleIncomingMessage(req: Request, res: Response) {
    try {
        // console.log('Webhook received:', {
        //     headers: req.headers,
        //     body: req.body,
        //     query: req.query
        // });

        res.sendStatus(200);

        const from = req.body.From;
        const body = req.body.Body?.trim();

        const mediaUrl = req.body.MediaUrl0;
        const numMedia = parseInt(req.body.NumMedia) || 0;

        console.log('Received message:', { 
            from, 
            body,
            mediaUrl,
            numMedia 
        });

        if (!from) {
            console.warn('Missing from in request');
            return;
        }

        if (numMedia > 0 && mediaUrl) {
            await startBot(from, "", mediaUrl); // pass text as empty, and mediaUrl separately
        } else if (body) {
            await startBot(from, body, null);
        }

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
const User = require("../models/User");
import { Request, Response } from "express";

interface RegisterUserRequestBody {
  name: string;
  email: string;
  password: string;
  role: string;
}

const registerUser = async (
  req: Request<{}, {}, RegisterUserRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser };

import { AppDataSource } from "./_helpers/data-source";
import { User } from "./entity/User";
import Joi from "joi";
import bcrypt from "bcrypt";
import { Role } from "./_helpers/role";

import express, { Request, Response } from "express";
const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await AppDataSource.manager.find(User);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ message: "List of users", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const userID = Number(req.params.id);

    if (isNaN(userID)) {
      return res.status(400).json({ msg: "invalid user id" });
    }

    const user = await AppDataSource.manager.findOneBy(User, {
      id: userID,
    });

    if (!user) {
      return res.status(404).json({ msg: `user id: ${userID} cant be found` });
    }

    return res.status(200).json({ msg: "User found", user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

userRouter.post("/users", async (req: Request, res: Response) => {
  try {
    const { error, value } = createSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((x) => x.message) });
    }

    const { firstName, lastName, title, email, role, password } = value;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create({
      firstName,
      lastName,
      title,
      email,
      role,
      hashedPassword,
    });
    await userRepository.save(newUser);

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userID = Number(req.params.id);

    if (isNaN(userID)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const userToUpdate = await userRepository.findOneBy({ id: userID });

    if (!userToUpdate) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Validate input
    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((x) => x.message) });
    }

    const { name, email, password } = value;
    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update only the provided fields
    Object.assign(userToUpdate, {
      name,
      email,
      ...(password ? { password: hashedPassword } : {}),
    });

    const user = await userRepository.save(userToUpdate);

    return res
      .status(200)
      .json({ message: `User ${userID} updated successfully` });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepository.remove(user);

    res.status(200).json({ message: "User has been removed" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const createSchema = Joi.object({
  title: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid(Role.Admin, Role.User).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

const updateSchema = Joi.object({
  title: Joi.string().empty(""),
  firstName: Joi.string().empty(""),
  lastName: Joi.string().empty(""),
  email: Joi.string().email().empty(""),
  role: Joi.string().valid(Role.Admin, Role.User).empty(""),
  password: Joi.string().min(6).empty(""),
  confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
}).with("password", "confirmPassword");

export default userRouter;
